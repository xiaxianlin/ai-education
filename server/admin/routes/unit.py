from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateUnitSchema, UpdateUnitSchema
from admin.services import unit
from admin.services.knowledge import query_knowledge_by_unit
from admin.services.question import query_question_by_unit
from common.database import Database
from common.schema import ResponseSchema, SearchSchema

unit_router = APIRouter(prefix="/unit")


@unit_router.post("/")
async def create_unit(params: CreateUnitSchema, db: AsyncSession = Database):
    res = await unit.create_unit(db, params)
    return ResponseSchema(data=res)


@unit_router.put("/{id}")
async def update_unit(id: int, unit_update: UpdateUnitSchema, db: AsyncSession = Database):
    await unit.update_unit(db, id, unit_update)
    return ResponseSchema()


@unit_router.delete("/{id}")
async def delete_unit(id: int, db: AsyncSession = Database):
    await unit.delete_unit(db=db, id=id)
    return ResponseSchema()


@unit_router.patch("/{id}/status/{status}")
async def update_status(id: int, status: int, db: AsyncSession = Database):
    await unit.update_unit_status(db, id, status)
    return ResponseSchema()


@unit_router.get("/search")
async def search_unit(params: SearchSchema = Depends(), db: AsyncSession = Database):
    """获取课程单元列表"""
    data = await unit.search_unit(db, params)
    return ResponseSchema(data=data)


@unit_router.get("/{id}/knowledges")
async def query_knowledges(id: int, db: AsyncSession = Database):
    """获取PDF处理状态"""
    data = await query_knowledge_by_unit(db, id)
    return ResponseSchema(data=data)


@unit_router.get("/{id}/questions")
async def query_question(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    """获取PDF处理状态"""
    data = await query_question_by_unit(db, id, page, size)
    return ResponseSchema(data=data)
