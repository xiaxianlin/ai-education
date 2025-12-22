from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Database
from admin.services import textbook, knowledge, unit
from admin.schema import (
    SaveTextbookSchema,
    SearchTextbookSchema,
    CreateKnowledgeSchema,
    UpdateKnowledgeSchema,
    SearchSchema,
    CreateUnitSchema,
    UpdateUnitSchema,
)


textbook_router = APIRouter(prefix="/textbook")

# ======================== 知识点管理 ======================== #


@textbook_router.post("/")
async def create_knowledge(params: CreateKnowledgeSchema, db: AsyncSession = Database):
    """创建知识点"""
    return await knowledge.create_knowledge(db, params)


@textbook_router.patch("/{id}")
async def update_knowledge(id: int, params: UpdateKnowledgeSchema, db: AsyncSession = Database):
    """更新知识点"""
    await knowledge.update_knowledge(db, id, params)


@textbook_router.delete("/{id}")
async def delete_knowledge(id: int, db: AsyncSession = Database):
    """删除知识点"""
    await knowledge.delete_knowledge(db, id)


@textbook_router.get("/search")
async def search_knowledge(params: SearchSchema = Depends(), db: AsyncSession = Database):
    """搜索知识点"""
    return await knowledge.search_knowledge(db, params)


# ======================== 课程单元管理 ======================== #
@textbook_router.post("/")
async def create_unit(params: CreateUnitSchema, db: AsyncSession = Database):
    """创建课程单元"""
    return await unit.create_unit(db, params)


@textbook_router.patch("/{id}")
async def update_unit(id: int, unit_update: UpdateUnitSchema, db: AsyncSession = Database):
    """更新课程单元"""
    await unit.update_unit(db, id, unit_update)


@textbook_router.delete("/{id}")
async def delete_unit(id: int, db: AsyncSession = Database):
    """删除课程单元"""
    await unit.delete_unit(db=db, id=id)


@textbook_router.get("/{id}/knowledges")
async def query_knowledges(id: int, db: AsyncSession = Database):
    """查询课程单元下的知识点"""
    return await knowledge.query_knowledge_by_unit(db, id)


# ======================== 教材管理 ======================== #


@textbook_router.post("/")
async def create_textbook(params: SaveTextbookSchema, db: AsyncSession = Database):
    """创建教材"""
    return await textbook.create_textbook(db, params)


@textbook_router.post("/{id}/upload")
async def upload_textbook(id: int, file: UploadFile, db: AsyncSession = Database):
    """上传教材文件"""
    await textbook.upload_textbook(db, id, file)


@textbook_router.post("/{id}/parse")
async def parse_textbook(id: int, db: AsyncSession = Database):
    """解析教材文件"""
    return await textbook.parse_textbook(db, id)


@textbook_router.patch("/{id}")
async def modify_textbook(id: int, params: SaveTextbookSchema, db: AsyncSession = Database):
    """修改教材信息"""
    await textbook.modify_textbook(db, id, params)


@textbook_router.delete("/{id}")
async def delete_textbook(id: int, db: AsyncSession = Database):
    """删除教材"""
    await textbook.delete_textbook(db, id)


@textbook_router.get("/search")
async def search(params: SearchTextbookSchema = Depends(), db: AsyncSession = Database):
    """搜索教材（无分页）"""
    return await textbook.search_textbook(db, params)


@textbook_router.get("/{id}/units")
async def query_unit(id: int, db: AsyncSession = Database):
    """根据教材ID查询课程单元"""
    return await unit.query_unit_by_textbook(db, id)


@textbook_router.get("/{id}")
async def get_textbook(id: int, db: AsyncSession = Database):
    """获取教材详情"""
    return await textbook.get_textbook(db, id)
