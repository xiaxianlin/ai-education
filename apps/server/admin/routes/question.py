from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Database
from admin.services import question, question_type
from admin.schema import (
    CreateQuestionSchema,
    SearchQuestionSchema,
    UpdateQuestionSchema,
    CreateQuestionTypeSchema,
    UpdateQuestionTypeSchema,
    SearchQuestionTypeSchema,
)


question_router = APIRouter(prefix="/question")

# ======================== 题型管理 ======================== #


@question_router.post("/type")
async def create_question_type(params: CreateQuestionTypeSchema, db: AsyncSession = Database):
    """创建题型"""
    return await question_type.create_question_type(db, params)


@question_router.patch("/type/{id}")
async def update_question_type(id: int, params: UpdateQuestionTypeSchema, db: AsyncSession = Database):
    """更新题型"""
    return await question_type.update_question_type(db, id, params)


@question_router.delete("/type/{id}")
async def delete_question_type(id: int, db: AsyncSession = Database):
    """删除题型"""
    await question_type.delete_question_type(db, id)


@question_router.get("/type/search")
async def search_question_types(params: SearchQuestionTypeSchema = Depends(), db: AsyncSession = Database):
    """搜索题型"""
    return await question_type.search_question_types(db, params)


@question_router.get("/type/{id}")
async def get_question_type(id: int, db: AsyncSession = Database):
    """获取题型详情"""
    return await question_type.get_question_type(db, id)


# ======================== 题型管理 ======================== #


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


@question_router.post("/{id}/image_generate")
async def generate_image(id: str, db: AsyncSession = Database):
    """为题目生成图片"""
    await question.generate_question_image(db, id)


@question_router.post("/{id}/audio_generate")
async def generate_audio(id: str, db: AsyncSession = Database):
    """为题目生成语音"""
    await question.generate_question_audio(db, id)


@question_router.get("/search")
async def search_question(params: SearchQuestionSchema = Depends(), db: AsyncSession = Database):
    """搜索题目"""
    return await question.search_question(db, params)


@question_router.get("/{id}")
async def get_question(id: str, db: AsyncSession = Database):
    """获取单个题目详情"""
    return await question.get_question(db, id)
