"""每日练习服务"""

from typing import Optional
from loguru import logger
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, PracticeAnswer
from core.schema import TextbookSchema
from student.schema import PracticeStatsSchem
from shared.services.practice import PracticeService
from shared.utils.time import today, now


async def check_daily_practice(db: AsyncSession, student_id: str) -> Optional[PracticeStatsSchem]:
    """检查是否有当天的每日练习"""
    current_date = today()

    times = await count_daily_practice(db, student_id)
    session = await db.scalar(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.target_id == current_date,
        )
    )

    if not session:
        return None

    logger.info(f"找到当天每日练习: session_id={session.id}, student_id={student_id}")

    # 根据状态确定生成状态
    generating_status = None
    if session.status == 3:
        generating_status = "generating"  # 生产中
    elif session.status == 4:
        generating_status = "generated"  # 生成完成
    elif session.status == 5:
        generating_status = "failed"  # 生成失败

    return PracticeStatsSchem(
        session_id=session.id,
        status=session.status,
        total_questions=session.question_count,
        completed_questions=session.answer_count,
        right_questions=session.correct_count,
        times=times,
        generating_status=generating_status,
    )


async def check_last_practice(db: AsyncSession, student_id: str) -> Optional[PracticeStatsSchem]:
    """检查是否存在往期未完成的每日练习，如果有则重置进度并更新为当前日期"""
    current_date = today()

    times = await count_daily_practice(db, student_id)
    # 查找往期未完成的每日练习
    session = await db.scalar(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.target_id < current_date,
            PracticeSession.status != 2,  # 未完成的练习（状态不为2）
        )
        .order_by(desc(PracticeSession.target_id))
    )

    if not session:
        return None

    logger.info(
        f"找到往期未完成的每日练习: session_id={session.id}, old_date={session.target_id}, student_id={student_id}"
    )

    try:
        # 重置进度
        session.target_id = current_date
        session.status = 0
        session.answer_count = 0
        session.correct_count = 0
        session.start_time = 0
        session.end_time = None
        session.update_time = now()

        # 重置所有答题记录
        answer_records = await db.scalars(
            select(PracticeAnswer).where(PracticeAnswer.session_id == session.id)
        )
        for answer in answer_records.all():
            answer.user_answer = None
            answer.is_correct = 0
            answer.time_spent = 0
            answer.submit_time = None

        await db.commit()

        logger.info(f"往期练习已重置为当天: session_id={session.id}, new_date={current_date}")

        # 根据状态确定生成状态
        generating_status = None
        if session.status == 3:
            generating_status = "generating"  # 生产中
        elif session.status == 4:
            generating_status = "generated"  # 生成完成
        elif session.status == 5:
            generating_status = "failed"  # 生成失败

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=times - 1,
            generating_status=generating_status,
        )

    except Exception as e:
        logger.error(f"重置往期练习失败: session_id={session.id}, error={e}")
        await db.rollback()
        return None


async def create_daily_practice(
    db: AsyncSession, student_id: str, textbook: TextbookSchema
) -> PracticeStatsSchem:
    """创建新的每日练习"""
    logger.info(f"开始创建每日练习: student_id={student_id}, textbook_id={textbook.id}")
    try:
        times = await count_daily_practice(db, student_id)
        # 调用 shared/services/practice.py 的生成方法
        session_id = await PracticeService.generate_practice_session(
            db=db,
            type="daily_practice",
            count=30,
            textbook_id=textbook.id,
            student_id=student_id,
        )

        # 查询刚创建的会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))

        if not session:
            raise ValueError("创建每日练习失败")

        logger.info(f"每日练习创建成功: session_id={session_id}")

        # 根据状态确定生成状态
        generating_status = None
        if session.status == 3:
            generating_status = "generating"  # 生产中
        elif session.status == 4:
            generating_status = "generated"  # 生成完成
        elif session.status == 5:
            generating_status = "failed"  # 生成失败

        return PracticeStatsSchem(
            session_id=session.id,
            status=session.status,
            total_questions=session.question_count,
            completed_questions=session.answer_count,
            right_questions=session.correct_count,
            times=times,
            generating_status=generating_status,
        )

    except Exception as e:
        logger.error(f"创建每日练习失败: student_id={student_id}, error={e}")
        raise ValueError(f"创建每日练习失败: {str(e)}")


async def get_daily_practice(db: AsyncSession, student_id: str) -> Optional[PracticeStatsSchem]:
    """获取每日练习信息（用于检查生成状态）"""
    return await check_daily_practice(db, student_id)


async def count_daily_practice(db: AsyncSession, student_id: str) -> int:
    """统计每日练习次数（已完成的）"""
    result = await db.scalar(
        select(func.count(PracticeSession.id)).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "daily_practice",
            PracticeSession.status == 2,  # 只统计已完成的练习
        )
    )
    count = result or 0
    logger.info(f"每日练习次数统计: student_id={student_id}, count={count}")
    return count
