from shared.core.database import Student, StudentTextbookConfig, Textbook
from shared.core.schema import TextbookSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def query_student_textbooks(db: AsyncSession, id: str):
    """查询学生的教材（通过教材配置）"""
    # 1. 获取学生的年级、学期、学科
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student or not student.grade or not student.semester or not student.subject:
        return []

    # 2. 查询匹配的教材配置（根据学生的 grade/semester/subject）
    result = await db.scalar(
        select(StudentTextbookConfig).where(
            StudentTextbookConfig.student_id == id,
            StudentTextbookConfig.grade == student.grade,
            StudentTextbookConfig.semester == student.semester,
            StudentTextbookConfig.subject == student.subject,
        )
    )

    if not result:
        return []

    # 3. 根据配置查找对应的 Textbook
    textbook_result = await db.scalars(
        select(Textbook).where(
            Textbook.subject == result.subject,
            Textbook.version == result.version,
            Textbook.grade == result.grade,
            Textbook.semester == result.semester,
        )
    )
    textbooks = [TextbookSchema.model_validate(item) for item in textbook_result.all()]

    return textbooks
