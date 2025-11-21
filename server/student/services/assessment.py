"""能力评估服务"""

from typing import Optional
from loguru import logger
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession
from core.schema import TextbookSchema
from student.schema import PracticeStatsSchem
from shared.services.practice import PracticeService


async def check_assessment(db: AsyncSession, student_id: str) -> Optional[PracticeStatsSchem]:
    """检查是否有未完成的能力评估"""
    times = await count_assessment(db, student_id)

    # 查找未完成的能力评估（不限日期）
    session = await db.scalar(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "assessment",
            PracticeSession.status != 2,  # 未完成的练习
        )
        .order_by(desc(PracticeSession.create_time))
    )

    if not session:
        return None

    logger.info(f"找到未完成的能力评估: session_id={session.id}, student_id={student_id}")

    return PracticeStatsSchem(
        session_id=session.id,
        status=session.status,
        total_questions=session.question_count,
        completed_questions=session.answer_count,
        right_questions=session.correct_count,
        times=times,
    )


async def create_assessment(
    db: AsyncSession, student_id: str, textbook: TextbookSchema
) -> PracticeStatsSchem:
    """创建新的能力评估"""
    logger.info(f"开始创建能力评估: student_id={student_id}, textbook_id={textbook.id}")

    try:
        times = await count_assessment(db, student_id)

        # 调用 shared/services/practice.py 的生成方法
        session_id = await PracticeService.generate_practice_session(
            db=db,
            type="assessment",
            subject=textbook.subject,
            grade=textbook.grade,
            count=30,
            recall_count=0,  # 能力评估不需要复习题
            textbook_id=textbook.id,
            student_id=student_id,
        )

        # 查询刚创建的会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

        if not session:
            raise ValueError("创建能力评估失败")

        logger.info(f"能力评估创建成功: session_id={session_id}")

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=times,
        )

    except Exception as e:
        logger.error(f"创建能力评估失败: student_id={student_id}, error={e}")
        raise ValueError(f"创建能力评估失败: {str(e)}")


async def count_assessment(db: AsyncSession, student_id: str) -> int:
    """统计能力评估次数（已完成的）"""
    result = await db.scalar(
        select(func.count(PracticeSession.id)).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "assessment",
            PracticeSession.status == 2,  # 只统计已完成的练习
        )
    )
    count = result or 0
    logger.info(f"能力评估次数统计: student_id={student_id}, count={count}")
    return count

