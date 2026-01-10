from shared.core.database import Student, StudentSubjectVersion, Textbook
from shared.core.schema import StudentSchema, StudentSubjectVersionSchema, TextbookSchema
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession


async def set_student_subject_versions(
    db: AsyncSession, student: StudentSchema, subject_versions: list[dict[str, str]]
):
    """一次性设置学生科目版本（覆盖旧数据）"""
    # 1. 先删除该学生的所有科目版本记录
    await db.execute(delete(StudentSubjectVersion).where(StudentSubjectVersion.student_id == student.id))

    # 2. 过滤掉 version 为空或 None 的项（表示清除版本）
    valid_records = [
        {"student_id": student.id, "subject": item["subject"], "version": item["version"]}
        for item in subject_versions
        if item.get("version") and item.get("version").strip()
    ]

    # 3. 批量插入有效的科目版本记录
    if valid_records:
        records = [
            StudentSubjectVersion(
                student_id=record["student_id"], subject=record["subject"], version=record["version"]
            )
            for record in valid_records
        ]
        db.add_all(records)

    await db.commit()


async def get_student_subject_versions(db: AsyncSession, student: StudentSchema):
    """查询学生科目版本"""
    result = await db.scalars(
        select(StudentSubjectVersion).where(StudentSubjectVersion.student_id == student.id)
    )
    return [
        StudentSubjectVersionSchema.model_validate(item) for item in result.all()
    ]


async def get_textbook_by_subject_version(
    db: AsyncSession, student: StudentSchema, subject: str, version: str
):
    """通过学生-科目-版本查询教材"""
    # 获取学生的年级和学期
    student_obj = await db.scalar(select(Student).where(Student.id == student.id))
    if not student_obj or not student_obj.grade or not student_obj.semester:
        return None

    result = await db.scalar(
        select(Textbook).where(
            Textbook.subject == subject,
            Textbook.version == version,
            Textbook.grade == student_obj.grade,
            Textbook.semester == student_obj.semester,
        )
    )
    return TextbookSchema.model_validate(result) if result else None


async def get_student_textbooks(db: AsyncSession, student: StudentSchema):
    """查询学生的教材（通过科目版本关联）"""
    # 1. 查询学生的科目版本关联
    subject_versions = await get_student_subject_versions(db, student)

    # 2. 获取学生的年级和学期
    student_obj = await db.scalar(select(Student).where(Student.id == student.id))
    if not student_obj or not student_obj.grade or not student_obj.semester:
        return []

    # 3. 对于每个科目版本关联，根据学生的年级、学期查询对应的教材
    textbooks = []
    for sv in subject_versions:
        result = await db.scalars(
            select(Textbook).where(
                Textbook.subject == sv.subject,
                Textbook.version == sv.version,
                Textbook.grade == student_obj.grade,
                Textbook.semester == student_obj.semester,
            )
        )
        textbooks.extend([TextbookSchema.model_validate(item) for item in result.all()])

    return textbooks
