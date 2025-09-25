from time import time
from fastapi import HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from common import jwt
from common.database import Manager
from common.settings import envs
from admin.schemas.manager import LoginSchema, ModifyPasswordSchema


admin_ignore_routes = [
    "/api/admin/login",
]

admin_ignore_check_routes = [
    "/api/admin/check",
    "/api/admin/modify_password",
]


def match_route(routes: list[str], path: str):
    for route in routes:
        if path.startswith(route):
            return True
    return False


def admin_route_auth(request: Request):
    path = request.url.path
    token = request.headers.get("x-access-token")

    if match_route(admin_ignore_routes, path):
        return

    if not token:
        raise HTTPException(status_code=401, detail="登录失效")

    payload = jwt.decode(token)

    if not payload or not payload.get("manager"):
        raise HTTPException(status_code=401, detail="登录失效")

    if match_route(admin_ignore_check_routes, path):
        return

    manager = payload["manager"]

    if manager["status"] == 0:
        raise HTTPException(status_code=499, detail="账号未启用")

    if manager["status"] == -1:
        raise HTTPException(status_code=423, detail="账号被禁用")


async def login(db: AsyncSession, params: LoginSchema):
    manager = await db.scalar(
        select(Manager).where(
            Manager.managername == params.managername,
        )
    )

    if not manager:
        raise ValueError("用户名或密码错误")

    if manager.password != jwt.hash(params.password):
        raise ValueError("用户名或密码错误")

    if manager.status == -1:
        raise ValueError("账号已被禁用")

    manager.update_time = int(time())

    await db.commit()
    await db.refresh(manager)

    return jwt.encode_manager(manager.to_dict({"password"}))


def get_current_manager(request: Request) -> dict:
    """获取当前管理员信息"""
    token = request.headers.get("x-access-token")

    if not token:
        raise HTTPException(status_code=401, detail="登录失效")

    payload = jwt.decode(token)

    if not payload or not payload.get("manager"):
        raise HTTPException(status_code=401, detail="登录失效")

    return payload["manager"]


async def valid_login(db: AsyncSession, id: str):
    return await db.scalar(select(Manager).where(Manager.id == id))


async def modify_password(
    db: AsyncSession,
    id: str,
    params: ModifyPasswordSchema,
):
    if params.new_password == envs.MANAGER_INIT_PASSWORD:
        raise ValueError("新密码不能和初始密码相同")

    manager = await db.scalar(select(Manager).where(Manager.id == id))

    if not manager:
        raise ValueError("账户不存在")

    hash_old = jwt.hash(params.old_password)
    if hash_old != manager.password:
        raise ValueError("旧密码错误")

    if manager.status == 0:
        manager.status = 1

    manager.password = jwt.hash(params.new_password)

    await db.commit()
