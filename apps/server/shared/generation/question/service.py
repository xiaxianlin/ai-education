"""题目生成服务函数

包含题目处理和 prompt 构建等功能
"""

import secrets
from typing import Any, Dict, List

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.database import Question, QuestionType
from shared.generation import invoke_question_audio_workflow, invoke_question_image_workflow
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import GeneratedQuestion, QuestionGenerationResult


def grade_to_stage(grade: int) -> str:
    """根据年级计算学段"""
    if grade <= 3:
        return "primary_low"
    elif grade <= 6:
        return "primary_high"
    elif grade <= 9:
        return "junior"
    return "senior"


def get_llm_temperature(loop_count: int, unique_questions_count: int, count: int) -> float:
    """根据循环次数和生成进度动态计算 LLM 温度参数

    Args:
        loop_count: 当前循环次数
        unique_questions_count: 已生成的唯一题目数量
        count: 目标生成数量

    Returns:
        float: 温度参数，范围 [0.7, 1.0]
    """
    # 基础温度
    base_temperature = 0.7

    # 如果循环次数较多，逐步提高温度
    if loop_count >= 5:
        temperature = min(1.0, base_temperature + 0.2)  # 最高 1.0
    elif loop_count >= 3:
        temperature = base_temperature + 0.15  # 0.85
    elif loop_count >= 1:
        temperature = base_temperature + 0.1  # 0.8
    else:
        temperature = base_temperature  # 0.7

    # 如果已有题目数量接近目标但仍有差距，进一步提高温度
    if unique_questions_count > 0 and unique_questions_count < count:
        progress_ratio = unique_questions_count / count
        if progress_ratio < 0.5:  # 进度不足 50%
            temperature = min(1.0, temperature + 0.1)

    return temperature


def format_llm_questions(result: Any) -> List[dict]:
    """格式化 LLM 返回的题目结果，统一转换为题目列表格式

    支持以下格式：
    1. 标准格式：{"questions": [...]}
    2. 单个题目对象：{"question": "...", "options": [...], ...}
    3. 直接列表：[{...}, {...}]

    Args:
        result: LLM 返回的原始结果

    Returns:
        List[dict]: 格式化后的题目列表

    Raises:
        ValueError: 如果无法从结果中提取题目列表
    """
    questions_list = None

    # 情况1: 标准格式，包含 questions 数组
    if "questions" in result:
        if isinstance(result["questions"], list):
            questions_list = result["questions"]
            logger.debug(f"使用标准格式: questions 数组，数量={len(questions_list)}")
        else:
            raise ValueError(
                f"questions 字段格式错误，期望列表类型，实际为: {type(result['questions']).__name__}"
            )
    # 情况2: 单个题目对象格式（LLM 可能只返回一道题目，字段名可能是 question 而不是 stem）
    elif isinstance(result, dict) and (
        "question" in result or "stem" in result or "options" in result
    ):
        logger.warning("LLM 返回的是单个题目对象，将其包装成数组并尝试字段映射")
        # 检查字段映射：如果返回的是 question 字段，需要映射到 stem
        single_question = dict(result)
        if "question" in single_question and "stem" not in single_question:
            # 将 question 字段映射到 stem（如果 question 是字符串，包装成 dict）
            question_value = single_question.pop("question")
            if isinstance(question_value, str):
                single_question["stem"] = {"text": question_value}
            elif isinstance(question_value, dict):
                single_question["stem"] = question_value
            else:
                single_question["stem"] = {"text": str(question_value)}
            logger.debug("已将 question 字段映射到 stem")
        questions_list = [single_question]
    else:
        # 情况3: 可能是解析失败，result 本身就是题目列表
        if isinstance(result, list):
            logger.warning("LLM 直接返回了题目列表，使用该列表")
            questions_list = result
        else:
            raise ValueError(
                f"LLM 返回结果格式不正确。期望包含 'questions' 字段的对象，或单个题目对象，或题目列表。"
                f"实际返回的 keys: {list(result.keys()) if isinstance(result, dict) else type(result).__name__}"
            )

    if not questions_list:
        raise ValueError("无法从 LLM 返回结果中提取题目列表")

    return questions_list


def normalize_llm_question(question: dict) -> dict:
    """规范化 LLM 返回的题目格式，转换为符合 GeneratedQuestion 模型的格式

    Args:
        question: LLM 返回的原始题目字典

    Returns:
        dict: 规范化后的题目字典
    """
    normalized = dict(question)

    # 1. 处理 stem 字段：如果是字符串，转换为字典格式
    if "stem" in normalized:
        if isinstance(normalized["stem"], str):
            normalized["stem"] = {"text": normalized["stem"]}
        elif isinstance(normalized["stem"], dict):
            # 如果 stem 内部包含 resources，需要提取到题目顶层
            if "resources" in normalized["stem"]:
                stem_resources = normalized["stem"].pop("resources")
                if stem_resources and isinstance(stem_resources, list):
                    # 合并到题目顶层的 resources
                    if "resources" not in normalized or normalized["resources"] is None:
                        normalized["resources"] = []
                    normalized["resources"].extend(stem_resources)
                    logger.debug(
                        f"已将 stem 中的 resources 提取到顶层，数量: {len(stem_resources)}"
                    )
    elif "question" in normalized:
        # 如果只有 question 字段，映射到 stem
        question_value = normalized.pop("question")
        if isinstance(question_value, str):
            normalized["stem"] = {"text": question_value}
        elif isinstance(question_value, dict):
            # 如果 question 字段是 dict 且包含 resources，需要提取到题目顶层
            if "resources" in question_value:
                q_resources = question_value.pop("resources")
                if q_resources and isinstance(q_resources, list):
                    if "resources" not in normalized or normalized["resources"] is None:
                        normalized["resources"] = []
                    normalized["resources"].extend(q_resources)
                    logger.debug(
                        f"已将 question 中的 resources 提取到顶层，数量: {len(q_resources)}"
                    )
            normalized["stem"] = question_value
        else:
            normalized["stem"] = {"text": str(question_value)}

    # 2. 处理 options 字段：如果是字符串列表，转换为字典列表
    if "options" in normalized and normalized["options"] is not None:
        options = normalized["options"]
        if isinstance(options, list) and len(options) > 0:
            # 检查第一个元素是否是字符串
            if isinstance(options[0], str):
                # 转换为字典格式：{"id": "A", "text": "选项内容"}
                normalized["options"] = [
                    {"id": chr(65 + i), "text": opt} if isinstance(opt, str) else opt
                    for i, opt in enumerate(options)
                ]
                logger.debug(
                    f"已将 options 从字符串列表转换为字典列表: {len(normalized['options'])} 个选项"
                )

    # 3. 处理 answer 字段：如果是字符串，转换为字典格式
    # 先检查是否有 correct_answer 字段（LLM 可能使用这个字段名）
    if "correct_answer" in normalized and "answer" not in normalized:
        normalized["answer"] = normalized.pop("correct_answer")
        logger.debug("已将 correct_answer 字段映射到 answer")

    if "answer" in normalized:
        answer = normalized["answer"]
        if isinstance(answer, str):
            # 转换为标准答案格式
            normalized["answer"] = {"type": "exact", "correct_answers": [answer]}
            logger.debug(f"已将 answer 从字符串转换为字典格式: {answer}")
        elif isinstance(answer, list):
            # 如果是列表，转换为字典格式
            normalized["answer"] = {"type": "exact", "correct_answers": answer}

    # 4. 处理 difficulty 字段：如果缺失，设置默认值
    if "difficulty" not in normalized or not normalized.get("difficulty"):
        normalized["difficulty"] = "medium"
        logger.debug("已设置默认 difficulty: medium")

    # 5. 处理 resources 字段：确保包含 resource_type，并处理兼容性
    if "resources" in normalized and normalized["resources"] is not None:
        resources = normalized["resources"]
        if isinstance(resources, list):
            for resource in resources:
                if isinstance(resource, dict):
                    # 如果缺少 resource_type，根据 position 字段推断（向后兼容）
                    if "resource_type" not in resource:
                        position = resource.get("position", "stem")
                        if position == "option":
                            resource["resource_type"] = "option"
                        else:
                            resource["resource_type"] = "stem"
                        logger.debug(
                            f"根据 position={position} 推断 resource_type={resource['resource_type']}"
                        )

                    # 验证选项资源包含 option_id
                    if resource.get("resource_type") == "option":
                        if "option_id" not in resource or not resource.get("option_id"):
                            logger.warning(
                                f"选项资源缺少 option_id 字段，资源ID: {resource.get('id', 'unknown')}"
                            )
                            # 尝试从 position 或其他字段推断，如果无法推断则跳过该资源
                            # 这里可以选择跳过或设置默认值，根据实际需求决定

                    # 确保 position 字段存在（向后兼容）
                    if "position" not in resource:
                        resource_type = resource.get("resource_type", "stem")
                        resource["position"] = "option" if resource_type == "option" else "stem"

    return normalized


def handle_llm_questions(
    db: AsyncSession,
    question_type: QuestionType,
    llm_questions: list[dict],
    grade: int,
) -> list[Question]:
    """将 LLM 返回的题目转换为 Question 对象并保存到数据库

    Args:
        db: 数据库会话
        question_type: 题目类型对象
        llm_questions: LLM 返回的题目列表
        grade: 年级（从调用方传入，因为 question_type.grades 字段已删除）

    Returns:
        list[Question]: Question 对象列表
    """
    questions = []

    for question in llm_questions:
        if not isinstance(question, dict):
            logger.warning(f"题目项类型错误: {type(question)}, 跳过处理")
            continue

        # 先规范化格式
        try:
            normalized_question = normalize_llm_question(question)
        except Exception as e:
            logger.warning(f"题目格式规范化失败: {e}, 原始数据: {question}, 跳过处理")
            continue

        # 再验证格式
        try:
            item = GeneratedQuestion.model_validate(normalized_question)
        except Exception as e:
            logger.warning(f"题目验证失败: {e}, 规范化后的数据: {normalized_question}, 跳过处理")
            continue

        # 构建 content JSON 结构
        content = {}
        
        # 处理 stem：可能是字符串或字典
        if item.stem:
            if isinstance(item.stem, dict):
                # stem 是字典，提取 text 和其他字段
                stem_text = item.stem.get("text", "")
                content["stem"] = stem_text if stem_text else str(item.stem)
                # 如果 stem 中有其他字段（如 rich_text, hints），需要处理
                # 但根据 ContentSchema，stem 应该是字符串，所以这里简化处理
            else:
                content["stem"] = str(item.stem)
        else:
            content["stem"] = ""

        # 处理 resource：从 resources 中提取题干资源
        if item.resources:
            # 分离题干资源和选项资源
            stem_resources = [r for r in item.resources if r.get("resource_type") != "option"]
            if stem_resources:
                # ContentSchema 中 resource 是单个 ResourceSchema，取第一个
                stem_resource = stem_resources[0]
                content["resource"] = {
                    "type": stem_resource.get("type", "image"),
                    "url": stem_resource.get("url", ""),
                    "alt": stem_resource.get("alt"),
                }

        # 处理 options
        if item.options:
            content["options"] = item.options

        # 处理 sub_questions（复合题）
        if item.stem and isinstance(item.stem, dict) and "sub_questions" in item.stem:
            # TODO: 需要确认 sub_questions 的结构
            content["sub_questions"] = item.stem.get("sub_questions")

        # 构建 Question 对象
        question_obj = Question(
            id=secrets.token_hex(16),
            question_type_code=question_type.code,
            subject=question_type.subject,
            grade=grade,
            content=content,
            answer=item.answer,
            explanation=item.explanation,
        )

        questions.append(question_obj)

    # 批量添加到数据库（但不立即提交，由调用方控制）
    db.add_all(questions)

    return questions


async def build_question_generation_prompt(
    question_type: QuestionType,
    count: int,
) -> Dict[str, Any]:
    """构建题目生成的 prompt

    Args:
        question_type: 题目类型对象
        count: 需要生成的数量

    Returns:
        Dict[str, Any]: 包含 prompt, prompt_input, prompt_parser 的字典

    Raises:
        ValueError: prompt 功能已移除，该函数不再可用
    """
    # prompt 功能已移除，不再支持从 QuestionType 获取 prompt
    raise ValueError(
        f"题目生成 prompt 功能已移除。题型: {question_type.code}。"
        "请使用其他方式生成题目。"
    )

    # 构建 JSON 输出解析器
    prompt_parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = prompt_parser.get_format_instructions()
    prompt = prompt.partial(format_instructions=format_instructions)

    # 构建 prompt 输入参数
    prompt_input = {
        "count": count,
        "format_instructions": format_instructions,
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "prompt_parser": prompt_parser,
    }


async def generate_question_resource(question: Question, resource: dict) -> dict:
    """生成单个题目资源

    Args:
        question: 题目对象
        resource: 资源定义字典

    Returns:
        dict: 更新后的资源字典（包含 url 字段）

    Raises:
        ValueError: 如果资源类型不支持或缺少必要字段
    """
    if not isinstance(resource, dict):
        raise ValueError(f"资源格式错误，必须是字典类型: {type(resource)}")

    resource_type = resource.get("type")
    resource_path = f"question/{question.id}/{resource.get('resource_type', 'stem')}"
    new_resource = dict(resource)  # 创建新字典对象，避免修改原对象

    # 生成图片资源
    if resource_type == "image":
        if not resource.get("image_prompt"):
            raise ValueError(
                f"图片资源缺少 image_prompt 字段: resource_id={resource.get('id', 'unknown')}"
            )

        oss_path = f"{resource_path}/{resource['id']}.png"
        await invoke_question_image_workflow(prompt=resource["image_prompt"], oss_path=oss_path)
        new_resource["url"] = oss_path
        logger.debug(f"图片资源生成成功: question_id={question.id}, path={oss_path}")

    # 生成音频资源
    elif resource_type == "audio":
        if not resource.get("text"):
            raise ValueError(f"音频资源缺少 text 字段: resource_id={resource.get('id', 'unknown')}")

        oss_path = f"{resource_path}/{resource['id']}.mp3"
        # 根据题目科目确定语言
        language = "Chinese" if question.subject == "英语" else "English"
        await invoke_question_audio_workflow(
            text=resource["text"], language=language, oss_path=oss_path
        )
        new_resource["url"] = oss_path
        logger.debug(f"音频资源生成成功: question_id={question.id}, path={oss_path}")

    else:
        raise ValueError(
            f"不支持的资源类型: {resource_type}, resource_id={resource.get('id', 'unknown')}"
        )

    return new_resource


async def generate_question_resources(question: Question) -> List[dict]:
    """为单个题目生成所有资源

    Args:
        question: 题目对象

    Returns:
        List[dict]: 更新后的资源列表（包含 url 字段）

    Raises:
        ValueError: 如果题目没有资源定义
    """
    content = question.content or {}
    # 从 content 中获取资源：可能在 content.resource（单个）或 content.stem.resource 中
    resources = []
    if "resource" in content:
        resources.append(content["resource"])
    elif "stem" in content and isinstance(content["stem"], dict) and "resource" in content["stem"]:
        resources.append(content["stem"]["resource"])

    if not resources:
        logger.debug(f"题目 {question.id} 没有资源定义，跳过资源生成")
        return []

    new_resources = []
    for resource in resources:
        try:
            updated_resource = await generate_question_resource(question, resource)
            new_resources.append(updated_resource)
        except Exception as e:
            logger.warning(
                f"资源生成失败: question_id={question.id}, resource_id={resource.get('id', 'unknown')}, "
                f"error={type(e).__name__}: {str(e)}"
            )
            # 资源生成失败不影响其他资源，继续处理
            # 保留原始资源（不包含 url）
            new_resources.append(dict(resource))

    return new_resources
