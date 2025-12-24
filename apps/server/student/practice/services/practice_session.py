"""通用练习服务"""

import pendulum
from loguru import logger
from shared.core.database import (
    PracticeSession,
)
from shared.core.schema import (
    PracticeSessionSchema,
)
from shared.utils.time import now
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload

from .report import generate_practice_report


async def get_practice_sessions(
    db: AsyncSession, student_id: str, practice_id: int, limit: int = 30
):
    """获取指定练习的练习会话记录"""
    # 查询最近的练习记录（按创建时间倒序）
    sessions = await db.scalars(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.practice_id == practice_id,
        )
        .order_by(desc(PracticeSession.create_time))
        .limit(limit)
    )

    return [PracticeSessionSchema.model_validate(session) for session in sessions.all()]


async def get_daily_practices(db: AsyncSession, student_id: str):
    """获取当天的日常练习记录"""
    start = pendulum.today()
    result = await db.scalars(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.practice_slug == "daily_practice",
            PracticeSession.create_time >= start.int_timestamp,
        )
    )
    return [PracticeSessionSchema.model_validate(session) for session in result.all()]


async def get_unit_practices(db: AsyncSession, student_id: str, textbook_id: int):
    """获取所有单元练习记录"""
    result = await db.scalars(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.practice_slug == "unit_practice",
            PracticeSession.textbook_id == textbook_id,
            PracticeSession.status != 2,
        )
    )

    return [PracticeSessionSchema.model_validate(session) for session in result.all()]


async def get_assessments(db: AsyncSession, student_id: str):
    """获取 30 天内的综合评估记录"""
    thirty_days_ago = pendulum.now().subtract(days=30)

    result = await db.scalars(
        select(PracticeSession)
        .options(noload(PracticeSession.textbook))
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.practice_slug == "assessment",
            PracticeSession.create_time >= thirty_days_ago.int_timestamp,
        )
    )

    return [PracticeSessionSchema.model_validate(session) for session in result.all()]


async def begin_practice(db: AsyncSession, student_id: str, session_id: int) -> dict:
    """开始练习会话"""
    # 查询练习会话
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    if session.student_id != student_id:
        raise ValueError(f"无权操作此练习: session_id={session_id}, student_id={student_id}")

    if session.status == 0:
        # 检查生成状态
        if session.generate_status == 0:
            raise ValueError("练习正在生成中，请稍候")
        if session.generate_status == -1:
            raise ValueError("练习生成失败，请重新生成")
        if session.generate_status != 1:
            raise ValueError(f"练习状态异常，无法开始（generate_status={session.generate_status}）")

        # 更新状态为进行中
        session.status = 1
        session.start_time = now()
        session.update_time = now()
        await db.commit()
        logger.info(f"练习开始: session_id={session_id}, student_id={student_id}")
    else:
        raise ValueError("练习一开始或者已完成")


async def complete_practice(db: AsyncSession, student_id: str, session_id: int) -> int:
    """完成练习会话，生成报告"""
    # 查询练习会话
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

    if not session:
        raise ValueError(f"练习会话不存在: session_id={session_id}")

    if session.student_id != student_id:
        raise ValueError(f"无权操作此练习: session_id={session_id}, student_id={student_id}")

    # 检查练习会话是否已完成
    if session.status == 2:
        raise ValueError(f"练习已完成: session_id={session_id}")
    # 检查题目是否全部作答
    if session.answer_count < session.question_count:
        logger.warning(
            f"练习未完成所有题目: session_id={session_id}, "
            f"已答={session.answer_count}, 总数={session.question_count}"
        )
        raise ValueError(
            f"练习未完成所有题目: session_id={session_id}, 已答={session.answer_count}, 总数={session.question_count}"
        )

    # 更新状态为已完成
    session.status = 2
    session.end_time = now()
    session.update_time = now()
    await db.commit()

    logger.info(f"练习完成: session_id={session_id}, student_id={student_id}")

    return await generate_practice_report(db, student_id, session_id)
