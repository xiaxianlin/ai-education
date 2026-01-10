from shared.core.database import Practice
from shared.core.schema import PracticeSchema, StudentSchema
from shared.practice import practice
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_student_practice_sessions(
    db: AsyncSession,
    student: StudentSchema,
    page: int = 1,
    page_size: int = 20,
):
    """查询学生练习历史（支持分页）

    Args:
        db: 数据库会话
        student: 学生信息
        page: 页码（从1开始）
        page_size: 每页数量

    Returns:
        dict: 包含 data, total, page, pageSize 的分页结果
    """
    return await practice.get_practices(db, student.id, page=page, page_size=page_size)


async def get_student_practice_session_data(
    db: AsyncSession, student: StudentSchema, session_id: str
):
    """查询学生练习会话详情

    Args:
        db: 数据库会话
        student: 学生信息
        session_id: 会话 ID (UUID v4)

    Returns:
        PracticeDataSchema: 练习详情
    """
    return await practice.get_practice_data(db, student.id, session_id)
