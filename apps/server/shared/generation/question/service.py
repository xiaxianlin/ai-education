"""题目生成服务函数

包含相似度检查、题目去重、题目处理和 prompt 构建等功能
"""

import secrets
from typing import Any, Dict, List

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.database import Question, QuestionType
from shared.utils.prompt import build_question_prompt
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


def calculate_jaccard_similarity(text1: str, text2: str) -> float:
    """计算两个文本的 Jaccard 相似度

    Args:
        text1: 第一个文本
        text2: 第二个文本

    Returns:
        float: Jaccard 相似度，范围 [0, 1]
    """
    if not text1 or not text2:
        return 0.0

    # 将文本转换为字符集合
    set1 = set(text1)
    set2 = set(text2)

    # 计算交集和并集
    intersection = len(set1 & set2)
    union = len(set1 | set2)

    if union == 0:
        return 0.0

    return intersection / union


def extract_question_text(question: Question) -> str:
    """提取题目的完整文本用于相似度比较

    Args:
        question: 题目对象

    Returns:
        str: 题目的完整文本（包含题干和选项）
    """
    parts = []

    # 提取题干
    if isinstance(question.stem, dict):
        stem_text = question.stem.get("text", "")
    else:
        stem_text = str(question.stem)

    if stem_text:
        parts.append(stem_text)

    # 提取选项
    if question.options:
        if isinstance(question.options, list):
            options_text = " ".join(
                [opt.get("text", str(opt)) if isinstance(opt, dict) else str(opt) for opt in question.options]
            )
        else:
            options_text = str(question.options)

        if options_text:
            parts.append(options_text)

    return " ".join(parts)


def filter_similar_questions(
    questions: List[Question],
    existing_questions: List[Question],
    threshold: float = 0.8,
) -> List[Question]:
    """过滤掉与已有题目相似度超过阈值的题目

    Args:
        questions: 待检查的题目列表
        existing_questions: 已有题目列表
        threshold: 相似度阈值，默认 0.8

    Returns:
        List[Question]: 过滤后的题目列表
    """
    if not existing_questions:
        return questions

    # 提取已有题目的文本
    existing_texts = [extract_question_text(q) for q in existing_questions]

    filtered_questions = []
    for question in questions:
        question_text = extract_question_text(question)

        # 检查与所有已有题目的相似度
        is_similar = False
        for existing_text in existing_texts:
            similarity = calculate_jaccard_similarity(question_text, existing_text)
            if similarity >= threshold:
                is_similar = True
                logger.debug(f"题目相似度过高: {similarity:.2f} >= {threshold}, " f"题目: {question_text[:50]}...")
                break

        if not is_similar:
            filtered_questions.append(question)
        else:
            logger.info(f"过滤掉相似题目: {question_text[:50]}...")

    return filtered_questions


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

        try:
            item = GeneratedQuestion.model_validate(question)
        except Exception as e:
            logger.warning(f"题目验证失败: {e}, 跳过处理")
            continue

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
    existing_questions: List[Question],
) -> Dict[str, Any]:
    """构建题目生成的 prompt

    Args:
        question_type: 题目类型对象
        count: 需要生成的数量
        existing_questions: 已生成的题目列表（用于避免重复）

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

    # 构建避免重复的提示
    existing_questions_text = ""
    if existing_questions:
        prompt_lines = []
        for q in existing_questions:
            question_text = build_question_prompt(q)
            prompt_lines.append(f"- {question_text}")

        existing_questions_text = "\n".join(prompt_lines)

    # 构建 prompt 输入参数（最小参数）
    prompt_input = {
        "count": count,
        "existing_questions": existing_questions_text,
        "format_instructions": format_instructions,
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "prompt_parser": prompt_parser,
    }
