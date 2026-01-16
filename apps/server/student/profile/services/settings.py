from shared.core.database import Student
from shared.util.time import now
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import UpdateStudentSettingsSchema


async def update_student_settings(db: AsyncSession, student_id: str, params: UpdateStudentSettingsSchema):
    """更新学生设置"""
    await db.execute(
        update(Student)
        .where(Student.id == student_id)
        .values(
            grade=params.grade,
            semester=params.semester,
            subject=params.subject,
            update_time=now(),
        )
    )
    await db.commit()
