from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.knowledge import KnowledgeService
from store.database import GetDB
from schema import (
    SearchSchema,
    ResponseSchema,
    KnowledgeCreateSchema,
    KnowledgeUpdateSchema,
)

router = APIRouter(prefix="/knowledge")


@router.get("/search")
async def search_knowledge(params: SearchSchema, db: AsyncSession = GetDB):
    """获取知识点列表"""
    res = KnowledgeService.search(db, params)
    return ResponseSchema(data=res)


@router.post("/")
async def create_knowledge(knowledge: KnowledgeCreateSchema, db: AsyncSession = GetDB):
    """创建知识点"""
    id = await KnowledgeService.create(db, knowledge)
    return ResponseSchema(data=id)


@router.get("/{knowledge_id}")
async def get_knowledge(knowledge_id: int, db: AsyncSession = GetDB):
    """获取单个知识点"""
    knowledge = await KnowledgeService.get_by_id(db, knowledge_id)
    return ResponseSchema(data=knowledge)


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
