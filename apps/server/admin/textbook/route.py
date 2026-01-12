from fastapi import APIRouter, Depends, UploadFile
from shared.core.database import Database
from shared.core.schema import SearchSchema
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    CreateKnowledgeSchema,
    CreateUnitSchema,
    SaveTextbookSchema,
    SearchTextbookSchema,
    UpdateKnowledgeSchema,
    UpdateUnitSchema,
)
from .services import knowledge, textbook, unit

textbook_router = APIRouter(prefix="/textbook")

# ======================== 知识点管理 ======================== #


@textbook_router.post(
    "/knowledge",
    tags=["知识点管理"],
    summary="创建知识点",
    description="在系统中创建新的知识点",
)
async def create_knowledge(params: CreateKnowledgeSchema, db: AsyncSession = Database):
    return await knowledge.create_knowledge(db, params)


@textbook_router.patch(
    "/knowledge/{id}",
    tags=["知识点管理"],
    summary="更新知识点",
    description="更新指定知识点的信息",
)
async def update_knowledge(id: int, params: UpdateKnowledgeSchema, db: AsyncSession = Database):
    await knowledge.update_knowledge(db, id, params)


@textbook_router.delete(
    "/knowledge/{id}",
    tags=["知识点管理"],
    summary="删除知识点",
    description="删除指定的知识点",
)
async def delete_knowledge(id: int, db: AsyncSession = Database):
    await knowledge.delete_knowledge(db, id)


# ======================== 课程单元管理 ======================== #
@textbook_router.post(
    "/unit",
    tags=["课程单元管理"],
    summary="创建课程单元",
    description="为教材创建新的教学单元",
)
async def create_unit(params: CreateUnitSchema, db: AsyncSession = Database):
    return await unit.create_unit(db, params)


@textbook_router.patch(
    "/unit/{id}",
    tags=["课程单元管理"],
    summary="更新课程单元",
    description="更新指定课程单元的信息",
)
async def update_unit(id: int, unit_update: UpdateUnitSchema, db: AsyncSession = Database):
    await unit.update_unit(db, id, unit_update)


@textbook_router.delete(
    "/unit/{id}",
    tags=["课程单元管理"],
    summary="删除课程单元",
    description="删除指定的课程单元",
)
async def delete_unit(id: int, db: AsyncSession = Database):
    await unit.delete_unit(db=db, id=id)


@textbook_router.get(
    "/unit/{id}/knowledges",
    tags=["课程单元管理"],
    summary="查询课程单元下的知识点",
    description="获取指定课程单元关联的所有知识点",
)
async def query_knowledges(id: int, db: AsyncSession = Database):
    return await knowledge.query_knowledge_by_unit(db, id)


# ======================== 教材管理 ======================== #


@textbook_router.post(
    "",
    tags=["教材管理"],
    summary="创建教材",
    description="创建一本新的教材基本信息",
)
async def create_textbook(params: SaveTextbookSchema, db: AsyncSession = Database):
    return await textbook.create_textbook(db, params)


@textbook_router.post(
    "/{id}/upload",
    tags=["教材管理"],
    summary="上传教材文件",
    description="上传教材对应的资源文件",
)
async def upload_textbook(id: int, file: UploadFile, db: AsyncSession = Database):
    await textbook.upload_textbook(db, id, file)


@textbook_router.post(
    "/{id}/parse",
    tags=["教材管理"],
    summary="解析教材文件",
    description="对已上传的教材文件进行内容解析",
)
async def parse_textbook(id: int, db: AsyncSession = Database):
    return await textbook.parse_textbook(db, id)


@textbook_router.patch(
    "/{id}",
    tags=["教材管理"],
    summary="修改教材信息",
    description="更新教材的元数据信息",
)
async def modify_textbook(id: int, params: SaveTextbookSchema, db: AsyncSession = Database):
    await textbook.modify_textbook(db, id, params)


@textbook_router.delete(
    "/{id}",
    tags=["教材管理"],
    summary="删除教材",
    description="删除指定的教材及其关联数据",
)
async def delete_textbook(id: int, db: AsyncSession = Database):
    await textbook.delete_textbook(db, id)


@textbook_router.get(
    "/search",
    tags=["教材管理"],
    summary="搜索教材",
    description="根据条件查询教材列表（无分页）",
)
async def search(params: SearchTextbookSchema = Depends(), db: AsyncSession = Database):
    return await textbook.search_textbook(db, params)


@textbook_router.get(
    "/{id}",
    tags=["教材管理"],
    summary="获取教材详情",
    description="获取指定教材的详细信息",
)
async def get_textbook(id: int, db: AsyncSession = Database):
    return await textbook.get_textbook(db, id)


@textbook_router.get(
    "/{id}/units",
    tags=["教材管理"],
    summary="根据教材ID查询课程单元",
    description="获取指定教材包含的所有教学单元",
)
async def query_units(id: int, db: AsyncSession = Database):
    return await unit.query_units_by_textbook(db, id)


@textbook_router.get(
    "/{id}/knowledges",
    tags=["教材管理"],
    summary="根据教材ID查询知识点",
    description="获取指定教材包含的所有知识点",
)
async def query_knowledge(id: int, params: SearchSchema = Depends(), db: AsyncSession = Database):
    return await knowledge.query_knowledges_by_textbook(db, id, params)


@textbook_router.get(
    "/available-options",
    tags=["教材管理"],
    summary="获取可用教材选项",
    description="获取系统中所有可用的年级、学科、学期选项（从教材表聚合）",
)
async def get_available_options(db: AsyncSession = Database):
    return await textbook.get_available_textbook_options(db)
