from shared.core.database import PracticeSession
from shared.core.schema import PracticeSessionSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_student_practice_sessions(db: AsyncSession, student_id: str, session_type: str):
    """查询学生练习历史"""
    practice_sessions = await db.scalars(
        select(PracticeSession).where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == session_type,
        )
    )
    return [PracticeSessionSchema.model_validate(session) for session in practice_sessions]
