from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import CreateKnowledgeSchema, UpdateKnowledgeSchema
from admin.services import knowledge
from admin.services.question import query_question_by_unit
from common.database import Database
from common.schema import ResponseSchema, SearchSchema

knowledge_router = APIRouter(prefix="/knowledge")


@knowledge_router.post("/")
async def create_knowledge(params: CreateKnowledgeSchema, db: AsyncSession = Database):
    """创建知识点"""
    id = await knowledge.create_knowledge(db, params)
    return ResponseSchema(data=id)


@knowledge_router.patch("/{id}")
async def update_knowledge(id: str, params: UpdateKnowledgeSchema, db: AsyncSession = Database):
    """更新知识点"""
    await knowledge.update_knowledge(db, id, params)
    


@knowledge_router.delete("/{id}")
async def delete_knowledge(id: str, db: AsyncSession = Database):
    """删除知识点"""
    await knowledge.delete_knowledge(db, id=id)
    


@knowledge_router.get("/search")
async def search_knowledge(params: SearchSchema = Depends(), db: AsyncSession = Database):
    """获取知识点列表"""
    res = await knowledge.search_knowledge(db, params)
    return ResponseSchema(data=res)


@knowledge_router.get("/{id}/questions")
async def query_question(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    """获取PDF处理状态"""
    data = await query_question_by_unit(db, id, page, size)
    return ResponseSchema(data=data)


@knowledge_router.get("/{id}")
async def query_knowledge(id: int, db: AsyncSession = Database):
    """获取单个知识点"""
    data = await knowledge.query_knowledge_by_unit(db, id)
    return ResponseSchema(data=data)
