from fastapi import HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from shared.utils import encrypt
from shared.core.database import AsyncSessionLocal, Manager
from shared.core.schema import ManagerSchema
from admin.schema import LoginSchema
from shared.utils.time import now


admin_ignore_routes = ["/api/admin/login"]


async def admin_route_filter(request: Request):
    path = request.url.path
    if path in admin_ignore_routes:
        return

    token = request.headers.get("x-access-token")
    if not token:
        raise HTTPException(status_code=401, detail="登录失效")

    payload = encrypt.decode(token)

    if not payload:
        raise HTTPException(status_code=401, detail="登录失效")

    # 使用 async with 确保数据库会话正确关闭
    async with AsyncSessionLocal() as db:
        manager: Manager = await db.scalar(select(Manager).where(Manager.token == token))

    if not manager or manager.id != payload.get("id"):
        raise HTTPException(status_code=401, detail="登录失效")

    if manager.status == 0:
        raise HTTPException(status_code=401, detail="账号被禁用")

    request.state.manager = ManagerSchema.model_validate(manager)


async def admin_login(db: AsyncSession, params: LoginSchema):
    manager = await db.scalar(select(Manager).where(Manager.username == params.username))

    if not manager:
        raise ValueError("用户名或密码错误")

    if not encrypt.verify_password(params.password, manager.password):
        raise ValueError("用户名或密码错误")

    if manager.status == 0:
        raise ValueError("账号被禁用")

    manager.update_time = now()

    token = encrypt.encode({"id": manager.id, "update_time": manager.update_time})
    manager.token = token
    await db.commit()
    return token


def check_super_permission(request: Request):
    """检查超级管理员权限"""
    manager: ManagerSchema = request.state.manager
    if manager.type != 0:
        raise HTTPException(status_code=403, detail="权限不足")
