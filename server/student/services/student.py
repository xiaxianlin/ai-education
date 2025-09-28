from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from common.database import Student, StudentTextbook
from common.schema import TextbookSchema


async def query_student_textbook(db: AsyncSession, id: str):
    """查询学生的教材"""
    result = await db.scalars(
        select(StudentTextbook)
        .options(joinedload(StudentTextbook.textbook))
        .where(Student.id == id)
    )
    return [TextbookSchema.model_validate(item.textbook) for item in result.all()]
