"""
练习会话管理模块

提供练习会话的查询、状态管理等功能。
"""

import pendulum
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
    QuestionSchema,
)
from shared.utils.time import now
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from .report import generate_practice_report


async def get_practice_sessions(
    db: AsyncSession,
    student_id: str,
    practice_type: str,
    limit: int = 30,
):
    """获取指定练习类型的练习会话记录
    
    Args:
        db: 数据库会话
        student_id: 学生 ID
        practice_type: 练习类型 (ability_practice / unit_practice)
        limit: 返回数量限制
        
    Returns:
        List[PracticeSessionSchema]: 练习会话列表
    """
    sessions = await db.scalars(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.practice_type == practice_type,
        )
        .order_by(desc(PracticeSession.create_time))
        .limit(limit)
    )

    return [PracticeSessionSchema.model_validate(session) for session in sessions.all()]


async def get_practice_session_data(
    db: AsyncSession,
    student_id: str,
    session_id: str,
):
    """根据练习会话 ID 查询会话详情
    
    Args:
        db: 数据库会话
        student_id: 学生 ID
        session_id: 会话 ID (UUID v4)
        
    Returns:
        PracticeSessionDataSchema: 会话详情数据
        
    Raises:
        ValueError: 会话不存在
    """
    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.id == session_id,
            PracticeSession.student_id == student_id,
        )
    )
    if not session:
        raise ValueError("练习会话不存在")

    results = await db.scalars(
        select(PracticeSessionAnswer)
        .options(joinedload(PracticeSessionAnswer.question))
        .where(PracticeSessionAnswer.session_id == session_id)
        .order_by(PracticeSessionAnswer.question_order)
    )

    # 获取所有答题记录
    answers = results.all()
    questions = [answer.question for answer in answers]

    # 查询报告
    report = None
    if session.status == 2:
        report = await db.scalar(
            select(PracticeSessionReport).where(
                PracticeSessionReport.session_id == session_id
            )
        )

    return PracticeSessionDataSchema(
        session=PracticeSessionSchema.model_validate(session),
        questions=[QuestionSchema.model_validate(question) for question in questions],
        answers=[PracticeSessionAnswerSchema.model_validate(answer) for answer in answers],
        report=PracticeSessionReportSchema.model_validate(report) if report else None,
    )


async def get_ability_practices(
    db: AsyncSession,
    student_id: str,
    limit: int = 30,
):
    """获取能力练习记录
    
    Args:
        db: 数据库会话
        student_id: 学生 ID
        limit: 返回数量限制
        
    Returns:
        List[PracticeSessionSchema]: 能力练习列表
    """
    return await get_practice_sessions(db, student_id, "ability_practice", limit)


async def get_unit_practices(
    db: AsyncSession,
    student_id: str,
    unit_id: int | None = None,
    limit: int = 30,
):
    """获取单元练习记录
    
    Args:
        db: 数据库会话
        student_id: 学生 ID
        unit_id: 单元 ID（可选，用于过滤）
        limit: 返回数量限制
        
    Returns:
        List[PracticeSessionSchema]: 单元练习列表
    """
    query = select(PracticeSession).where(
        PracticeSession.student_id == student_id,
        PracticeSession.practice_type == "unit_practice",
    )

    if unit_id:
        query = query.where(PracticeSession.unit_id == unit_id)

    query = query.order_by(desc(PracticeSession.create_time)).limit(limit)
    
    result = await db.scalars(query)
    return [PracticeSessionSchema.model_validate(session) for session in result.all()]


async def begin_practice(
    db: AsyncSession,
    student_id: str,
    session_id: str,
) -> None:
    """开始练习会话
    
    Args:
        db: 数据库会话
        student_id: 学生 ID
        session_id: 会话 ID (UUID v4)
        
    Raises:
        ValueError: 会话不存在或状态异常
    """
    # 查询练习会话
    session = await db.scalar(
        select(PracticeSession).where(PracticeSession.id == session_id)
    )

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
            raise ValueError(
                f"练习状态异常，无法开始（generate_status={session.generate_status}）"
            )

        # 更新状态为进行中
        session.status = 1
        session.start_time = now()
        session.update_time = now()
        await db.commit()
        logger.info(f"练习开始: session_id={session_id}, student_id={student_id}")
    elif session.status == 1:
        # 已经在进行中，不需要再次开始
        logger.info(f"练习已在进行中: session_id={session_id}")
    else:
        raise ValueError("练习已完成或已废弃")


async def complete_practice(
    db: AsyncSession,
    student_id: str,
    session_id: str,
) -> int:
    """完成练习会话，生成报告
    
    Args:
        db: 数据库会话
        student_id: 学生 ID
        session_id: 会话 ID (UUID v4)
        
    Returns:
        int: 报告 ID
        
    Raises:
        ValueError: 会话不存在或状态异常
    """
    # 查询练习会话
    session = await db.scalar(
        select(PracticeSession).where(PracticeSession.id == session_id)
    )

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
            f"练习未完成所有题目: session_id={session_id}, "
            f"已答={session.answer_count}, 总数={session.question_count}"
        )

    # 更新状态为已完成
    session.status = 2
    session.end_time = now()
    session.update_time = now()
    await db.commit()

    logger.info(f"练习完成: session_id={session_id}, student_id={student_id}")

    return await generate_practice_report(db, student_id, session_id)


async def get_session_by_id(
    db: AsyncSession,
    session_id: str,
) -> PracticeSessionSchema | None:
    """根据会话 ID 查询会话
    
    Args:
        db: 数据库会话
        session_id: 会话 ID (UUID v4)
        
    Returns:
        PracticeSessionSchema | None: 会话信息
    """
    session = await db.scalar(
        select(PracticeSession).where(PracticeSession.id == session_id)
    )
    
    if not session:
        return None
        
    return PracticeSessionSchema.model_validate(session)


# ==================== 兼容旧版函数（将逐步废弃） ====================


async def get_daily_practices(
    db: AsyncSession,
    student_id: str,
    textbook_id: int | None = None,
):
    """获取当天的日常练习记录（兼容旧版）"""
    start = pendulum.today()
    query = select(PracticeSession).where(
        PracticeSession.student_id == student_id,
        PracticeSession.practice_type == "daily_practice",
        PracticeSession.create_time >= start.int_timestamp,
    )
    if textbook_id:
        query = query.where(PracticeSession.textbook_id == textbook_id)
    result = await db.scalars(query)
    return [PracticeSessionSchema.model_validate(session) for session in result.all()]


async def get_assess_practices(
    db: AsyncSession,
    student_id: str,
    textbook_id: int | None = None,
):
    """获取 30 天内的综合评估记录（兼容旧版）"""
    thirty_days_ago = pendulum.now().subtract(days=30)

    query = select(PracticeSession).where(
        PracticeSession.student_id == student_id,
        PracticeSession.practice_type == "assess_practice",
        PracticeSession.create_time >= thirty_days_ago.int_timestamp,
    )

    if textbook_id:
        query = query.where(PracticeSession.textbook_id == textbook_id)

    result = await db.scalars(query)
    return [PracticeSessionSchema.model_validate(session) for session in result.all()]
