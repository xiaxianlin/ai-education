from shared.core.database import Knowledge, Unit
from shared.core.schema import KnowledgeSchema, UnitSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload


async def query_textbook_units(db: AsyncSession, textbook_id: int):
    result = await db.scalars(
        select(Unit).options(noload(Unit.textbook)).where(Unit.textbook_id == textbook_id).order_by(Unit.id)
    )
    return [UnitSchema.model_validate(item) for item in result.all()]


async def get_unit_knowledges(db: AsyncSession, unit_id: int) -> list:
    result = await db.scalars(
        select(Knowledge)
        .options(noload(Knowledge.textbook), noload(Knowledge.unit))
        .where(Knowledge.unit_id == unit_id)
        .order_by(Knowledge.order, Knowledge.id)
    )

    return [KnowledgeSchema.model_validate(knowledge) for knowledge in result.all()]
