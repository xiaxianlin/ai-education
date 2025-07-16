from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from util.encrypt import GetManager
from service.admin import AdminAuthService
from schema import ManagerStatus, ResponseSchema, AdminLoginSchema, ModifyPasswordSchema

router = APIRouter()


@router.post("/login")
async def login(params: AdminLoginSchema, db: AsyncSession = GetDB):
    data = await AdminAuthService.login(db, params)
    return ResponseSchema(data=data)


@router.get("/check")
async def check(manager: dict = GetManager, db: AsyncSession = GetDB):
    data = await AdminAuthService.valid_login(db, manager["id"])

    if not data:
        return ResponseSchema(status=401)

    if data.status == ManagerStatus.InActive.value:
        return ResponseSchema(status=403)

    return ResponseSchema(data=data.to_dict({"password"}))


@router.post("/modify_password")
async def modify_password(
    params: ModifyPasswordSchema,
    manager: dict = GetManager,
    db: AsyncSession = GetDB,
):
    await AdminAuthService.modify_password(db, manager["id"], params)
    return ResponseSchema()
