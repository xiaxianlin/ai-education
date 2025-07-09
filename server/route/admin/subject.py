from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.admin import SubjectService
from schema.common import ResponseModel, SimpleNameParams


router = APIRouter(prefix="/subject")


@router.get("/all")
async def search(db: AsyncSession = GetDB):
    res = await SubjectService.all(db)
    return ResponseModel(data=res)


@router.post("/")
async def create(params: SimpleNameParams, db: AsyncSession = GetDB):
    id = await SubjectService.create(db, params.name.strip())
    return ResponseModel(data=id)


@router.patch("/{id}")
async def update(id: str, params: SimpleNameParams, db: AsyncSession = GetDB):
    await SubjectService.update(db, id, params.name.strip())
    return ResponseModel()


@router.delete("/{id}")
async def delete(id: str, db: AsyncSession = GetDB):
    await SubjectService.delete(db, id)
    return ResponseModel()
