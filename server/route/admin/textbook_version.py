from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.admin import TextbookVersionService
from schema.common import ResponseModel, SimpleNameParams, SimpleStatusParams


router = APIRouter(prefix="/textbook_version")


@router.get("/all")
async def search(db: AsyncSession = GetDB):
    res = await TextbookVersionService.all(db)
    return ResponseModel(data=res)


@router.post("/")
async def create(params: SimpleNameParams, db: AsyncSession = GetDB):
    id = await TextbookVersionService.create(db, params.name.strip())
    return ResponseModel(data=id)


@router.patch("/{id}")
async def update(id: str, params: SimpleNameParams, db: AsyncSession = GetDB):
    await TextbookVersionService.update(db, id, params.name.strip())
    return ResponseModel()


@router.delete("/{id}")
async def delete(id: str, db: AsyncSession = GetDB):
    await TextbookVersionService.delete(db, id)
    return ResponseModel()


@router.put("/{id}/status")
async def update_status(id: str, params: SimpleStatusParams, db: AsyncSession = GetDB):
    await TextbookVersionService.update_status(db, id, params.status)
    return ResponseModel()
