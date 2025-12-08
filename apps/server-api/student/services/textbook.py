from sqlalchemy import select
from sqlalchemy.orm import joinedload, noload
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import StudentTextbook, Unit, Knowledge
from shared.core.schema import TextbookSchema, UnitSchema, KnowledgeSchema


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

    result = await db.scalars(
        select(Unit)
        .options(noload(Unit.textbook))
        .where(Unit.textbook_id == textbook_id)
        .order_by(Unit.id)
    )
    return [UnitSchema.model_validate(item) for item in result.all()]


async def get_unit_knowledges(db: AsyncSession, student_id: str, unit_id: int) -> list:
    """
    获取单元的知识点列表

    需要验证：
    1. 单元存在
    2. 单元所属的教材是学生的教材

    Args:
        db: 数据库会话
        student_id: 学生ID
        unit_id: 单元ID

    Returns:
        知识点列表

    Raises:
        ValueError: 单元不存在或学生无权访问
    """
    # 查询单元信息
    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
    if not unit:
        raise ValueError("单元不存在")

    # 验证学生是否有权限访问该单元（检查单元所属教材是否是学生的教材）
    student_textbook = await db.scalar(
        select(StudentTextbook).where(
            StudentTextbook.student_id == student_id,
            StudentTextbook.textbook_id == unit.textbook_id,
        )
    )
    if not student_textbook:
        raise ValueError("无权访问该单元")

    # 查询知识点列表
    knowledges = await db.scalars(
        select(Knowledge)
        .options(noload(Knowledge.textbook), noload(Knowledge.unit))
        .where(Knowledge.unit_id == unit_id)
        .order_by(Knowledge.order, Knowledge.id)
    )

    return [KnowledgeSchema.model_validate(knowledge) for knowledge in knowledges.all()]
