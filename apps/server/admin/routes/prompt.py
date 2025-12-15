from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import (
    CreatePromptSchema,
    UpdatePromptSchema,
    CreatePromptVersionSchema,
    TestPromptSchema,
)
from admin.services import prompt as prompt_service
from shared.core.database import Database

prompt_router = APIRouter(prefix="/prompt", tags=["Prompt 管理"])


@prompt_router.get("/")
async def list_prompts(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    tag: Optional[str] = None,
    db: AsyncSession = Database,
):
    return await prompt_service.list_prompts(db, keyword, category, status, tag)


@prompt_router.post("/")
async def create_prompt(
    params: CreatePromptSchema, db: AsyncSession = Database
):
    return await prompt_service.create_prompt(db, params)


@prompt_router.get("/{pid}")
async def get_prompt(pid: int, db: AsyncSession = Database):
    return await prompt_service.get_prompt(db, pid)


@prompt_router.patch("/{pid}")
async def update_prompt(pid: int, params: UpdatePromptSchema, db: AsyncSession = Database):
    return await prompt_service.update_prompt(db, pid, params)


@prompt_router.post("/{pid}/versions")
async def create_prompt_version(
    pid: int, params: CreatePromptVersionSchema, db: AsyncSession = Database
):
    return await prompt_service.create_version(db, pid, params)


@prompt_router.get("/{pid}/versions")
async def list_prompt_versions(pid: int, db: AsyncSession = Database):
    return await prompt_service.list_versions(db, pid)


@prompt_router.post("/{pid}/versions/{vid}/publish")
async def publish_prompt_version(pid: int, vid: int, db: AsyncSession = Database):
    return await prompt_service.publish_version(db, pid, vid)


@prompt_router.post("/{pid}/versions/{vid}/archive")
async def archive_prompt_version(pid: int, vid: int, db: AsyncSession = Database):
    return await prompt_service.archive_version(db, pid, vid)


@prompt_router.post("/{pid}/versions/{vid}/test")
async def test_prompt_version(
    pid: int, vid: int, params: TestPromptSchema, db: AsyncSession = Database
):
    return await prompt_service.test_version(db, pid, vid, params)


@prompt_router.get("/{pid}/metrics")
async def prompt_metrics(
    pid: int, version_id: Optional[int] = None, db: AsyncSession = Database
):
    return await prompt_service.metrics(db, pid, version_id)

