from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import StudentTextbook, Unit
from core.schema import TextbookSchema, UnitSchema


async def query_student_textbooks(db: AsyncSession, id: str):
    """查询学生的教材"""
    result = await db.scalars(
        select(StudentTextbook)
        .options(joinedload(StudentTextbook.textbook))
        .where(StudentTextbook.student_id == id)
    )
    return [TextbookSchema.model_validate(item.textbook) for item in result.all()]


async def query_textbook_units(db: AsyncSession, student_id: str, textbook_id: int):
    """查询教材的单元列表"""
    result = await db.scalar(
        select(StudentTextbook).where(
            StudentTextbook.student_id == student_id, StudentTextbook.textbook_id == textbook_id
        )
    )
    if not result:
        raise ValueError("当前教材未购买")

    result = await db.scalars(select(Unit).where(Unit.textbook_id == textbook_id).order_by(Unit.id))
    return [UnitSchema.model_validate(item) for item in result.all()]


async def get_active_textbook(db: AsyncSession, student_id: str):
    """获取学生当前激活的教材"""
    result = await db.scalar(
        select(StudentTextbook)
        .options(joinedload(StudentTextbook.textbook))
        .where(StudentTextbook.student_id == student_id, StudentTextbook.active == 1)
    )
    if result:
        return TextbookSchema.model_validate(result.textbook)
    return None


async def activate_student_textbook(db: AsyncSession, student_id: str, textbook_id: int):
    """激活指定教材为学生的当前使用教材"""

    # 取消当前激活的教材
    active_textbook = await db.scalar(
        select(StudentTextbook).where(
            StudentTextbook.student_id == student_id, StudentTextbook.active == 1
        )
    )

    if active_textbook:
        active_textbook.active = 0

    result = await db.scalar(
        select(StudentTextbook).where(
            StudentTextbook.student_id == student_id, StudentTextbook.textbook_id == textbook_id
        )
    )
    if not result:
        raise ValueError("教材未购买，无法激活")

    if result.active == 1:
        db.commit()
        return

    # 激活指定教材
    result = await db.scalar(
        select(StudentTextbook).where(
            StudentTextbook.student_id == student_id, StudentTextbook.textbook_id == textbook_id
        )
    )

    if result:
        result.active = 1

    await db.commit()
