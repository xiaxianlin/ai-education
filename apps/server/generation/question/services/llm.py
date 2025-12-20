import secrets
from typing import Dict, Any, List

from loguru import logger
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Question
from shared.provider import get_provider
from generation.question.schema import QuestionGenerationState, GeneratedQuestion, QuestionOption


def convert_llm_result(result: Dict[str, Any]) -> List[GeneratedQuestion]:
    """验证大模型返回的结果"""
    # 处理 knowledge 字段：如果 LLM 返回的是列表，转换为字符串
    if "questions" not in result:
        raise ValueError("LLM 返回结果中没有 questions 字段")

    # 确保 questions 是列表
    if not isinstance(result["questions"], list):
        raise ValueError(f"questions 字段格式错误，期望列表类型，实际为: {type(result['questions']).__name__}")

    questions = []
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

        questions.append(GeneratedQuestion.model_validate(question))

    return questions


async def save_questions(state: QuestionGenerationState, generated_questions: List[GeneratedQuestion]):
    """保存题目到数据库"""

    db: AsyncSession = state["db"]
    unit = state.get("unit")
    textbook = state.get("textbook")

    questions: List[Question] = []

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
                f"生成的题型 {question_type} 不在预期列表中（科目: {textbook.subject}, 年级: {textbook.grade}）"
            )
            question_type = "未知题型"

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

        # 根据 QUESTION_TYPES 判断资源类型
        # 口语题的 resource_type 为空，只有听力相关和识别相关的题目 resource_type 才有值
        resource_type = None

        # 口语题类型的 resource_type 始终为空
        if question_type != "口语题":
            # 判断是否需要图片（识别相关）
            # 1. 识图题类型的所有子类型都需要图片
            if question_type == "识图题":
                resource_type = "image"
            # 2. 选择题中的"数位看图"需要图片
            elif question_type == "选择题" and question_subtype == "数位看图":
                resource_type = "image"
            # 3. 选择题中的"看图选词"、"看图选句"需要图片
            elif question_type == "选择题" and question_subtype in [
                "看图选词",
                "看图选句",
            ]:
                resource_type = "image"
            # 4. 拼写题中的"看图写单词"需要图片
            elif question_type == "拼写题" and question_subtype == "看图写单词":
                resource_type = "image"
            # 判断是否需要音频（听力相关）
            # 1. 选择题中的"听音选词"、"听音选句"需要音频
            elif question_type == "选择题" and question_subtype in [
                "听音选词",
                "听音选句",
            ]:
                resource_type = "audio"
            # 2. 拼写题中的"听音写单词"需要音频
            elif question_type == "拼写题" and question_subtype == "听音写单词":
                resource_type = "audio"

        # 设置资源类型字段并分类
        question = Question(
            id=secrets.token_hex(16),
            subject=textbook.subject,
            grade=textbook.grade,
            type=question_type,
            subtype=question_subtype,
            content=item.question,
            resource_type=resource_type,
            resource_content=resource_content,
            options=TypeAdapter(List[QuestionOption])
            .dump_json(item.options, by_alias=True, exclude_none=True)
            .decode(),
            answer=item.answer,
            difficulty=item.difficulty,
            textbook_id=textbook.id,
            unit_id=unit.id if unit else None,  # 教材生成时 textbook.id 可以为 None
            knowledge=item.knowledge if item.knowledge else "",
        )

        questions.append(question)

    if len(questions) == 0:
        raise ValueError("题目生成失败")

    db.add_all(questions)
    return {"questions": questions}


class LLMService:
    @classmethod
    async def call_llm(cls, state: QuestionGenerationState):
        prompt = state["prompt"]
        prompt_input = state["prompt_input"]
        parser = state["parser"]

        provider = get_provider()

        result = await provider.invoke_chain(prompt=prompt, parser=parser, prompt_input=prompt_input)
        logger.info("✓ LLM 调用成功")

        questions = await convert_llm_result(result)
        return await save_questions(state, questions)
