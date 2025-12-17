from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import SavePromptSchema, SearchPromptTestRecordSchema
from shared.core.database import Database
from admin.services import prompt
from admin.schema import SearchPromptSchema, SearchPromptVersionSchema, PublishPromptSchema, TestPromptSchema

prompt_router = APIRouter(prefix="/prompt", tags=["Prompt 管理"])


@prompt_router.get("/list")
async def list_prompts(params: SearchPromptSchema = Depends(), db: AsyncSession = Database):
    """列表查询 Prompt"""
    return await prompt.list_prompts(db, params)


@prompt_router.get("/versions")
async def list_versions(params: SearchPromptVersionSchema = Depends(), db: AsyncSession = Database):
    """列表查询 Prompt 版本"""
    return await prompt.list_versions(db, params)


@prompt_router.get("/{version_id}")
async def get_prompt(version_id: int, db: AsyncSession = Database):
    """获取 Prompt 详情"""
    return await prompt.get_prompt(db, version_id)


@prompt_router.put("/{version_id}")
async def update_prompt(version_id: int, params: SavePromptSchema, db: AsyncSession = Database):
    """根据 id 和 version_id 更新 Prompt"""
    return await prompt.update_prompt(db, version_id, params)


@prompt_router.post("")
async def create_prompt(params: SavePromptSchema, db: AsyncSession = Database):
    """创建 Prompt"""
    return await prompt.create_prompt(db, params)


@prompt_router.delete("/{id}")
async def delete_prompt(id: int, db: AsyncSession = Database):
    """删除 Prompt"""
    return await prompt.delete_prompt(db, id)


@prompt_router.post("/{version_id}/publish")
async def publish_prompt(version_id: int, params: PublishPromptSchema, db: AsyncSession = Database):
    """发布 Prompt 版本"""
    return await prompt.publish_prompt(db, version_id, params.changelog)


@prompt_router.post("/{version_id}/test")
async def test_prompt(version_id: int, params: TestPromptSchema, db: AsyncSession = Database):
    """测试 Prompt 版本"""
    return await prompt.test_prompt(db, version_id, params)


@prompt_router.get("/test/records")
async def list_test_records(params: SearchPromptTestRecordSchema = Depends(), db: AsyncSession = Database):
    """列表查询 Prompt 测试记录"""
    return await prompt.list_test_records(db, params)


@prompt_router.delete("/test/records/{record_id}")
async def delete_test_record(record_id: int, db: AsyncSession = Database):
    """删除 Prompt 测试记录"""
    return await prompt.delete_test_record(db, record_id)
