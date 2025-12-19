"""答题服务"""

from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import PracticeSession, PracticeAnswer, Question
from student.schema import AnswerQuestionSchema
from shared.utils.time import now
from ai.question.answer import analyze_text_answer
from shared.core.schema import PracticeAnswerSchema


async def _check_answer(question: Question, params: AnswerQuestionSchema, db: AsyncSession):
    """检查答案是否正确并生成分析

    Args:
        question: 题目对象
        params: 答题参数
        db: 数据库会话

    Returns:
        tuple: (is_correct, analysis) - 是否正确和错题分析（如果错误）
    """
    is_correct = False
    analysis = ""
    if params.is_audio_answer:
        is_correct = params.audio_match
        analysis = params.audio_analysis
    else:
        is_correct = params.answer.strip() == question.answer.strip()
        # 文本题答案错误，进行分析
        if not is_correct:
            result = await analyze_text_answer(question, params.answer, db)
            is_correct = result.match
            analysis = result.analysis

    return is_correct, analysis


async def submit_answer(
    db: AsyncSession, student_id: str, params: AnswerQuestionSchema
):
    """提交答题答案"""
    # 1. 查询练习会话
    session = await db.scalar(
        select(PracticeSession).where(PracticeSession.id == params.session_id)
    )
    if not session:
        raise ValueError("练习会话不存在")

    if session.student_id != student_id:
        raise ValueError("无权操作此练习")

    # 2. 查询题目信息
    question = await db.scalar(
        select(Question).where(Question.id == params.question_id)
    )
    if not question:
        raise ValueError("题目不存在")

    # 3. 查询答题记录
    answer_record = await db.scalar(
        select(PracticeAnswer).where(
            PracticeAnswer.session_id == params.session_id,
            PracticeAnswer.question_id == params.question_id,
        )
    )
    if not answer_record:
        raise ValueError("答题记录不存在")

    # 4. 检查答案并生成分析
    is_correct, analysis = await _check_answer(question, params, db)

    # 5. 更新答题记录
    answer_record.text_answer = params.answer
    answer_record.status = 1 if is_correct else 2
    answer_record.time_spent = params.time_spent
    answer_record.submit_time = now()

    # 如果答错，保存错题分析信息
    if not is_correct:
        answer_record.correct_answer = question.answer
        answer_record.analysis = analysis
        logger.info(
            f"记录错题信息: student_id={student_id}, question_id={params.question_id}, "
            f"session_id={params.session_id}"
        )

    # 6. 更新练习会话统计
    session.answer_count += 1
    if is_correct:
        session.correct_count += 1

    session.update_time = now()

    await db.commit()
    await db.refresh(answer_record)

    logger.info(
        f"答题提交成功: student_id={student_id}, session_id={params.session_id}, "
        f"question_id={params.question_id}, is_correct={is_correct}"
    )

    return PracticeAnswerSchema.model_validate(answer_record)
