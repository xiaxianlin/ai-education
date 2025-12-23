from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Database
from .schema import SavePromptSchema, SearchPromptSchema, SearchPromptVersionSchema, PublishPromptSchema, TestPromptSchema
from .services import prompt, prompt_test

prompt_router = APIRouter(prefix="/prompt", tags=["Prompt 管理"])


@prompt_router.get("/list", summary="列表查询 Prompt", description="分页查询系统中的 Prompt 列表")
async def list_prompts(params: SearchPromptSchema = Depends(), db: AsyncSession = Database):
    return await prompt.list_prompts(db, params)


@prompt_router.get("/versions", summary="列表查询 Prompt 版本", description="查询指定 Prompt 的历史版本列表")
async def list_versions(params: SearchPromptVersionSchema = Depends(), db: AsyncSession = Database):
    return await prompt.list_versions(db, params)


@prompt_router.get("/{version_id}", summary="获取 Prompt 详情", description="获取指定 Prompt 版本的详细内容")
async def get_prompt(version_id: int, db: AsyncSession = Database):
    return await prompt.get_prompt(db, version_id)


@prompt_router.put("/{version_id}", summary="更新 Prompt", description="更新指定 Prompt 版本的内容")
async def update_prompt(version_id: int, params: SavePromptSchema, db: AsyncSession = Database):
    return await prompt.update_prompt(db, version_id, params)


@prompt_router.post("", summary="创建 Prompt", description="创建一个新的 Prompt 及其初始版本")
async def create_prompt(params: SavePromptSchema, db: AsyncSession = Database):
    return await prompt.create_prompt(db, params)


@prompt_router.delete("/{id}", summary="删除 Prompt", description="删除指定的 Prompt 及其所有版本")
async def delete_prompt(id: int, db: AsyncSession = Database):
    return await prompt.delete_prompt(db, id)


@prompt_router.post("/{version_id}/publish", summary="发布 Prompt 版本", description="将指定的 Prompt 版本发布为生产环境可用")
async def publish_prompt(version_id: int, params: PublishPromptSchema, db: AsyncSession = Database):
    return await prompt.publish_prompt(db, version_id, params.changelog)


@prompt_router.post("/{version_id}/test", summary="测试 Prompt 版本", description="对指定的 Prompt 版本进行效果测试")
async def test_prompt(version_id: int, params: TestPromptSchema, db: AsyncSession = Database):
    return await prompt_test.test_prompt(db, version_id, params)
