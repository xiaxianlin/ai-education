from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateKnowledgeSchema, UpdateKnowledgeSchema
from admin.services import knowledge
from admin.services.question import query_question_by_unit
from core.database import Database
from core.schema import SearchSchema

knowledge_router = APIRouter(prefix="/knowledge")


@knowledge_router.post("/")
async def create_knowledge(params: CreateKnowledgeSchema, db: AsyncSession = Database):
    return await knowledge.create_knowledge(db, params)


@knowledge_router.patch("/{id}")
async def update_knowledge(id: str, params: UpdateKnowledgeSchema, db: AsyncSession = Database):
    await knowledge.update_knowledge(db, id, params)


@knowledge_router.delete("/{id}")
async def delete_knowledge(id: str, db: AsyncSession = Database):
    await knowledge.delete_knowledge(db, id=id)


@knowledge_router.get("/search")
async def search_knowledge(params: SearchSchema = Depends(), db: AsyncSession = Database):
    return await knowledge.search_knowledge(db, params)


@knowledge_router.get("/{id}/questions")
async def query_question(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    return await query_question_by_unit(db, id, page, size)
