from fastapi import APIRouter, Depends, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from admin.services.auth import check_super_permission
from admin.services.knowledge import query_knowledge_by_textbook
from admin.services.question import query_question_by_textbook
from admin.services.unit import query_unit_by_textbook
from core.database import Database
from admin.schema import SaveTextbookSchema, SearchTextbookSchema
from admin.services import textbook

textbook_router = APIRouter(prefix="/textbook")


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


@textbook_router.put("/{id}")
async def modify_textbook(id: str, params: SaveTextbookSchema, db: AsyncSession = Database):
    """修改教材信息"""
    await textbook.modify_textbook(db, id, params)


@textbook_router.delete("/{id}", dependencies=[Depends(check_super_permission)])
async def delete_textbook(id: int, db: AsyncSession = Database):
    """删除教材"""
    await textbook.delete_textbook(db, id)


@textbook_router.get("/search")
async def search(params: SearchTextbookSchema = Depends(), db: AsyncSession = Database):
    """搜索教材"""
    return await textbook.search_textbook(db, params)


@textbook_router.get("/{id}/units")
async def query_unit(id: int, db: AsyncSession = Database):
    """根据教材ID查询课程单元"""
    return await query_unit_by_textbook(db, id)


@textbook_router.get("/{id}/knowledges")
async def query_knowledge(id: int, db: AsyncSession = Database):
    """根据教材ID查询知识点"""
    return await query_knowledge_by_textbook(db, id)


@textbook_router.get("/{id}/questions")
async def query_question(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    """根据教材ID查询题目"""
    return await query_question_by_textbook(db, id, page, size)


@textbook_router.get("/{id}")
async def get_textbook(id: int, db: AsyncSession = Database):
    """获取教材详情"""
    return await textbook.get_textbook(db, id)
