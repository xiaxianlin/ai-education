from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from util.encrypt import GetManager
from service.admin import AdminAuthService
from schema.common import ResponseModel
from schema.admin import LoginParams, ModifyPasswordParams

router = APIRouter()


@router.post("/login")
async def login(params: LoginParams, db: AsyncSession = GetDB):
    data = await AdminAuthService.login(db, params)
    return ResponseModel(data=data)


@router.get("/check")
async def check(manager: dict = GetManager, db: AsyncSession = GetDB):
    data = await AdminAuthService.valid_login(db, manager["id"])

    if not data:
        return ResponseModel(status=401)

    return ResponseModel(data=data.to_dict({"password"}))


@router.post("/modify_password")
async def modify_password(
    params: ModifyPasswordParams,
    manager: dict = GetManager,
    db: AsyncSession = GetDB,
):
    await AdminAuthService.modify_password(db, manager["id"], params)
    return ResponseModel()
