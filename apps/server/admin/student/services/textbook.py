from shared.core.database import StudentTextbook, Textbook
from shared.core.schema import StudentSchema, TextbookSchema
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession


async def add_student_textbook(db: AsyncSession, student: StudentSchema, textbook_ids: list[int]):
    """添加学生的教材"""
    # 检查所有教材是否存在
    textbooks = await db.scalars(select(Textbook).where(Textbook.id.in_(textbook_ids)))
    existing_textbook_ids = {textbook.id for textbook in textbooks.all()}

    # 检查是否有不存在的教材
    missing_ids = set(textbook_ids) - existing_textbook_ids
    if missing_ids:
        raise ValueError(f"教材不存在: {missing_ids}")

    # 查询已添加的教材
    existing_records = await db.scalars(
        select(StudentTextbook).where(
            StudentTextbook.student_id == student.id, StudentTextbook.textbook_id.in_(textbook_ids)
        )
    )
    already_added_ids = {record.textbook_id for record in existing_records.all()}

    # 过滤出未添加的教材ID
    new_textbook_ids = set(textbook_ids) - already_added_ids

    # 批量添加未添加的教材
    if new_textbook_ids:
        records = [StudentTextbook(student_id=student.id, textbook_id=textbook_id) for textbook_id in new_textbook_ids]
        db.add_all(records)
        await db.commit()


async def remove_student_textbook(db: AsyncSession, student: StudentSchema, textbook_ids: list[int]):
    """批量移除学生的教材"""
    await db.execute(
        delete(StudentTextbook).where(
            StudentTextbook.student_id == student.id, StudentTextbook.textbook_id.in_(textbook_ids)
        )
    )
    await db.commit()


async def get_student_textbooks(db: AsyncSession, student: StudentSchema):
    """查询学生的教材"""
    result = await db.scalars(
        select(Textbook)
        .join(StudentTextbook, StudentTextbook.textbook_id == Textbook.id)
        .where(StudentTextbook.student_id == student.id)
    )
    return [TextbookSchema.model_validate(item) for item in result.all()]


async def get_student_unused_textbooks(db: AsyncSession, student: StudentSchema):
    """查询学生的教材"""
    used_textbooks = await get_student_textbooks(db, student)
    ids = [textbook.id for textbook in used_textbooks]
    stmt = select(Textbook).where(Textbook.id.not_in(ids)).order_by(Textbook.grade)
    result = await db.scalars(stmt)
    return [TextbookSchema.model_validate(item) for item in result.all()]
