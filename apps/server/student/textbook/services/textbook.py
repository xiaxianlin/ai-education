from shared.core.database import Unit
from shared.core.schema import UnitSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload


async def query_textbook_units(db: AsyncSession, textbook_id: int):
    result = await db.scalars(
        select(Unit).options(noload(Unit.textbook)).where(Unit.textbook_id == textbook_id).order_by(Unit.id)
    )
    return [UnitSchema.model_validate(item) for item in result.all()]
