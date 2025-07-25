from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from service.admin.course_unit import CourseUnitService
from service.admin.knowledge import KnowledgeService
from service.admin.question import QuestionService
from store.database import GetDB
from service.admin import TextbookService
from service.admin.course_unit_extraction import UnitExtractionService
from schema import ResponseSchema, TextbookSaveSchema, TextbookSearchSchema

router = APIRouter(prefix="/textbook")


@router.post("/upload/{id}")
async def upload(id: int, file: UploadFile, db: AsyncSession = GetDB):
    """上传教材文档"""
    await TextbookService.upload_pdf(db, id, file)
    return ResponseSchema()


@router.post("/{id}/extract")
async def extract_units(id: int, db: AsyncSession = GetDB):
    """启动PDF单元提取任务"""
    task_id = await UnitExtractionService.start_extraction(db, id)
    return ResponseSchema(data={"task_id": task_id})


@router.post("/")
async def create(params: TextbookSaveSchema, db: AsyncSession = GetDB):
    """创建教材"""
    id = await TextbookService.create(db, params)
    return ResponseSchema(data=id)


@router.patch("/{id}")
async def update(id: str, params: TextbookSaveSchema, db: AsyncSession = GetDB):
    """更新教材信息"""
    await TextbookService.update(db, id, params)
    return ResponseSchema()


@router.delete("/{id}")
async def delete(id: str, db: AsyncSession = GetDB):
    """删除教材"""
    await TextbookService.delete(db, id)
    return ResponseSchema()


@router.get("/search")
async def search(params: TextbookSearchSchema = Depends(), db: AsyncSession = GetDB):
    """搜索教材"""
    res = await TextbookService.search(db, params)
    return ResponseSchema(data=res)


@router.get("/{id}/task")
async def get_processing_status(id: int, db: AsyncSession = GetDB):
    """获取PDF处理状态"""
    task = await UnitExtractionService.get_task(db, id)
    return ResponseSchema(data=task)


@router.get("/{id}/course_units")
async def get_course_units(id: int, db: AsyncSession = GetDB):
    """获取PDF处理状态"""
    data = await CourseUnitService.get_by_textbook(db, id)
    return ResponseSchema(data=data)


@router.get("/{id}/knowledges")
async def get_knowledges(id: int, db: AsyncSession = GetDB):
    """获取PDF处理状态"""
    data = await KnowledgeService.get_by_textbook(db, id)
    return ResponseSchema(data=data)


@router.get("/{id}/questions")
async def get_questions(
    id: int,
    current_page: int = 1,
    page_size: int = 10,
    db: AsyncSession = GetDB,
):
    """获取PDF处理状态"""
    data = await QuestionService.get_by_textbook(db, id, current_page, page_size)
    return ResponseSchema(data=data)


@router.get("/{id}")
async def get_course_unit(id: int, db: AsyncSession = GetDB):
    """获取单个课程单元"""
    textbook = await TextbookService.get_by_id(db, id)
    return ResponseSchema(data=textbook)
