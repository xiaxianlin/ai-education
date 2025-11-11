from typing import List, Dict, Any
import requests
import os
import json
import asyncio
from pathlib import Path

from loguru import logger
from pydantic import BaseModel, Field, TypeAdapter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.constants import get_question_types, get_question_subtypes
from core.database import Knowledge, Question, Textbook, Unit
from core.settings import envs

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

from shared.ai.prompts.question import (
    GENERIC_UNIT_PROMPT,
    DAILY_PRACTICE_PROMPT,
    ASSESSMENT_GENERATION_PROMPT,
    get_prompt_by_subject,
)
from shared.ai.services.aliyun import AliyunAIService
from shared.ai.services.prompt import PromptOptimizationService
from shared.provider.aliyun import AliyunOSS
from shared.utils.time import now
from shared.utils.question import build_full_question_text


class QuestionOption(BaseModel):
    label: str = Field(description="选项标签，如 A/B/C/D")
    text: str = Field(description="选项内容")


class GeneratedQuestion(BaseModel):
    question_type: str = Field(description="题型（主类型）")
    question_subtype: str = Field(description="题目子类型", default="")
    question: str = Field(description="题干内容")
    resource_content: str = Field(description="资源内容（录音文本等，仅录音题需要）", default="")
    options: List[QuestionOption] = Field(description="题目选项列表，非选择题时可为空数组", default=[])
    answer: str = Field(description="标准答案")
    difficulty: str = Field(description="题目难度：简单、普通、困难")
    knowledge: str = Field(description="知识点")


class QuestionGenerationResult(BaseModel):
    questions: List[GeneratedQuestion] = []


async def validate_question_params(unit_id: int, count: int) -> Dict[str, Any]:
    """检查问题生成参数，失败直接退出"""
    if count <= 0:
        raise ValueError("生成题目的数量必须大于 0")

    return {"unit_id": unit_id, "count": count}


async def load_unit_data(db: AsyncSession, unit_id: int) -> Dict[str, Any]:
    """加载单元相关数据"""
    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
    if not unit:
        raise ValueError("课程单元不存在")

    textbook = await db.scalar(select(Textbook).where(Textbook.id == unit.textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

    knowledge_rows = await db.scalars(select(Knowledge).where(Knowledge.unit_id == unit_id).order_by(Knowledge.id))
    knowledge_list = knowledge_rows.all()

    knowledge_lines = []
    knowledge_names = []
    for item in knowledge_list:
        snippet = item.content.strip() if item.content else ""
        if len(snippet) > 200:
            snippet = snippet[:200] + "..."
        knowledge_lines.append(f"- {item.name}: {snippet}")
        knowledge_names.append(item.name)

    knowledge_text = "\n".join(knowledge_lines) if knowledge_lines else "(未提供知识点)"
    knowledge_names = "、".join(knowledge_names) if knowledge_names else ""

    return {
        "unit": unit,
        "textbook": textbook,
        "knowledge_text": knowledge_text,
        "knowledge_names": knowledge_names,
    }


def _build_common_prompt_inputs(
    params: Dict[str, Any],
) -> tuple[Dict[str, Any], JsonOutputParser]:
    """
    构建题目生成所需的公共输入内容，并返回对应的解析器
    """
    unit = params["unit"]
    textbook = params["textbook"]
    knowledge_text = params["knowledge_text"]
    count = params["count"]

    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    question_types = get_question_types(textbook.subject, textbook.grade)
    if not question_types:
        raise ValueError(
            f"科目 {textbook.subject} 的 {textbook.grade} 年级暂不支持题目生成。" f"目前仅支持一年级的英语和数学。"
        )

    question_types_str = "、".join(question_types)

    subtype_info_lines = []
    for qtype in question_types:
        subtypes = get_question_subtypes(qtype)
        if subtypes:
            subtype_info_lines.append(f"{qtype}：{'、'.join(subtypes)}")
    subtype_info = "\n".join(subtype_info_lines) if subtype_info_lines else "无子类型要求"

    prompt_input = {
        "subject": textbook.subject,
        "grade": textbook.grade,
        "semester": textbook.semester,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "unit_name": unit.name,
        "unit_summary": unit.content or "",
        "knowledge_text": knowledge_text,
        "count": count,
        "format_instructions": format_instructions,
    }

    return prompt_input, parser


async def generate_prompt(params: Dict[str, Any]) -> Dict[str, Any]:
    """根据生成类型选择合适的 prompt 生成器"""
    generation_type = params.get("generation_type", "unit")
    builder = PROMPT_BUILDERS.get(generation_type)

    if builder is None:
        logger.warning("未知的题目生成类型: %s，回退到 unit 生成逻辑", generation_type)
        builder = PROMPT_BUILDERS["unit"]

    result = await builder(params)
    result["generation_type"] = generation_type
    return result


async def call_llm(params: Dict[str, Any]) -> Dict[str, Any]:
    """调用大模型结构化输出内容，内容为数组"""
    prompt = params["prompt"]
    prompt_input = params["prompt_input"]
    parser = params["parser"]

    llm = ChatOpenAI(
        model_name="qwen3-max",
        temperature=0.7,
        openai_api_key=envs.AI_PLATFORM_KEY,
        openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    chain = prompt | llm | parser

    try:
        result = chain.invoke(prompt_input)
    except Exception as e:
        logger.error(f"LLM 调用失败: {e}")
        raise ValueError(f"大模型调用失败: {str(e)}")

    # 检查结果是否为 None
    if result is None:
        logger.error("LLM 返回结果为 None")
        raise ValueError("大模型返回结果为空，请检查 prompt 或重试")

    # 确保 result 是字典类型
    if not isinstance(result, dict):
        logger.error(f"LLM 返回结果类型错误: {type(result)}, 内容: {result}")
        raise ValueError(f"大模型返回结果格式错误，期望字典类型，实际为: {type(result).__name__}")

    # 处理 knowledge 字段：如果 LLM 返回的是列表，转换为字符串
    if "questions" in result:
        # 确保 questions 是列表
        if not isinstance(result["questions"], list):
            logger.error(f"questions 字段类型错误: {type(result['questions'])}")
            raise ValueError(f"questions 字段格式错误，期望列表类型，实际为: {type(result['questions']).__name__}")

        for question in result["questions"]:
            if not isinstance(question, dict):
                logger.warning(f"题目项类型错误: {type(question)}, 跳过处理")
                continue

            if "knowledge" in question and isinstance(question["knowledge"], list):
                # 将列表转换为字符串，用顿号分隔
                question["knowledge"] = "、".join(str(k) for k in question["knowledge"])
            elif "knowledge" in question and not isinstance(question["knowledge"], str):
                # 如果不是字符串也不是列表，转换为字符串
                question["knowledge"] = str(question["knowledge"]) if question["knowledge"] else ""
            elif "knowledge" not in question:
                # 如果没有 knowledge 字段，设置为空字符串
                question["knowledge"] = ""
    else:
        logger.warning("LLM 返回结果中没有 questions 字段，尝试创建空列表")
        result["questions"] = []

    # 验证并转换结果
    try:
        validated_result = QuestionGenerationResult.model_validate(result)
    except Exception as e:
        logger.error(f"结果验证失败: {e}, 原始结果: {result}")
        raise ValueError(f"题目生成结果验证失败: {str(e)}，请检查 prompt 或重试")

    return {
        "generated_questions": validated_result.questions,
    }


async def convert_to_question_objects(params: Dict[str, Any]) -> Dict[str, Any]:
    """将内容转换成 Question 数组，并根据问题类型分流"""
    generated_questions: List[GeneratedQuestion] = params["generated_questions"]
    textbook = params["textbook"]
    unit = params["unit"]

    questions: List[Question] = []
    image_questions: List[Question] = []
    audio_questions: List[Question] = []
    text_questions: List[Question] = []

    # 根据科目和年级获取对应的题型
    question_types = get_question_types(textbook.subject, textbook.grade)

    # 验证题型列表不为空（虽然 generate_prompt 已经验证过，但这里再次验证以确保安全）
    if not question_types:
        raise ValueError(
            f"科目 {textbook.subject} 的 {textbook.grade} 年级暂不支持题目生成。" f"目前仅支持一年级的英语和数学。"
        )

    for item in generated_questions:
        question_type = item.question_type
        if question_type not in question_types:
            logger.warning(
                f"生成的题型 {question_type} 不在预期列表中（科目: {textbook.subject}, 年级: {textbook.grade}），"
                f"将使用默认题型 {question_types[0]}"
            )
            question_type = question_types[0]

        # 获取子类型，如果为空字符串则设为 None
        question_subtype = getattr(item, "question_subtype", None)
        if question_subtype and question_subtype.strip():
            question_subtype = question_subtype.strip()
        else:
            question_subtype = None

        # 获取 resource_content，如果为空字符串则设为 None
        resource_content = getattr(item, "resource_content", None)
        if resource_content and resource_content.strip():
            resource_content = resource_content.strip()
        else:
            resource_content = None

        question = Question(
            subject=textbook.subject,
            grade=textbook.grade,
            type=question_type,
            subtype=question_subtype,
            content=item.question,
            resource_content=resource_content,
            options=TypeAdapter(List[QuestionOption])
            .dump_json(item.options, by_alias=True, exclude_none=True)
            .decode(),
            answer=item.answer,
            difficulty=item.difficulty,
            textbook_id=textbook.id,
            unit_id=unit.id,
            knowledge=item.knowledge if item.knowledge else "",
        )

        questions.append(question)

        # 根据问题类型和子类型判断资源类型
        # 需要图片的题目：辨识题、选择题中的看图类、识图题等
        # 需要音频的题目：跟读题、听力题、选择题中的听音类、拼写题中的听音类、口语题等
        needs_image = question_type == "辨识题" or question_subtype in [
            "看图选词",
            "看图选句",
            "看图写单词",
            "看图列式",
            "数图形",
            "数位看图",
            "看图口头描述",
        ]
        needs_audio = question_type in ["跟读题", "听力题", "口语题"] or question_subtype in [
            "听音选词",
            "听音选句",
            "听音写单词",
            "单词精准模仿",
            "句子情绪模仿",
            "朗读小挑战",
            "听问题口头回答",
        ]

        # 设置资源类型字段
        if needs_image:
            question.resource_type = "image"
            image_questions.append(question)
        elif needs_audio:
            question.resource_type = "audio"
            audio_questions.append(question)
        else:
            question.resource_type = None
            text_questions.append(question)

    if len(questions) == 0:
        raise ValueError("题目生成失败")

    return {
        "questions": questions,
        "image_questions": image_questions,
        "audio_questions": audio_questions,
        "text_questions": text_questions,
    }


async def generate_images(params: Dict[str, Any]) -> Dict[str, Any]:
    """图片生成节点 - 根据 resource_type 标识为题目生成图片（并行生成）"""
    image_questions: List[Question] = params.get("image_questions", [])

    # 过滤出需要生成图片的题目
    questions_to_generate = [q for q in image_questions if q.resource_type == "image"]

    if not questions_to_generate:
        logger.info("没有需要生成图片的题目")
        return {"image_questions": image_questions}

    logger.info(f"开始为 {len(questions_to_generate)} 道题目并行生成图片")

    # 并行生成图片
    async def generate_single_image(question: Question):
        try:
            # 构建完整的问题内容（包含题目、选项、答案）
            full_question_text = build_full_question_text(question)

            # 生成图片
            # 使用允许的尺寸：1328*1328（最接近正方形的尺寸）
            # 使用 optimize_prompt=True 优化提示词
            image_url = AliyunAIService.generate_image(
                text=full_question_text, width=1328, height=1328, optimize_prompt=True
            )
            # 将图片URL保存到临时字段，后续上传时使用
            question._temp_image_url = image_url
            logger.info(f"题目 {question.id} 图片生成成功")
        except Exception as e:
            logger.error(f"为问题 {question.content[:50] if question.content else 'N/A'} 生成图片失败: {e}")
            question._temp_image_url = None

    # 并行执行所有图片生成任务
    await asyncio.gather(*[generate_single_image(q) for q in questions_to_generate])

    logger.info(f"图片生成完成，共处理 {len(questions_to_generate)} 道题目")

    # 只返回需要更新的字段，避免更新 unit_id 等不应该被更新的字段
    return {
        "image_questions": image_questions,
    }


async def generate_audio(params: Dict[str, Any]) -> Dict[str, Any]:
    """语音生成节点 - 根据 resource_type 标识为题目生成语音（并行生成）"""
    audio_questions: List[Question] = params.get("audio_questions", [])

    # 过滤出需要生成语音的题目
    questions_to_generate = [q for q in audio_questions if q.resource_type == "audio"]

    if not questions_to_generate:
        logger.info("没有需要生成语音的题目")
        return {"audio_questions": audio_questions}

    logger.info(f"开始为 {len(questions_to_generate)} 道题目并行生成语音")

    # 并行生成语音
    async def generate_single_audio(question: Question):
        try:
            # 生成语音，优先使用 resource_content，如果没有则使用 content
            text_to_speak = question.resource_content if question.resource_content else question.content
            audio_url = AliyunAIService.tts(text=text_to_speak, voice="Cherry", language="Chinese")
            # 将音频URL保存到临时字段，后续上传时使用
            question._temp_audio_url = audio_url
            logger.info(f"题目 {question.id} 语音生成成功")
        except Exception as e:
            logger.error(f"为问题 {question.content[:50]} 生成语音失败: {e}")
            question._temp_audio_url = None

    # 并行执行所有语音生成任务
    await asyncio.gather(*[generate_single_audio(q) for q in questions_to_generate])

    logger.info(f"语音生成完成，共处理 {len(questions_to_generate)} 道题目")

    # 只返回需要更新的字段，避免更新 unit_id 等不应该被更新的字段
    return {
        "audio_questions": audio_questions,
    }


async def download_file(url: str, file_path: str) -> None:
    """下载文件到本地"""
    response = requests.get(url, stream=True)
    response.raise_for_status()

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)


async def upload_files(params: Dict[str, Any]) -> Dict[str, Any]:
    """文件上传节点 - 将图片和音频上传到 OSS"""
    image_questions: List[Question] = params.get("image_questions", [])
    audio_questions: List[Question] = params.get("audio_questions", [])
    unit_id = params["unit_id"]

    oss = AliyunOSS()
    tmp_dir = Path(envs.TMP_DIR)
    tmp_dir.mkdir(parents=True, exist_ok=True)

    # 上传图片
    for idx, question in enumerate(image_questions):
        if hasattr(question, "_temp_image_url") and question._temp_image_url:
            try:
                # 下载图片
                image_path = tmp_dir / f"question_{unit_id}_{idx}_image.jpg"
                await download_file(question._temp_image_url, str(image_path))

                # 读取文件内容
                with open(image_path, "rb") as f:
                    file_data = f.read()

                # 上传到 OSS
                oss_path = f"questions/{unit_id}/images/{idx}.jpg"

                # 检查文件是否存在，如果存在则先删除
                if oss.exist(oss_path):
                    logger.info(f"OSS 文件已存在，先删除: {oss_path}")
                    oss.delete(oss_path)

                oss.upload(oss_path, file_data)

                # 保存资源路径
                question.resource = oss_path

                # 清理临时文件
                os.remove(image_path)
            except Exception as e:
                logger.error(f"上传图片失败: {e}")
                question.resource = None

    # 上传音频
    for idx, question in enumerate(audio_questions):
        if hasattr(question, "_temp_audio_url") and question._temp_audio_url:
            try:
                # 下载音频
                audio_path = tmp_dir / f"question_{unit_id}_{idx}_audio.mp3"
                await download_file(question._temp_audio_url, str(audio_path))

                # 读取文件内容
                with open(audio_path, "rb") as f:
                    file_data = f.read()

                # 上传到 OSS
                oss_path = f"questions/{unit_id}/audio/{idx}.mp3"

                # 检查文件是否存在，如果存在则先删除
                if oss.exist(oss_path):
                    logger.info(f"OSS 文件已存在，先删除: {oss_path}")
                    oss.delete(oss_path)

                oss.upload(oss_path, file_data)

                # 保存资源路径
                question.resource = oss_path

                # 清理临时文件
                os.remove(audio_path)
            except Exception as e:
                logger.error(f"上传音频失败: {e}")
                question.resource = None

    # 只返回需要更新的字段，避免更新 unit_id 等不应该被更新的字段
    return {
        "image_questions": image_questions,
        "audio_questions": audio_questions,
    }


async def upload_questions(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    """数据更新节点 - 更新已保存的问题（如 resource 字段等）"""
    # 所有问题已在 convert_data 节点中保存，这里只需要更新（如 resource 字段）
    image_questions: List[Question] = params.get("image_questions", [])
    audio_questions: List[Question] = params.get("audio_questions", [])
    text_questions: List[Question] = params.get("text_questions", [])

    all_questions = image_questions + audio_questions + text_questions

    if all_questions:
        # 更新所有问题的 update_time（resource 字段已在 upload_files 节点中设置）
        for question in all_questions:
            question.update_time = now()

        await db.commit()
        logger.info(
            f"成功更新 {len(all_questions)} 道题目（图片题：{len(image_questions)}，音频题：{len(audio_questions)}，文本题：{len(text_questions)}）"
        )
    else:
        logger.info("没有需要更新的题目")

    return {
        "saved_questions": all_questions,
    }


# ============================================================================
# 优化版本 Prompt 构建器（V2）
# ============================================================================


async def _get_knowledge_names_by_units(db: AsyncSession, unit_ids: List[int]) -> List[str]:
    """根据单元ID列表获取知识点名称"""
    if not unit_ids:
        return []

    result = await db.execute(select(Knowledge.name).where(Knowledge.unit_id.in_(unit_ids)).order_by(Knowledge.id))
    return [row[0] for row in result.all()]


def _format_weak_knowledge_analysis(weak_points: List[str], mastery_details: List[Dict[str, Any]] = None) -> str:
    """格式化薄弱知识点分析"""
    if not weak_points:
        return "（暂无明显薄弱知识点，学生整体掌握良好）"

    lines = []
    for i, point in enumerate(weak_points[:5]):  # 最多显示5个
        if mastery_details and i < len(mastery_details):
            detail = mastery_details[i]
            mastery_level = int(detail.get("mastery_level", 0) * 100)
            error_rate = int(detail.get("error_rate", 0) * 100)
            lines.append(f"- **{point}**：掌握度 {mastery_level}%，历史错误率 {error_rate}%")
        else:
            lines.append(f"- **{point}**")

    return "\n".join(lines)


def _format_mastered_knowledge(knowledge_list: List[str]) -> str:
    """格式化已掌握知识点列表"""
    if not knowledge_list:
        return "（暂无已掌握知识点数据）"

    return "、".join(knowledge_list[:10])  # 最多显示10个


def _format_review_reminder(review_units: List[Dict[str, Any]]) -> str:
    """格式化遗忘曲线复习提醒"""
    if not review_units:
        return "（近期无需复习的单元）"

    lines = []
    for unit in review_units[:3]:  # 最多显示3个
        unit_name = unit.get("unit_name", "未知单元")
        days_since = unit.get("days_since_last_practice", 0)
        lines.append(f"- **{unit_name}**：已 {days_since} 天未练习，建议复习")

    return "\n".join(lines)


def _format_new_knowledge(new_knowledge: List[str]) -> str:
    """格式化新知识预览"""
    if not new_knowledge:
        return "（暂无新知识点安排）"

    return "、".join(new_knowledge[:5])


async def unit_generate_prompt(params: Dict[str, Any]) -> Dict[str, Any]:
    """根据传入参数生成单元练习 prompt"""
    prompt_input, parser = _build_common_prompt_inputs(params)
    
    # 根据科目自动选择对应的 prompt 模板
    textbook = params["textbook"]
    unit_prompt_template = get_prompt_by_subject('unit', textbook.subject)

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业教研员，负责根据教材内容命题。"
                "你的目标是生成高质量、符合学生认知水平、紧扣知识点的题目。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", unit_prompt_template),
        ]
    )

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
        "prompt_template": unit_prompt_template,
    }


async def daily_generate_prompt(params: Dict[str, Any]) -> Dict[str, Any]:
    """根据传入参数生成今日练习 prompt"""
    from shared.services.unit_mastery_service import UnitMasteryService

    prompt_input, parser = _build_common_prompt_inputs(params)

    # 从参数中获取学生相关信息
    student_id = params.get("student_id")
    textbook_id = params.get("textbook_id")
    db = params.get("db")

    # 初始化默认值
    weak_knowledge_points = []
    mastered_knowledge = []
    review_units = []

    # 如果有学生数据，则加载真实的掌握度信息
    if student_id and textbook_id and db:
        try:
            # 获取学生单元掌握度数据
            mastery_map = await UnitMasteryService.get_student_unit_mastery_map(db, student_id, textbook_id)

            # 提取薄弱知识点（mastery_level < 0.6）
            weak_units = [unit_id for unit_id, data in mastery_map.items() if data.get("mastery_level", 0) < 0.6]
            if weak_units:
                weak_knowledge_points = await _get_knowledge_names_by_units(db, weak_units)

            # 提取已掌握知识点（0.6 <= mastery_level < 0.8）
            mastered_units = [
                unit_id for unit_id, data in mastery_map.items() if 0.6 <= data.get("mastery_level", 0) < 0.8
            ]
            if mastered_units:
                mastered_knowledge = await _get_knowledge_names_by_units(db, mastered_units)

            # 提取需要复习的单元（基于遗忘曲线）
            review_units = (
                await UnitMasteryService.get_units_need_review(db, student_id, textbook_id)
                if hasattr(UnitMasteryService, "get_units_need_review")
                else []
            )
        except Exception as e:
            logger.warning(f"加载学生学习数据失败，将使用默认策略: {e}")

    # 计算题目分布
    total_count = params["count"]
    wrong_count = max(1, int(total_count * 0.3))
    consolidation_count = int(total_count * 0.4)
    challenge_count = int(total_count * 0.2)
    new_count = total_count - wrong_count - consolidation_count - challenge_count

    # 如果没有真实数据，使用通用知识点
    if not weak_knowledge_points:
        weak_knowledge_points = params.get("knowledge_names", "").split("、")[:3]
    if not mastered_knowledge:
        mastered_knowledge = params.get("knowledge_names", "").split("、")[3:8]

    # 构建富文本的学生画像
    weak_knowledge_analysis = _format_weak_knowledge_analysis(weak_knowledge_points)
    mastered_knowledge_list = _format_mastered_knowledge(mastered_knowledge)
    review_units_reminder = _format_review_reminder(review_units)
    new_knowledge_preview = _format_new_knowledge(
        params.get("new_knowledge", mastered_knowledge[-3:] if mastered_knowledge else [])
    )

    daily_prompt_input = {
        **{
            k: prompt_input[k]
            for k in ("subject", "grade", "semester", "question_types", "subtype_info", "count", "format_instructions")
        },
        "weak_knowledge_analysis": weak_knowledge_analysis,
        "mastered_knowledge_list": mastered_knowledge_list,
        "review_units_reminder": review_units_reminder,
        "weak_knowledge_points": "、".join(weak_knowledge_points[:5]) or "（无）",
        "mastered_knowledge": "、".join(mastered_knowledge[:8]) or "（无）",
        "challenge_knowledge": "、".join(mastered_knowledge[-3:]) if mastered_knowledge else "（无）",
        "new_knowledge": new_knowledge_preview,
        "wrong_count": wrong_count,
        "consolidation_count": consolidation_count,
        "challenge_count": challenge_count,
        "new_count": new_count,
    }
    
    # 根据科目自动选择对应的 prompt 模板
    textbook = params["textbook"]
    daily_prompt_template = get_prompt_by_subject('daily', textbook.subject)

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业的教研员，擅长根据学生的学习数据设计个性化的日常练习。"
                "你的目标是帮助学生巩固薄弱环节、保持已掌握知识、挑战更高难度，并激发学习兴趣。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", daily_prompt_template),
        ]
    )

    return {
        "prompt": prompt,
        "prompt_input": daily_prompt_input,
        "parser": parser,
        "prompt_template": daily_prompt_template,
    }


async def assessment_generate_prompt(params: Dict[str, Any]) -> Dict[str, Any]:
    """根据传入参数生成能力评测 prompt - 整体能力评测"""
    # 能力评测不需要单元和知识点信息，只需要基础的科目、年级、学期
    textbook = params["textbook"]
    count = params["count"]

    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    question_types = get_question_types(textbook.subject, textbook.grade)
    if not question_types:
        raise ValueError(
            f"科目 {textbook.subject} 的 {textbook.grade} 年级暂不支持题目生成。" f"目前仅支持一年级的英语和数学。"
        )

    question_types_str = "、".join(question_types)

    subtype_info_lines = []
    for qtype in question_types:
        subtypes = get_question_subtypes(qtype)
        if subtypes:
            subtype_info_lines.append(f"{qtype}：{'、'.join(subtypes)}")
    subtype_info = "\n".join(subtype_info_lines) if subtype_info_lines else "无子类型要求"

    # 计算难度分布
    simple_count = max(1, int(count * 0.3))
    medium_count = max(1, int(count * 0.5))
    hard_count = count - simple_count - medium_count

    assessment_prompt_input = {
        "subject": textbook.subject,
        "grade": textbook.grade,
        "semester": textbook.semester,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "count": count,
        "simple_count": simple_count,
        "medium_count": medium_count,
        "hard_count": hard_count,
        "format_instructions": format_instructions,
    }
    
    # 根据科目自动选择对应的 prompt 模板
    assessment_prompt_template = get_prompt_by_subject('assessment', textbook.subject)

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业的测评设计师，精通IRT（项目反应理论）自适应评测。"
                "你的任务是生成具有良好区分度的题目，用于评估学生在该年级的整体能力水平。"
                "题目应覆盖该年级的核心能力维度，不局限于特定单元或知识点。"
                "请确保题目答案唯一、便于判分、能力维度覆盖均衡。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", assessment_prompt_template),
        ]
    )

    return {
        "prompt": prompt,
        "prompt_input": assessment_prompt_input,
        "parser": parser,
        "prompt_template": assessment_prompt_template,
    }


PROMPT_BUILDERS = {
    "unit": unit_generate_prompt,
    "daily": daily_generate_prompt,
    "assessment": assessment_generate_prompt,
}


async def generate_question_by_unit(db: AsyncSession, unit_id: int, count: int) -> List[Question]:
    """根据单元 ID 生成指定数量的题目并入库（旧接口，保持兼容）"""
    # 延迟导入以避免循环导入
    from shared.ai.graphs.generate_question import generate_question_graph

    result = await generate_question_graph(db, unit_id, count, generation_type="unit")
    return result.get("saved_questions", [])
