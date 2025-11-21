import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import PracticeSession


async def get_practice_history(db: AsyncSession, student_id: str, practice_type: str):
    """根据学生ID和练习类型获取最近 30 条练习记录"""
    result = await db.execute(
        select(PracticeSession)
        .where(PracticeSession.student_id == student_id, PracticeSession.practice_type == practice_type)
        .order_by(PracticeSession.create_time.desc())
        .limit(30)
    )
    return result.scalars().all()


async def get_daily_practice(db: AsyncSession, student_id: str):
    """获取学生的每日练习"""
    today = int(datetime.now().strftime("%Y%m%d"))
    result = await db.execute(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "daily",
            PracticeSession.target_id == today,
        )
    )
    return result.scalar_one_or_none()


async def generate_practice(db: AsyncSession, student_id: str, practice_type: str):
    """根据学生ID和练习类型生成练习"""
    today = int(datetime.now().strftime("%Y%m%d"))
    result = await db.execute(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == practice_type,
            PracticeSession.target_id == today,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        session = PracticeSession(student_id=student_id, session_type=practice_type, target_id=today)
        db.add(session)
        await db.commit()
        await db.refresh(session)
    else:
        session.status = "in_progress"
        await db.commit()
        await db.refresh(session)
    return session


async def regenerate_practice(db: AsyncSession, student_id: str, session_id: int):
    """根据学生ID和练习会话ID重新生成练习"""
    session = await get_practice_session(db, session_id)
    if not session:
        raise ValueError("练习会话不存在")
    return await generate_practice(db, student_id, session.session_type)
