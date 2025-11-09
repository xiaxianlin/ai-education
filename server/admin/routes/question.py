from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import SearchQuestionSchema, UpdateQuestionSchema
from admin.services import question
from common.database import Database

question_router = APIRouter(prefix="/question")


@question_router.patch("/{id}")
async def update_question(id: str, update: UpdateQuestionSchema, db: AsyncSession = Database):
    await question.update_question(db, id, update)


@question_router.delete("/{id}")
async def delete_question(id: str, db: AsyncSession = Database):
    await question.delete_question(db, id)


@question_router.get("/search")
async def search_question(params: SearchQuestionSchema = Depends(), db: AsyncSession = Database):
    return await question.search_question(db, params)


@question_router.get("/{id}")
async def get_question(id: str, db: AsyncSession = Database):
    return await question.get_question(db, id)


@question_router.post("/{id}/generate_image")
async def generate_question_image(id: str, db: AsyncSession = Database):
    """为单个问题生成图片"""
    await question.generate_question_image(db, id)


@question_router.post("/{id}/generate_audio")
async def generate_question_audio(id: str, db: AsyncSession = Database):
    """为单个问题生成语音"""
    await question.generate_question_audio(db, id)
