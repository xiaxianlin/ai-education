from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateManangeSchema, UpdateManangeSchema
from admin.services import manager
from common.database import Database
from common.schema import ResponseSchema


manager_router = APIRouter(prefix="/manager")


@manager_router.get("/all")
async def find_all(db: AsyncSession = Database):
    res = await manager.find_all(db)
    return ResponseSchema(data=res)


@manager_router.post("/")
async def create_manager(params: CreateManangeSchema, db: AsyncSession = Database):
    password = await manager.create_manager(db, params)
    return ResponseSchema(data=password)


@manager_router.post("/{id}/reset")
async def reset_manager_password(id: str, db: AsyncSession = Database):
    await manager.reset_manager_password(db, id)
    return ResponseSchema()


@manager_router.patch("/{id}/{type}")
async def update_manager_type(id: str, type: int, db: AsyncSession = Database):
    await manager.update_manager(db, id, UpdateManangeSchema(type=type))
    return ResponseSchema()


@manager_router.patch("/{id}/{status}")
async def update_manager_status(id: str, status: int, db: AsyncSession = Database):
    await manager.update_manager(db, id, UpdateManangeSchema(status=status))
    return ResponseSchema()


@manager_router.delete("/{id}")
async def remove(id: str, db: AsyncSession = Database):
    await manager.delete_manager(db, id)
    return ResponseSchema()
