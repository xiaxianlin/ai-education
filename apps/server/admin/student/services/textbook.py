from shared.core.database import StudentTextbookConfig, Textbook
from shared.core.schema import StudentSchema, TextbookSchema
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession


async def set_student_textbook_configs(
    db: AsyncSession, student: StudentSchema, textbook_ids: list[int]
):
    """批量设置学生教材配置（覆盖式）"""
    # 1. 先删除该学生的所有配置记录
    await db.execute(
        delete(StudentTextbookConfig).where(StudentTextbookConfig.student_id == student.id)
    )

    # 2. 批量插入新的配置记录
    if textbook_ids:
        # 去重
        unique_ids = list(set(textbook_ids))
        records = [
            StudentTextbookConfig(
                student_id=student.id,
                textbook_id=textbook_id,
            )
            for textbook_id in unique_ids
        ]
        db.add_all(records)

    await db.commit()


async def get_student_textbook_configs(db: AsyncSession, student: StudentSchema):
    """查询学生的教材配置列表"""
    result = await db.scalars(
        select(StudentTextbookConfig).where(StudentTextbookConfig.student_id == student.id)
    )
    return result.all()


async def get_student_textbooks(db: AsyncSession, student: StudentSchema):
    """查询学生配置的教材列表"""
    # 通过 JOIN 直接获取教材
    result = await db.execute(
        select(Textbook)
        .join(StudentTextbookConfig, StudentTextbookConfig.textbook_id == Textbook.id)
        .where(StudentTextbookConfig.student_id == student.id)
    )
    textbooks = result.scalars().all()
    return [TextbookSchema.model_validate(item) for item in textbooks]
