from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.admin import ManagerService
from schema.common import ResponseModel
from schema.admin import CraeteManager, ModifyManagerStatus, ManagerSearchParams


router = APIRouter(prefix="/manager")


@router.post("/")
async def create(params: CraeteManager, db: AsyncSession = GetDB):
    id = await ManagerService.create(db, params)
    return ResponseModel(data=id)


@router.patch("/{id}")
async def update(id: str, params: CraeteManager, db: AsyncSession = GetDB):
    await ManagerService.update(db, id, params)
    return ResponseModel()


@router.put("/{id}/status")
async def update_status(id: str, params: ModifyManagerStatus, db: AsyncSession = GetDB):
    await ManagerService.update_status(db, id, params.status)
    return ResponseModel()


@router.delete("/{id}")
async def remove(id: str, db: AsyncSession = GetDB):
    await ManagerService.delete(db, id)
    return ResponseModel()


@router.get("/search")
async def search(params: ManagerSearchParams = Depends(), db: AsyncSession = GetDB):
    res = await ManagerService.search(db, params)
    return ResponseModel(data=res)
