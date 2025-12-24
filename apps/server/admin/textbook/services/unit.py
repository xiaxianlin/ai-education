from __future__ import annotations

from typing import List

from shared.core.database import Knowledge, Textbook, Unit
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import CreateUnitSchema, UpdateUnitSchema


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
    # status 字段已移除，不再处理

    await db.commit()


async def delete_unit(db: AsyncSession, id: int) -> bool:
    """删除课程单元"""
    unit = await db.scalar(select(Unit).where(Unit.id == id))
    if not unit:
        raise ValueError("课程单元不存在")

    knowledge_ids_result = await db.scalars(select(Knowledge.id).where(Knowledge.unit_id == id))
    knowledge_ids = knowledge_ids_result.all()

    if knowledge_ids:
        await db.execute(delete(Knowledge).where(Knowledge.id.in_(knowledge_ids)))

    await db.delete(unit)
    await db.commit()


async def query_units_by_textbook(db: AsyncSession, textbook_id: int) -> List[Unit]:
    """根据教材ID查询课程单元"""
    units_result = await db.scalars(select(Unit).where(Unit.textbook_id == textbook_id).order_by(Unit.id))
    return units_result.all()
