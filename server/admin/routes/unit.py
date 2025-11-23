from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateUnitSchema, UpdateUnitSchema
from admin.services import unit
from admin.services.knowledge import query_knowledge_by_unit
from admin.services.question import query_question_by_unit
from core.database import Database
from core.schema import SearchSchema

unit_router = APIRouter(prefix="/unit")


@unit_router.post("/")
async def create_unit(params: CreateUnitSchema, db: AsyncSession = Database):
    """创建课程单元"""
    return await unit.create_unit(db, params)


@unit_router.post("/{id}/generate")
async def generate_question(id: int, count: int = 30, db: AsyncSession = Database):
    """
    生成课程单元相关题目
    
    Args:
        id: 单元ID
        count: 生成题目数量，默认30道
        
    Returns:
        生成的题目列表
    """
    return await unit.generate_unit_questions(db, id, count)


@unit_router.patch("/{id}")
async def update_unit(id: int, unit_update: UpdateUnitSchema, db: AsyncSession = Database):
    """更新课程单元"""
    await unit.update_unit(db, id, unit_update)


@unit_router.delete("/{id}")
async def delete_unit(id: int, db: AsyncSession = Database):
    """删除课程单元"""
    await unit.delete_unit(db=db, id=id)


@unit_router.get("/search")
async def search_unit(params: SearchSchema = Depends(), db: AsyncSession = Database):
    """搜索课程单元"""
    return await unit.search_unit(db, params)


@unit_router.get("/{id}/knowledges")
async def query_knowledges(id: int, db: AsyncSession = Database):
    """查询课程单元下的知识点"""
    return await query_knowledge_by_unit(db, id)


@unit_router.get("/{id}/questions")
async def query_question(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    """查询课程单元下的题目"""
    return await query_question_by_unit(db, id, page, size)
