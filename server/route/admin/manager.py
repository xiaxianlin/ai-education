from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.admin import ManagerService
from schema import ResponseSchema, StatusSchema, ManagerSaveSchema, ManagerSearchSchema


router = APIRouter(prefix="/manager")


@router.post("/")
async def create(params: ManagerSaveSchema, db: AsyncSession = GetDB):
    id = await ManagerService.create(db, params)
    return ResponseSchema(data=id)


@router.patch("/{id}")
async def update(id: str, params: ManagerSaveSchema, db: AsyncSession = GetDB):
    await ManagerService.update(db, id, params)
    return ResponseSchema()


@router.put("/{id}/status")
async def update_status(id: str, params: StatusSchema, db: AsyncSession = GetDB):
    await ManagerService.update_status(db, id, params.status)
    return ResponseSchema()


@router.delete("/{id}")
async def remove(id: str, db: AsyncSession = GetDB):
    await ManagerService.delete(db, id)
    return ResponseSchema()


@router.get("/search")
async def search(params: ManagerSearchSchema = Depends(), db: AsyncSession = GetDB):
    res = await ManagerService.search(db, params)
    return ResponseSchema(data=res)
