from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from admin.services.knowledge import query_knowledge_by_textbook
from admin.services.question import query_question_by_textbook
from admin.services.unit import query_unit_by_textbook
from common.database import Database
from common.schema import ResponseSchema
from admin.schema import SaveTextbookSchema, SearchTextbookSchema
from admin.services import textbook

router = APIRouter(prefix="/textbook")


@router.post("/")
async def create_textbook(params: SaveTextbookSchema, db: AsyncSession = Database):
    """创建教材"""
    id = await textbook.create_textbook(db, params)
    return ResponseSchema(data=id)


@router.post("/{id}/upload")
async def upload_textbook(id: int, file: UploadFile, db: AsyncSession = Database):
    """上传教材文档"""
    await textbook.upload_textbook(db, id, file)
    return ResponseSchema()


@router.post("/{id}/parse")
async def parse_textbook(id: int, db: AsyncSession = Database):
    """启动PDF单元提取任务"""
    res = await textbook.parse_textbook(db, id)
    return ResponseSchema(data=res)


@router.patch("/{id}/status/{status}")
async def update_textbook_status(id: int, status: int, db: AsyncSession = Database):
    await textbook.update_textbook_status(db, id, status)
    return ResponseSchema()


@router.put("/{id}")
async def modify_textbook(id: str, params: SaveTextbookSchema, db: AsyncSession = Database):
    """更新教材信息"""
    await textbook.modify_textbook(db, id, params)
    return ResponseSchema()


@router.delete("/{id}")
async def delete_textbook(id: str, db: AsyncSession = Database):
    """删除教材"""
    await textbook.delete_textbook(db, id)
    return ResponseSchema()


@router.get("/search")
async def search(params: SearchTextbookSchema = Depends(), db: AsyncSession = Database):
    """搜索教材"""
    res = await textbook.search_textbook(db, params)
    return ResponseSchema(data=res)


@router.get("/{id}/units")
async def query_unit(id: int, db: AsyncSession = Database):
    data = await query_unit_by_textbook(db, id)
    return ResponseSchema(data=data)


@router.get("/{id}/knowledges")
async def query_knowledge(id: int, db: AsyncSession = Database):
    data = await query_knowledge_by_textbook(db, id)
    return ResponseSchema(data=data)


@router.get("/{id}/questions")
async def query_question(id: int, page: int = 1, size: int = 10, db: AsyncSession = Database):
    data = await query_question_by_textbook(db, id, page, size)
    return ResponseSchema(data=data)


@router.get("/{id}")
async def get_textbook(id: int, db: AsyncSession = Database):
    """获取单个课程单元"""
    data = await textbook.get_textbook(db, id)
    return ResponseSchema(data=data)
