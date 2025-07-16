from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.admin import TextbookVersionService
from schema import ResponseSchema, NameSchema, StatusSchema


router = APIRouter(prefix="/textbook_version")


@router.get("/all")
async def search(db: AsyncSession = GetDB):
    res = await TextbookVersionService.all(db)
    return ResponseSchema(data=res)


@router.post("/")
async def create(params: NameSchema, db: AsyncSession = GetDB):
    id = await TextbookVersionService.create(db, params.name.strip())
    return ResponseSchema(data=id)


@router.patch("/{id}")
async def update(id: str, params: NameSchema, db: AsyncSession = GetDB):
    await TextbookVersionService.update(db, id, params.name.strip())
    return ResponseSchema()


@router.delete("/{id}")
async def delete(id: str, db: AsyncSession = GetDB):
    await TextbookVersionService.delete(db, id)
    return ResponseSchema()


@router.put("/{id}/status")
async def update_status(id: str, params: StatusSchema, db: AsyncSession = GetDB):
    await TextbookVersionService.update_status(db, id, params.status)
    return ResponseSchema()
