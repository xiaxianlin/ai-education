from __future__ import annotations

from fastapi import APIRouter, Depends
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    BatchDeleteQuestionTypeSchema,
    CreateQuestionSchema,
    CreateQuestionTypeSchema,
    SearchQuestionSchema,
    SearchQuestionTypeSchema,
    UpdateQuestionSchema,
    UpdateQuestionTypeSchema,
)
from .services import question, question_type

question_router = APIRouter(prefix="/question")

# ======================== 题型管理 ======================== #


@question_router.post(
    "/type",
    tags=["题型管理"],
    summary="创建题型",
    description="创建一种新的题目类型",
)
async def create_question_type(params: CreateQuestionTypeSchema, db: AsyncSession = Database):
    return await question_type.create_question_type(db, params)


@question_router.patch(
    "/type/{id}",
    tags=["题型管理"],
    summary="更新题型",
    description="更新指定题型的信息",
)
async def update_question_type(id: int, params: UpdateQuestionTypeSchema, db: AsyncSession = Database):
    return await question_type.update_question_type(db, id, params)


@question_router.delete(
    "/type/{id}",
    tags=["题型管理"],
    summary="删除题型",
    description="删除指定的题型",
)
async def delete_question_type(id: int, db: AsyncSession = Database):
    await question_type.delete_question_type(db, id)


@question_router.delete(
    "/type/batch",
    tags=["题型管理"],
    summary="批量删除题型",
    description="批量删除指定的题型",
)
async def batch_delete_question_types(params: BatchDeleteQuestionTypeSchema, db: AsyncSession = Database):
    await question_type.batch_delete_question_types(db, params.ids)


@question_router.get(
    "/type/search",
    tags=["题型管理"],
    summary="搜索题型",
    description="根据条件搜索题型列表",
)
async def search_question_types(params: SearchQuestionTypeSchema = Depends(), db: AsyncSession = Database):
    return await question_type.search_question_types(db, params)


@question_router.get(
    "/type/{id}",
    tags=["题型管理"],
    summary="获取题型详情",
    description="获取指定题型的详细信息",
)
async def get_question_type(id: int, db: AsyncSession = Database):
    return await question_type.get_question_type(db, id)


# ======================== 题目管理 ======================== #


@question_router.post(
    "/",
    tags=["题目管理"],
    summary="创建题目",
    description="手动创建一道新题目",
)
async def create_question(data: CreateQuestionSchema, db: AsyncSession = Database):
    return await question.create_question(db, data)


@question_router.patch(
    "/{id}",
    tags=["题目管理"],
    summary="更新题目",
    description="更新指定题目的信息",
)
async def update_question(id: str, update: UpdateQuestionSchema, db: AsyncSession = Database):
    await question.update_question(db, id, update)


@question_router.delete(
    "/{id}",
    tags=["题目管理"],
    summary="删除题目",
    description="删除指定的题目",
)
async def delete_question(id: str, db: AsyncSession = Database):
    await question.delete_question(db, id)


@question_router.post(
    "/{id}/image_generate",
    tags=["题目管理"],
    summary="为题目生成图片",
    description="调用 AI 为指定题目生成配图",
)
async def generate_image(id: str, db: AsyncSession = Database):
    await question.generate_question_image(db, id)


@question_router.post(
    "/{id}/audio_generate",
    tags=["题目管理"],
    summary="为题目生成语音",
    description="调用 AI 为指定题目生成朗读音频",
)
async def generate_audio(id: str, db: AsyncSession = Database):
    await question.generate_question_audio(db, id)


@question_router.get(
    "/search",
    tags=["题目管理"],
    summary="搜索题目",
    description="根据条件搜索题目列表",
)
async def search_question(params: SearchQuestionSchema = Depends(), db: AsyncSession = Database):
    return await question.search_question(db, params)


@question_router.get("/{id}", tags=["题目管理"], summary="获取单个题目详情", description="获取指定题目的详细信息")
async def get_question(id: str, db: AsyncSession = Database):
    return await question.get_question(db, id)
