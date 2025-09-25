from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.knowledge import KnowledgeService
from service.admin.question import QuestionService
from store.database import GetDB
from schema import (
    SearchSchema,
    ResponseSchema,
    KnowledgeCreateSchema,
    KnowledgeUpdateSchema,
)

router = APIRouter(prefix="/knowledge")


@router.post("/")
async def create_knowledge(knowledge: KnowledgeCreateSchema, db: AsyncSession = GetDB):
    """创建知识点"""
    id = await KnowledgeService.create(db, knowledge)
    return ResponseSchema(data=id)


@router.patch("/{knowledge_id}")
async def update_knowledge(
    knowledge_id: str, knowledge: KnowledgeUpdateSchema, db: AsyncSession = GetDB
):
    """更新知识点"""
    await KnowledgeService.update(db, knowledge_id, knowledge)
    return ResponseSchema()


@router.delete("/{knowledge_id}")
async def delete_knowledge(knowledge_id: str, db: AsyncSession = GetDB):
    """删除知识点"""
    await KnowledgeService.delete(db=db, knowledge_id=knowledge_id)
    return ResponseSchema()


@router.get("/search")
async def search_knowledge(params: SearchSchema = Depends(), db: AsyncSession = GetDB):
    """获取知识点列表"""
    res = await KnowledgeService.search(db, params)
    return ResponseSchema(data=res)


@router.get("/{id}/questions")
async def get_questions(
    id: int,
    current_page: int = 1,
    page_size: int = 10,
    db: AsyncSession = GetDB,
):
    """获取PDF处理状态"""
    data = await QuestionService.get_by_knowledge(db, id, current_page, page_size)
    return ResponseSchema(data=data)


@router.get("/{knowledge_id}")
async def get_knowledge(knowledge_id: int, db: AsyncSession = GetDB):
    """获取单个知识点"""
    knowledge = await KnowledgeService.get_by_id(db, knowledge_id)
    return ResponseSchema(data=knowledge)
