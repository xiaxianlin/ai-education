from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from common.database.model import GetDB
from common.schemas import ResponseSchema
from admin.schemas.manager import ModifyPasswordSchema, LoginSechema
from admin.services import auth

auth_router = APIRouter()


@auth_router.post("/login")
async def login(params: LoginSechema, db: AsyncSession = GetDB):
    data = await auth.login(db, params)
    return ResponseSchema(data=data)


@auth_router.get("/check")
async def check(manager: dict = Depends(), db: AsyncSession = GetDB):
    data = await auth.valid_login(db, manager["id"])

    if not data:
        return ResponseSchema(status=401)

    if data.status == -1:
        return ResponseSchema(status=403)

    return ResponseSchema(data=data.to_dict({"password"}))


@auth_router.post("/modify_password")
async def modify_password(
    params: ModifyPasswordSchema,
    manager: dict = GetManager,
    db: AsyncSession = GetDB,
):
    await auth.modify_password(db, manager["id"], params)
    return ResponseSchema()
