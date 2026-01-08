"""题目生成服务函数

包含题目处理和 prompt 构建等功能
"""

import secrets
from typing import Any, Dict, List

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.database import Question, QuestionType
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
            raise ValueError(f"questions 字段格式错误，期望列表类型，实际为: {type(result['questions']).__name__}")
    # 情况2: 单个题目对象格式（LLM 可能只返回一道题目，字段名可能是 question 而不是 stem）
    elif isinstance(result, dict) and ("question" in result or "stem" in result or "options" in result):
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
    elif "question" in normalized:
        # 如果只有 question 字段，映射到 stem
        question_value = normalized.pop("question")
        if isinstance(question_value, str):
            normalized["stem"] = {"text": question_value}
        elif isinstance(question_value, dict):
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
                    {"id": chr(65 + i), "text": opt} if isinstance(opt, str) else opt for i, opt in enumerate(options)
                ]
                logger.debug(f"已将 options 从字符串列表转换为字典列表: {len(normalized['options'])} 个选项")

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
                        logger.debug(f"根据 position={position} 推断 resource_type={resource['resource_type']}")

                    # 验证选项资源包含 option_id
                    if resource.get("resource_type") == "option":
                        if "option_id" not in resource or not resource.get("option_id"):
                            logger.warning(f"选项资源缺少 option_id 字段，资源ID: {resource.get('id', 'unknown')}")
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
) -> list[Question]:
    """将 LLM 返回的题目转换为 Question 对象并保存到数据库（is_active=0）

    Args:
        db: 数据库会话
        question_type: 题目类型对象
        llm_questions: LLM 返回的题目列表

    Returns:
        list[Question]: Question 对象列表
    """
    questions = []

    # 获取年级（从 QuestionType 的 grades 列表中取第一个）
    grade = question_type.grades[0] if question_type.grades else 1

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

        # 验证和规范化资源
        if item.resources:
            validated_resources = []
            for resource in item.resources:
                if not isinstance(resource, dict):
                    logger.warning(f"资源格式错误，跳过: {resource}")
                    continue

                # 确保 resource_type 存在
                if "resource_type" not in resource:
                    # 根据 position 推断（兼容性处理）
                    position = resource.get("position", "stem")
                    resource["resource_type"] = "option" if position == "option" else "stem"

                resource_type = resource.get("resource_type")

                # 验证选项资源
                if resource_type == "option":
                    if "option_id" not in resource or not resource.get("option_id"):
                        logger.warning(f"选项资源缺少 option_id，跳过资源: {resource.get('id', 'unknown')}")
                        continue

                    # 验证选项资源类型限制（只支持 image 和 audio）
                    resource_type_value = resource.get("type", "")
                    if resource_type_value not in ["image", "audio"]:
                        logger.warning(
                            f"选项资源类型不支持 {resource_type_value}，只支持 image 和 audio，跳过资源: {resource.get('id', 'unknown')}"
                        )
                        continue

                validated_resources.append(resource)

            # 更新资源列表
            item.resources = validated_resources if validated_resources else None

        # 直接映射字段到 Question 对象
        question_obj = Question(
            id=secrets.token_hex(16),
            question_type_id=question_type.id,
            question_type_code=question_type.code,
            subject=question_type.subject,
            grade=grade,
            stage=grade_to_stage(grade),
            stem=item.stem,
            options=item.options,
            blanks=item.blanks,
            resources=item.resources,
            answer=item.answer,
            explanation=item.explanation,
            difficulty=item.difficulty,
            cognitive_level=item.cognitive_level,
            knowledge_points=item.knowledge_points,
            ability_tags=item.ability_tags,
            source="ai",
            is_active=False,  # 生成的题目默认不激活
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
    """
    # 直接使用 QuestionType 的 ai_prompt 字段，如果为空则抛出错误
    prompt_template = question_type.ai_prompt
    if not prompt_template:
        raise ValueError(f"题目类型的 ai_prompt 不能为空: code={question_type.code}")

    prompt = ChatPromptTemplate.from_template(prompt_template)

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
