from shared.core.database import StudentPractice
from shared.core.schema import PracticeSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload


async def get_student_practices(db: AsyncSession, id: str):
    """查询学生的教材"""
    result = await db.scalars(
        select(StudentPractice).options(joinedload(StudentPractice.practice)).where(StudentPractice.student_id == id)
    )
    return [PracticeSchema.model_validate(item.practice) for item in result.all()]
