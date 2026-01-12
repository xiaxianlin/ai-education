from shared.core.database import Student, StudentTextbookConfig, Textbook
from shared.core.schema import StudentSchema, StudentTextbookConfigSchema, TextbookSchema
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession


async def set_student_textbook_configs(
    db: AsyncSession, student: StudentSchema, configs: list[dict[str, str | int]]
):
    """批量设置学生教材配置（覆盖式）"""
    # 1. 先删除该学生的所有配置记录
    await db.execute(delete(StudentTextbookConfig).where(StudentTextbookConfig.student_id == student.id))

    # 2. 批量插入新的配置记录
    if configs:
        records = [
            StudentTextbookConfig(
                student_id=student.id,
                subject=config["subject"],
                grade=config["grade"],
                semester=config["semester"],
                version=config["version"],
            )
            for config in configs
        ]
        db.add_all(records)

    await db.commit()


async def get_student_textbook_configs(db: AsyncSession, student: StudentSchema):
    """查询学生的教材配置列表"""
    result = await db.scalars(
        select(StudentTextbookConfig).where(StudentTextbookConfig.student_id == student.id)
    )
    return [StudentTextbookConfigSchema.model_validate(item) for item in result.all()]


async def get_student_textbooks(db: AsyncSession, student: StudentSchema):
    """根据配置查询实际教材（根据 subject/grade/semester/version 查找 Textbook）"""
    # 1. 查询学生的教材配置
    configs = await get_student_textbook_configs(db, student)

    if not configs:
        return []

    # 2. 对于每个配置，查找对应的 Textbook
    textbooks = []
    for config in configs:
        result = await db.scalars(
            select(Textbook).where(
                Textbook.subject == config.subject,
                Textbook.version == config.version,
                Textbook.grade == config.grade,
                Textbook.semester == config.semester,
            )
        )
        textbooks.extend([TextbookSchema.model_validate(item) for item in result.all()])

    return textbooks
