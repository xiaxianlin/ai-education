from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateUnitSchema, UnitGenerateQuestionSchema, UpdateUnitSchema
from admin.services import unit
from admin.services.knowledge import query_knowledge_by_unit
from admin.services.question import query_question_by_unit
from common.database import Database
from common.schema import SearchSchema
from shared.services.question import generate_question_by_unit

unit_router = APIRouter(prefix="/unit")


@unit_router.post("/")
async def create_unit(params: CreateUnitSchema, db: AsyncSession = Database):
    return await unit.create_unit(db, params)


@unit_router.post("/{id}/generate")
async def create_unit(id: int, db: AsyncSession = Database):
    return await generate_question_by_unit(db, id, 30)


@unit_router.put("/{id}")
async def update_unit(id: int, unit_update: UpdateUnitSchema, db: AsyncSession = Database):
    await unit.update_unit(db, id, unit_update)


@unit_router.delete("/{id}")
async def delete_unit(id: int, db: AsyncSession = Database):
    await unit.delete_unit(db=db, id=id)


@unit_router.patch("/{id}/status/{status}")
async def update_status(id: int, status: int, db: AsyncSession = Database):
    await unit.update_unit_status(db, id, status)


@unit_router.get("/search")
async def search_unit(params: SearchSchema = Depends(), db: AsyncSession = Database):
    return await unit.search_unit(db, params)


@unit_router.get("/{id}/knowledges")
async def query_knowledges(id: int, db: AsyncSession = Database):
    return await query_knowledge_by_unit(db, id)


@unit_router.get("/{id}/questions")
async def query_question(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    return await query_question_by_unit(db, id, page, size)
