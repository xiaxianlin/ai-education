from shared.core.database import Student, StudentSubjectVersion, Textbook
from shared.core.schema import TextbookSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def query_student_textbooks(db: AsyncSession, id: str):
    """查询学生的教材（通过科目版本关联）"""
    # 1. 先查询学生的科目版本关联
    result = await db.scalars(select(StudentSubjectVersion).where(StudentSubjectVersion.student_id == id))
    subject_versions = result.all()

    if not subject_versions:
        return []

    # 2. 获取学生的年级和学期
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student or not student.grade or not student.semester:
        return []

    # 3. 对于每个科目版本关联，根据学生的年级、学期查询对应的教材
    textbooks = []
    for sv in subject_versions:
        result = await db.scalars(
            select(Textbook).where(
                Textbook.subject == sv.subject,
                Textbook.version == sv.version,
                Textbook.grade == student.grade,
                Textbook.semester == student.semester,
            )
        )
        textbooks.extend([TextbookSchema.model_validate(item) for item in result.all()])

    return textbooks
