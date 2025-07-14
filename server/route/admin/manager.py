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


@router.patch("/status/{id}")
async def modify_status(id: str, params: ModifyManagerStatus, db: AsyncSession = GetDB):
    await ManagerService.modify_status(db, id, params.status)
    return ResponseModel()


@router.delete("/{id}")
async def remove(id: str, db: AsyncSession = GetDB):
    await ManagerService.delete(db, id)
    return ResponseModel()


@router.get("/search")
async def search(params: ManagerSearchParams = Depends(), db: AsyncSession = GetDB):
    res = await ManagerService.search(db, params)
    return ResponseModel(data=res)
