from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.admin import TextbookService
from schema import ResponseSchema, TextbookSaveSchema, TextbookSearchSchema

router = APIRouter(prefix="/textbook")


@router.get("/search")
async def search(params: TextbookSearchSchema = Depends(), db: AsyncSession = GetDB):
    res = await TextbookService.search(db, params)
    return ResponseSchema(data=res)


@router.post("/upload/{id}")
async def upload(id: int, file: UploadFile, db: AsyncSession = GetDB):
    await TextbookService.upload_pdf(db, id, file)
    return ResponseSchema()


@router.post("/")
async def create(params: TextbookSaveSchema, db: AsyncSession = GetDB):
    id = await TextbookService.create(db, params)
    return ResponseSchema(data=id)


@router.get("/{id}")
async def get_course_unit(id: int, db: AsyncSession = GetDB):
    """获取单个课程单元"""
    textbook = await TextbookService.get_by_id(db, id)
    return ResponseSchema(data=textbook)


@router.patch("/{id}")
async def update(id: str, params: TextbookSaveSchema, db: AsyncSession = GetDB):
    await TextbookService.update(db, id, params)
    return ResponseSchema()


@router.delete("/{id}")
async def delete(id: str, db: AsyncSession = GetDB):
    await TextbookService.delete(db, id)
    return ResponseSchema()
