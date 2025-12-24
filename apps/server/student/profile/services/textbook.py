from shared.core.database import StudentTextbook
from shared.core.schema import TextbookSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload


async def query_student_textbooks(db: AsyncSession, id: str):
    """查询学生的教材"""
    result = await db.scalars(
        select(StudentTextbook).options(joinedload(StudentTextbook.textbook)).where(StudentTextbook.student_id == id)
    )
    return [TextbookSchema.model_validate(item.textbook) for item in result.all()]
