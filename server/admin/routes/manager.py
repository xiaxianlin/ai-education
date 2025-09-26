from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import Database
from service.admin import ManagerService
from schema import ResponseSchema, StatusSchema, ManagerSaveSchema, ManagerSearchSchema


router = APIRouter(prefix="/manager")


@router.get("/search")
async def search(params: ManagerSearchSchema = Depends(), db: AsyncSession = Database):
    res = await ManagerService.search(db, params)
    return ResponseSchema(data=res)


@router.post("/")
async def create(params: ManagerSaveSchema, db: AsyncSession = Database):
    id = await ManagerService.create(db, params)
    return ResponseSchema(data=id)


@router.patch("/{id}")
async def update(id: str, params: ManagerSaveSchema, db: AsyncSession = Database):
    await ManagerService.update(db, id, params)
    return ResponseSchema()


@router.put("/{id}/status")
async def update_status(id: str, params: StatusSchema, db: AsyncSession = Database):
    await ManagerService.update_status(db, id, params.status)
    return ResponseSchema()


@router.delete("/{id}")
async def remove(id: str, db: AsyncSession = Database):
    await ManagerService.delete(db, id)
    return ResponseSchema()


@router.post("/modify_password")
async def modify_password(
    params: ModifyPasswordSchema,
    manager: dict = auth.CurrentManager,
    db: AsyncSession = Database,
):
    await modify_password(db, manager["id"], params)
    return ResponseSchema()
