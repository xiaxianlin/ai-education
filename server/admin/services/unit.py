from sqlalchemy import delete, or_, select, func
from sqlalchemy.orm import noload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Tuple
from core.schema import SearchResultSchema, SearchSchema, UnitSchema
from core.database import Unit, Knowledge, Textbook, QuestionKnowledge
from admin.schema import CreateUnitSchema, UpdateUnitSchema
from shared.utils.time import now


async def create_unit(db: AsyncSession, create: CreateUnitSchema) -> Unit:
    """创建课程单元"""
    textbook = await db.scalar(select(Textbook).where(Textbook.id == create.textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

    unit = Unit(
        textbook_id=create.textbook_id,
        name=create.name,
        content=create.content,
    )

    db.add(unit)
    await db.commit()
    await db.refresh(unit)
    return unit.id


async def update_unit(db: AsyncSession, id: int, update: UpdateUnitSchema):
    """更新课程单元"""
    unit = await db.scalar(select(Unit).where(Unit.id == id))
    if not unit:
        raise ValueError("课程单元不存在")

    if update.name is not None:
        unit.name = update.name
    if update.content is not None:
        unit.content = update.content
    if update.status is not None:
        unit.status = update.status

    unit.update_time = now()
    await db.commit()


async def delete_unit(db: AsyncSession, id: int) -> bool:
    """删除课程单元"""
    unit = await db.scalar(select(Unit).where(Unit.id == id))
    if not unit:
        raise ValueError("课程单元不存在")

    knowledge_ids_result = await db.scalars(
        select(Knowledge.id).where(Knowledge.unit_id == id)
    )
    knowledge_ids = knowledge_ids_result.all()

    if knowledge_ids:
        await db.execute(
            delete(QuestionKnowledge).where(QuestionKnowledge.knowledge_id.in_(knowledge_ids))
        )
        await db.execute(delete(Knowledge).where(Knowledge.id.in_(knowledge_ids)))

    await db.delete(unit)
    await db.commit()


async def search_unit(db: AsyncSession, params: SearchSchema) -> Tuple[List[Unit], int]:
    """搜索课程单元"""
    query = select(Unit).options(noload(Unit.textbook))

    if params.keywords:
        query = query.where(
            or_(
                Unit.name.contains(params.keywords),
                Unit.content.contains(params.keywords),
            )
        )

    # 获取总数
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (params.page - 1) * params.size
    query = query.order_by(Unit.id).offset(offset).limit(params.size)
    units = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[UnitSchema.model_validate(unit) for unit in units.all()],
    )


async def query_unit_by_textbook(db: AsyncSession, textbook_id: int):
    query = select(Unit).where(Unit.textbook_id == textbook_id).options(noload(Unit.textbook))
    results = await db.scalars(query)
    return [UnitSchema.model_validate(unit) for unit in results.all()]
