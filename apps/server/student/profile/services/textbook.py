from shared.core.database import StudentTextbookConfig, Textbook
from shared.core.schema import TextbookSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def query_student_textbooks(db: AsyncSession, id: str):
    """查询学生的教材（通过教材配置）"""
    # 通过 JOIN 直接获取教材
    result = await db.execute(
        select(Textbook)
        .join(StudentTextbookConfig, StudentTextbookConfig.textbook_id == Textbook.id)
        .where(StudentTextbookConfig.student_id == id)
    )
    textbooks = result.scalars().all()
    return [TextbookSchema.model_validate(item) for item in textbooks]
