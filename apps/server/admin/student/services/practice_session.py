from shared.core.database import PracticeSession
from shared.core.schema import PracticeSessionSchema, StudentSchema
from shared.practice import practice_session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload


async def get_student_practice_sessions(db: AsyncSession, student: StudentSchema, practice_type: str):
    """查询学生练习历史
    
    Args:
        db: 数据库会话
        student: 学生信息
        practice_type: 练习类型 (ability_practice / unit_practice)
        
    Returns:
        List[PracticeSessionSchema]: 练习会话列表
    """
    practice_sessions = await db.scalars(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student.id,
            PracticeSession.practice_type == practice_type,
        )
        .order_by(PracticeSession.create_time.desc())
        .limit(30)
    )
    return [PracticeSessionSchema.model_validate(session) for session in practice_sessions]


async def get_student_practice_session_data(db: AsyncSession, student: StudentSchema, session_id: str):
    """查询学生练习会话详情
    
    Args:
        db: 数据库会话
        student: 学生信息
        session_id: 会话 ID (UUID v4)
        
    Returns:
        PracticeSessionDataSchema: 会话详情
    """
    return await practice_session.get_practice_session_data(db, student.id, session_id)
