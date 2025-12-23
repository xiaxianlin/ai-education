from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Database
from .schema import SavePracticeSchema, SearchPracticeSchema, SearchPracticePromptSchema, SavePracticePromptSchema
from .services import practice, practice_prompt

practice_router = APIRouter(prefix="/practice", tags=["练习管理"])


# ======================== 练习参数配置 ======================== #


@practice_router.get("/parameters/{id}", summary="获取练习参数列表", description="根据练习 ID 获取其关联的参数配置列表")
async def get_practice_parameters(id: int, db: AsyncSession = Database):
    return await practice.get_practice_parameters(db, id)


@practice_router.post("/parameters/{id}/", summary="保存练习参数", description="保存指定练习的参数配置信息")
async def save_practice_parameters(id: int, parameters: list[dict], db: AsyncSession = Database):
    return await practice.save_practice_parameters(db, id, parameters)


# ======================== 练习提示词管理 ======================== #


@practice_router.get("/prompt/list", tags=["练习提示词"], summary="列表查询练习提示词关联", description="分页查询练习与 Prompt 的关联关系列表")
async def list_practice_prompts(params: SearchPracticePromptSchema = Depends(), db: AsyncSession = Database):
    return await practice_prompt.list_practice_prompts(db, params)


@practice_router.get("/prompt/{id}", tags=["练习提示词"], summary="获取练习提示词关联详情", description="根据 ID 获取练习与 Prompt 关联的详细信息")
async def get_practice_prompt(id: int, db: AsyncSession = Database):
    return await practice_prompt.get_practice_prompt(db, id)


@practice_router.post("/prompt", tags=["练习提示词"], summary="创建练习提示词关联", description="创建练习与 Prompt 的关联关系")
async def create_practice_prompt(params: SavePracticePromptSchema, db: AsyncSession = Database):
    return await practice_prompt.create_practice_prompt(db, params)


@practice_router.put("/prompt/{id}", tags=["练习提示词"], summary="更新练习提示词关联", description="更新练习与 Prompt 的关联关系信息")
async def update_practice_prompt(id: int, params: SavePracticePromptSchema, db: AsyncSession = Database):
    return await practice_prompt.update_practice_prompt(db, id, params)


@practice_router.delete("/prompt/{id}", tags=["练习提示词"], summary="删除练习提示词关联", description="删除练习与 Prompt 的关联关系")
async def delete_practice_prompt(id: int, db: AsyncSession = Database):
    return await practice_prompt.delete_practice_prompt(db, id)


# ======================== 练习管理 ======================== #


@practice_router.get("/list", summary="列表查询练习", description="分页查询系统中的练习列表")
async def list_practices(params: SearchPracticeSchema = Depends(), db: AsyncSession = Database):
    return await practice.list_practices(db, params)


@practice_router.get("/{id}", summary="获取练习详情", description="根据 ID 获取练习的详细信息")
async def get_practice(id: int, db: AsyncSession = Database):
    return await practice.get_practice(db, id)


@practice_router.post("", summary="创建练习", description="创建一个新的练习")
async def create_practice(params: SavePracticeSchema, db: AsyncSession = Database):
    return await practice.create_practice(db, params)


@practice_router.put("/{id}", summary="更新练习", description="更新指定练习的信息")
async def update_practice(id: int, params: SavePracticeSchema, db: AsyncSession = Database):
    return await practice.update_practice(db, id, params)


@practice_router.delete("/{id}", summary="删除练习", description="删除指定的练习")
async def delete_practice(id: int, db: AsyncSession = Database):
    return await practice.delete_practice(db, id)
