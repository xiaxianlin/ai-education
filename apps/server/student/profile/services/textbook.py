from shared.core.database import StudentTextbookConfig, Textbook
from shared.core.schema import TextbookSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def query_student_textbooks(db: AsyncSession, id: str):
    """查询学生的教材（通过教材配置）"""

    # 1. 查询学生的教材配置
    result = await db.scalars(select(StudentTextbookConfig).where(StudentTextbookConfig.student_id == id))

    configs = result.all()
    if not configs:
        return []

    # 2. 根据配置查找对应的 Textbook
    textbooks = []
    for config in configs:
        textbook_result = await db.scalars(
            select(Textbook).where(
                Textbook.subject == config.subject,
                Textbook.version == config.version,
                Textbook.grade == config.grade,
                Textbook.semester == config.semester,
            )
        )
        textbooks.extend([TextbookSchema.model_validate(item) for item in textbook_result.all()])

    return textbooks
