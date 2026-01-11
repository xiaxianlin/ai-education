"""答题服务

支持多种题型的答案评判和反馈生成：
- 使用 AnswerEvaluator 根据 answer.type 选择评判策略
- 返回结构化的正确答案供前端渲染
- 结合题目解析和 AI 分析生成错题反馈
"""

import json
from typing import Any, Optional

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.database import (
    Practice,
    PracticeAnswer,
    Question,
)
from shared.core.schema import PracticeAnswerSchema
from shared.provider import get_provider
from shared.utils.prompt import build_question_prompt
from shared.utils.time import now
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .evaluator import AnswerEvaluator, EvaluateResult
from .mastery import extract_ability_codes, update_student_mastery
from .prompt import ANALYZE_QUESTION_ANSWER_PROMPT
from .schema import (
    AnswerAnalysisSchema,
    AnswerFeedbackSchema,
    CorrectAnswerSchema,
    SubmitAnswerSchema,
)


async def _generate_ai_analysis(question: Question, user_answer: Any) -> Optional[str]:
    """生成 AI 错题分析

    Args:
        question: 题目对象
        user_answer: 用户答案（可能是字符串、列表、字典等）

    Returns:
        str: AI 生成的针对性分析，失败时返回 None
    """
    try:
        prompt_parser = JsonOutputParser(pydantic_object=AnswerAnalysisSchema)
        format_instructions = prompt_parser.get_format_instructions()

        prompt_template = ChatPromptTemplate.from_template(ANALYZE_QUESTION_ANSWER_PROMPT)
        prompt_template = prompt_template.partial(format_instructions=format_instructions)

        # 构建问题内容，包含用户答案
        question_content = build_question_prompt(question)
        # 将答案转换为字符串用于显示
        if isinstance(user_answer, (dict, list)):
            answer_str = json.dumps(user_answer, ensure_ascii=False)
        else:
            answer_str = str(user_answer)
        question_content += f"\n\n学生答案：{answer_str}"

        prompt_input = {"question_content": question_content}

        provider = get_provider()
        result = await provider.invoke_chain(prompt_template, prompt_parser, prompt_input)

        return result.get("analysis", "")
    except Exception as e:
        logger.warning(f"AI 分析生成失败: {e}")
        return None


async def _generate_feedback(
    question: Question,
    user_answer: Any,
    evaluate_result: EvaluateResult,
) -> AnswerFeedbackSchema:
    """生成答题反馈

    结合题目自带解析和 AI 针对性分析生成完整反馈。

    Args:
        question: 题目对象
        user_answer: 用户答案
        evaluate_result: 评判结果

    Returns:
        AnswerFeedbackSchema: 完整的答题反馈
    """
    # 获取题目自带解析
    explanation = question.explanation

    # 生成 AI 针对性分析
    ai_analysis = await _generate_ai_analysis(question, user_answer)

    # 构建结构化正确答案
    correct_answer = CorrectAnswerSchema(
        type=evaluate_result.correct_answer.type,
        value=evaluate_result.correct_answer.value,
        values=evaluate_result.correct_answer.values,
        options=evaluate_result.correct_answer.options,
        sub_answers=evaluate_result.correct_answer.sub_answers,
    )

    return AnswerFeedbackSchema(
        correct_answer=correct_answer,
        explanation=explanation,
        analysis=ai_analysis,
    )


async def submit_answer(
    db: AsyncSession,
    student_id: str,
    params: SubmitAnswerSchema,
) -> PracticeAnswerSchema:
    """提交答题答案

    Args:
        db: 数据库会话
        student_id: 学生 ID
        params: 提交答案参数

    Returns:
        PracticeAnswerSchema: 更新后的答题记录

    Raises:
        ValueError: 参数验证失败
    """
    # 1. 查询练习
    practice = await db.scalar(select(Practice).where(Practice.id == params.session_id))
    if not practice:
        raise ValueError(f"练习会话不存在: session_id={params.session_id}")

    if practice.student_id != student_id:
        raise ValueError("无权操作此练习")

    # 2. 查询题目信息
    question = await db.scalar(select(Question).where(Question.id == params.question_id))
    if not question:
        raise ValueError(f"题目不存在: question_id={params.question_id}")

    # 3. 查询答题记录
    answer_record = await db.scalar(
        select(PracticeAnswer).where(
            PracticeAnswer.session_id == params.session_id,
            PracticeAnswer.question_id == params.question_id,
        )
    )
    if not answer_record:
        raise ValueError(
            f"答题记录不存在: session_id={params.session_id}, question_id={params.question_id}"
        )

    if answer_record.status != 0:
        raise ValueError(
            f"答题记录已提交: session_id={params.session_id}, question_id={params.question_id}"
        )

    # 4. 使用评判器评判答案
    evaluate_result = AnswerEvaluator.evaluate(
        question=question,
        user_answer=params.answer,
    )

    is_correct = evaluate_result.is_correct

    # 5. 如果答错，生成反馈
    feedback = None
    if not is_correct:
        feedback = await _generate_feedback(question, params.answer, evaluate_result)

    # 6. 更新答题记录
    answer_record.submit_time = now()
    # 将答案序列化为 JSON 字符串存储
    if params.answer is not None:
        if isinstance(params.answer, (dict, list)):
            answer_record.answer = json.dumps(params.answer, ensure_ascii=False)
        else:
            # 字符串类型直接存储
            answer_record.answer = str(params.answer)
    else:
        answer_record.answer = None
    answer_record.audio_url = params.audio_url
    answer_record.status = 1 if is_correct else 2
    answer_record.time_spent = params.time_spent

    # 存储结构化正确答案（JSON 格式）
    answer_record.correct_answer = json.dumps(
        evaluate_result.correct_answer.model_dump(),
        ensure_ascii=False,
    )

    # 存储反馈信息（JSON 格式）
    if feedback:
        answer_record.analysis = json.dumps(
            feedback.model_dump(),
            ensure_ascii=False,
        )
    else:
        answer_record.analysis = None

    # 7. 更新练习会话统计
    practice.answer_count += 1
    if is_correct:
        practice.correct_count += 1

    practice.update_time = now()

    # 8. 更新学生能力掌握度（事件驱动）
    ability_codes = extract_ability_codes(question)
    for ability_code in ability_codes:
        await update_student_mastery(db, student_id, ability_code, is_correct)

    await db.commit()
    await db.refresh(answer_record)

    logger.info(
        f"答题提交成功: student_id={student_id}, session_id={params.session_id}, "
        f"question_id={params.question_id}, is_correct={is_correct}"
    )

    return PracticeAnswerSchema.model_validate(answer_record)


__all__ = [
    "submit_answer",
]
