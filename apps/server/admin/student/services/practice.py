from shared.core.database import Practice
from shared.core.schema import PracticeSchema, StudentSchema
from shared.practice import practice_session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_student_practice_sessions(db: AsyncSession, student: StudentSchema, practice_type: str):
    """查询学生练习历史

    Args:
        db: 数据库会话
        student: 学生信息
        practice_type: 练习类型 (ability_practice / unit_practice)

    Returns:
        List[PracticeSchema]: 练习列表
    """
    practice_sessions = await db.scalars(
        select(Practice)
        .where(
            Practice.student_id == student.id,
            Practice.practice_type == practice_type,
        )
        .order_by(Practice.create_time.desc())
        .limit(30)
    )
    return [PracticeSchema.model_validate(session) for session in practice_sessions]


async def get_student_practice_session_data(db: AsyncSession, student: StudentSchema, session_id: str):
    """查询学生练习会话详情

    Args:
        db: 数据库会话
        student: 学生信息
        session_id: 会话 ID (UUID v4)

    Returns:
        PracticeDataSchema: 练习详情
    """
    return await practice_session.get_practice_session_data(db, student.id, session_id)
