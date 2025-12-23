from shared.core.database import PracticeSession
from shared.core.schema import PracticeSessionSchema, StudentSchema
from shared.services import practice_session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload


async def get_student_practice_sessions(db: AsyncSession, student: StudentSchema, practice_id: int):
    """查询学生练习历史"""
    practice_sessions = await db.scalars(
        select(PracticeSession)
        .options(joinedload(PracticeSession.practice))
        .where(
            PracticeSession.student_id == student.id,
            PracticeSession.practice_id == practice_id,
        )
        .order_by(PracticeSession.create_time.desc())
        .limit(30)
    )
    return [PracticeSessionSchema.model_validate(session) for session in practice_sessions]


async def get_student_practice_session_data(db: AsyncSession, student: StudentSchema, session_id: int):
    """查询学生练习会话详情"""
    return await practice_session.get_practice_session_data(db, student.id, session_id)
