from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import CreateQuestionSchema, SearchQuestionSchema, UpdateQuestionSchema
from admin.services import question
from shared.core.database import Database

question_router = APIRouter(prefix="/question")


@question_router.post("/")
async def create_question(data: CreateQuestionSchema, db: AsyncSession = Database):
    """创建题目"""
    return await question.create_question(db, data)


@question_router.patch("/{id}")
async def update_question(id: str, update: UpdateQuestionSchema, db: AsyncSession = Database):
    """更新题目"""
    await question.update_question(db, id, update)


@question_router.delete("/{id}")
async def delete_question(id: str, db: AsyncSession = Database):
    """删除题目"""
    await question.delete_question(db, id)


@question_router.get("/search")
async def search_question(params: SearchQuestionSchema = Depends(), db: AsyncSession = Database):
    """搜索题目"""
    return await question.search_question(db, params)


@question_router.get("/{id}")
async def get_question(id: str, db: AsyncSession = Database):
    """获取单个题目详情"""
    return await question.get_question(db, id)


@question_router.post("/{id}/image_generate")
async def generate_image(id: str, db: AsyncSession = Database):
    """为题目生成图片"""
    await question.generate_question_image(db, id)


@question_router.post("/{id}/audio_generate")
async def generate_audio(id: str, db: AsyncSession = Database):
    """为题目生成语音"""
    await question.generate_question_audio(db, id)
