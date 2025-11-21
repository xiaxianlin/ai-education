"""通用练习服务"""

from typing import Optional, List
from loguru import logger
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession
from student.schema import PracticeHistorySchema


async def get_practice_history(
    db: AsyncSession, student_id: str, practice_type: str, limit: int = 30
) -> List[PracticeHistorySchema]:
    """
    获取指定类型的练习历史记录

    Args:
        db: 数据库会话
        student_id: 学生ID
        practice_type: 练习类型 (daily_practice/unit_practice/assessment)
        limit: 返回记录数量，默认30条

    Returns:
        练习历史记录列表
    """
    # 查询最近的练习记录（按创建时间倒序）
    sessions = await db.scalars(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == practice_type,
        )
        .order_by(desc(PracticeSession.create_time))
        .limit(limit)
    )

    result = []
    for session in sessions.all():
        result.append(
            PracticeHistorySchema(
                session_id=session.id,
                session_type=session.session_type,
                status=session.status,
                target_id=session.target_id,
                textbook_id=session.textbook_id,
                question_count=session.question_count,
                answer_count=session.answer_count,
                correct_count=session.correct_count,
                start_time=session.start_time,
                end_time=session.end_time,
                create_time=session.create_time,
            )
        )

    logger.info(
        f"获取练习历史: student_id={student_id}, type={practice_type}, "
        f"count={len(result)}"
    )

    return result


async def count_practice_by_type(
    db: AsyncSession, student_id: str, practice_type: str, target_id: Optional[int] = None
) -> int:
    """
    通用的练习次数统计函数

    Args:
        db: 数据库会话
        student_id: 学生ID
        practice_type: 练习类型 (daily_practice/unit_practice/assessment)
        target_id: 目标ID（单元练习时为 unit_id，每日练习时为日期，能力评估时不需要）

    Returns:
        练习次数
    """
    query = select(func.count(PracticeSession.id)).where(
        PracticeSession.student_id == student_id,
        PracticeSession.session_type == practice_type,
        PracticeSession.status == 2,  # 只统计已完成的练习
    )

    # 如果提供了 target_id，添加条件
    if target_id is not None:
        query = query.where(PracticeSession.target_id == target_id)

    result = await db.scalar(query)
    count = result or 0

    logger.info(
        f"练习次数统计: student_id={student_id}, type={practice_type}, "
        f"target_id={target_id}, count={count}"
    )
    return count
