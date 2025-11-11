from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import LoginSchema, ModifyPasswordSchema
from admin.services.auth import admin_login
from admin.services.manager import update_manager_password
from core.database import Database
from core.schema import ManagerSchema

auth_router = APIRouter()


@auth_router.get("/check")
async def check(request: Request):
    return request.state.manager


@auth_router.post("/login")
async def login(params: LoginSchema, db: AsyncSession = Database):
    return await admin_login(db, params)


@auth_router.post("/modify_password")
async def modify_password(params: ModifyPasswordSchema, request: Request, db=Database):
    manager: ManagerSchema = request.state.manager
    await update_manager_password(db, manager.id, params)
