from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.admin import TextbookService
from schema.common import ResponseModel
from schema.admin import TextbookSave, TextbookSearchParams

router = APIRouter(prefix="/textbook")


@router.get("/search")
async def search(params: TextbookSearchParams = Depends(), db: AsyncSession = GetDB):
    res = await TextbookService.search(db, params)
    return ResponseModel(data=res)


@router.post("/upload/{id}")
async def upload(id: int, file: UploadFile, db: AsyncSession = GetDB):
    await TextbookService.upload_pdf(db, id, file)
    return ResponseModel()


@router.post("/")
async def create(params: TextbookSave, db: AsyncSession = GetDB):
    id = await TextbookService.create(db, params)
    return ResponseModel(data=id)


@router.patch("/{id}")
async def update(id: str, params: TextbookSave, db: AsyncSession = GetDB):
    await TextbookService.update(db, id, params)
    return ResponseModel()


@router.delete("/{id}")
async def delete(id: str, db: AsyncSession = GetDB):
    await TextbookService.delete(db, id)
    return ResponseModel()
