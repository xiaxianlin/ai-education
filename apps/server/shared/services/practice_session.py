from loguru import logger
from shared.core.database import (
    PracticeSession,
    PracticeSessionAnswer,
    PracticeSessionReport,
)
from shared.core.schema import (
    PracticeSessionAnswerSchema,
    PracticeSessionDataSchema,
    PracticeSessionReportSchema,
    PracticeSessionSchema,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload


async def get_practice_session_data(db: AsyncSession, student_id: str, session_id: int) -> PracticeSessionDataSchema:
    """
    根据练习会话ID查询会话详情（学生端）
    包括：会话基本信息、问题列表、已完成练习的报告

    Args:
        db: 数据库会话
        student_id: 学生ID
        session_id: 练习会话ID

    Returns:
        会话详情，包含session、questions、answers、report
    """
    # 查询会话基本信息
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError("练习会话不存在")

    # 验证权限
    if session.student_id != student_id:
        raise ValueError("无权访问此练习会话")

    # 查询答题记录和题目信息
    results = await db.scalars(
        select(PracticeSessionAnswer)
        .options(joinedload(PracticeSessionAnswer.question))
        .where(PracticeSessionAnswer.session_id == session_id)
        .order_by(PracticeSessionAnswer.question_order)
    )

    # 获取所有答题记录
    answers = [PracticeSessionAnswerSchema.model_validate(answer) for answer in results.all()]

    # 对 answers 根据 question_order 进行排序
    answers.sort(key=lambda x: x.question_order)
    questions = [answer.question for answer in answers]

    for answer in answers:
        answer.question = None

    # 查询报告（如果练习已完成）
    report = None
    if session.status == 2:
        report = await db.scalar(select(PracticeSessionReport).where(PracticeSessionReport.session_id == session_id))

    # 构建返回结果

    logger.info(f"[Student] 获取会话详情成功: session_id={session_id}, question_count={len(questions)}")

    return PracticeSessionDataSchema(
        session=PracticeSessionSchema.model_validate(session),
        questions=questions,
        answers=answers,
        report=PracticeSessionReportSchema.model_validate(report) if report else None,
    )
