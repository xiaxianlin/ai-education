"""存储服务 - 负责文件上传和题目保存"""

from typing import Any, Dict, List
from loguru import logger
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Question
from shared.core.constants import get_question_types
from ai.schema import QuestionGenerationState, GeneratedQuestion, QuestionOption


async def convert_questions(state: QuestionGenerationState) -> Dict[str, Any]:
    """将内容转换成 Question 数组，并根据问题类型分流"""
    generated_questions: List[GeneratedQuestion] = state["generated_questions"]

    # 处理单元：教材生成可能有多个单元，单元生成只有一个单元
    unit = state.get("unit")

    # 获取 textbook：优先从 state 中获取，如果没有则从 unit 或 textbook_id 加载
    textbook = state.get("textbook")

    questions: List[Question] = []

    # 根据科目和年级获取对应的题型
    question_types = get_question_types(textbook.subject, textbook.grade)

    # 验证题型列表不为空（虽然 generate_prompt 已经验证过，但这里再次验证以确保安全）
    if not question_types:
        raise ValueError(
            f"科目 {textbook.subject} 的 {textbook.grade} 年级暂不支持题目生成。"
            f"目前仅支持一年级的英语和数学。"
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
            elif question_type == "选择题" and question_subtype in ["看图选词", "看图选句"]:
                resource_type = "image"
            # 4. 拼写题中的"看图写单词"需要图片
            elif question_type == "拼写题" and question_subtype == "看图写单词":
                resource_type = "image"
            # 判断是否需要音频（听力相关）
            # 1. 选择题中的"听音选词"、"听音选句"需要音频
            elif question_type == "选择题" and question_subtype in ["听音选词", "听音选句"]:
                resource_type = "audio"
            # 2. 拼写题中的"听音写单词"需要音频
            elif question_type == "拼写题" and question_subtype == "听音写单词":
                resource_type = "audio"

        # 设置资源类型字段并分类
        question = Question(
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

    return {"questions": questions}


async def save_questions(state: QuestionGenerationState) -> Dict[str, Any]:
    """保存题目到数据库"""
    db: AsyncSession = state["db"]
    questions: List[Question] = state.get("questions", [])

    if questions:
        db.add_all(questions)
        await db.commit()
        logger.info("成功保存 %s 道题目到数据库", len(questions))
    else:
        logger.warning("没有需要保存的题目")

    return {"questions": questions}
