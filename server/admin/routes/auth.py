from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import LoginSchema, ModifyPasswordSchema
from common.database import Database
from common.schema import ResponseSchema
from admin.services import auth, manager

auth_router = APIRouter()


@auth_router.get("/check")
async def check(manager=auth.CurrentManager, db: AsyncSession = Database):
    return ResponseSchema(data=manager)


@auth_router.post("/login")
async def login(params: LoginSchema, db: AsyncSession = Database):
    data = await auth.login(db, params)
    return ResponseSchema(data=data)


@auth_router.post("/modify_password")
async def update_manager_password(
    params: ModifyPasswordSchema,
    curr: dict = auth.CurrentManager,
    db: AsyncSession = Database,
):
    await manager.update_manager_password(db, curr["id"], params)
    return ResponseSchema()
