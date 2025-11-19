"""题目转换服务 - 负责将生成的题目转换为Question对象"""

from typing import Any, Dict, List
from loguru import logger
from pydantic import TypeAdapter

from core.constants import get_question_types
from core.database import Question
from shared.question.types import QuestionGenerationState
from shared.question.types import GeneratedQuestion, QuestionOption


async def convert_to_question_objects(state: QuestionGenerationState) -> Dict[str, Any]:
    """将内容转换成 Question 数组，并根据问题类型分流"""
    generated_questions: List[GeneratedQuestion] = state["generated_questions"]
    textbook = state["textbook"]
    unit = state["unit"]

    questions: List[Question] = []
    image_questions: List[Question] = []
    audio_questions: List[Question] = []
    text_questions: List[Question] = []

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
