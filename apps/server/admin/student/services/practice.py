from shared.core.database import Practice, StudentPractice
from shared.core.schema import PracticeSchema, StudentSchema
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession


async def add_student_practice(db: AsyncSession, student: StudentSchema, practice_ids: list[int]):
    """添加学生的练习"""
    # 检查所有练习是否存在
    practices = await db.scalars(select(Practice).where(Practice.id.in_(practice_ids)))
    existing_practice_ids = {practice.id for practice in practices.all()}

    # 检查是否有不存在的练习
    missing_ids = set(practice_ids) - existing_practice_ids
    if missing_ids:
        raise ValueError(f"练习不存在: {missing_ids}")

    # 查询已添加的练习
    existing_records = await db.scalars(
        select(StudentPractice).where(
            StudentPractice.student_id == student.id, StudentPractice.practice_id.in_(practice_ids)
        )
    )
    already_added_ids = {record.practice_id for record in existing_records.all()}

    # 过滤出未添加的练习ID
    new_practice_ids = set(practice_ids) - already_added_ids

    # 批量添加未添加的练习
    if new_practice_ids:
        # 获取当前最大的 sort_order
        max_sort_order_result = await db.scalar(
            select(func.max(StudentPractice.sort_order))
            .where(StudentPractice.student_id == student.id)
        )
        max_sort_order = max_sort_order_result if max_sort_order_result is not None else -1
        
        records = [
            StudentPractice(
                student_id=student.id,
                practice_id=practice_id,
                sort_order=max_sort_order + 1 + idx
            )
            for idx, practice_id in enumerate(new_practice_ids)
        ]
        db.add_all(records)
        await db.commit()


async def remove_student_practice(db: AsyncSession, student: StudentSchema, practice_ids: list[int]):
    """批量移除学生的练习"""
    await db.execute(
        delete(StudentPractice).where(
            StudentPractice.student_id == student.id, StudentPractice.practice_id.in_(practice_ids)
        )
    )
    await db.commit()


async def get_student_practices(db: AsyncSession, student: StudentSchema):
    """查询学生的练习"""
    result = await db.scalars(
        select(Practice)
        .join(StudentPractice, StudentPractice.practice_id == Practice.id)
        .where(StudentPractice.student_id == student.id)
        .order_by(StudentPractice.sort_order.asc(), StudentPractice.id.asc())
    )
    return [PracticeSchema.model_validate(item) for item in result.all()]


async def get_student_unused_practices(db: AsyncSession, student: StudentSchema):
    """查询学生未选练习"""
    used_practices = await get_student_practices(db, student)
    ids = [practice.id for practice in used_practices]
    stmt = select(Practice)
    if ids:
        stmt = stmt.where(Practice.id.not_in(ids))
    result = await db.scalars(stmt.order_by(Practice.id))
    return [PracticeSchema.model_validate(item) for item in result.all()]
