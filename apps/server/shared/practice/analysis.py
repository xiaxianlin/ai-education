from typing import List

from loguru import logger
from shared.core.database import (
    PracticeSession,
    PracticeSessionAnswer,
)


async def practice_report_analysis(
    session: PracticeSession,
    answers: List[PracticeSessionAnswer],
) -> int:
    """分析练习报告数据

    Args:
        session: 练习会话对象
        answers: 答题记录列表

    Returns:
        int: 分析结果统计值
    """
    logger.info(f"开始练习报告分析，session_id: {session.id}, 学生ID: {session.student_id}")

    # NOTE: 练习报告分析逻辑实现计划中，当前返回基础报告
    # 例如：统计正确率、错题分析、知识点掌握情况等

    return 0


async def practice_answer_analysis(question: Question, params: AnswerQuestionSchema, db: AsyncSession):
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
