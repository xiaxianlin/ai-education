from time import time
from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from utils import encrypt
from common.database import Manager
from common.schema import ManagerSchema
from admin.schema import LoginSchema


admin_ignore_routes = [
    "/api/admin/login",
    "/api/admin/modify_password",
]


def match_route(routes: list[str], path: str):
    for route in routes:
        if path.startswith(route):
            return True
    return False


async def login(db: AsyncSession, params: LoginSchema):
    manager = await db.scalar(select(Manager).where(Manager.username == params.username))

    if not manager:
        raise ValueError("用户名或密码错误")

    if manager.password != encrypt.hash(params.password):
        raise ValueError("用户名或密码错误")

    if manager.status == -1:
        raise ValueError("账号已被禁用")

    manager.update_time = int(time())

    await db.commit()
    await db.refresh(manager)

    return encrypt.encode({"manager": ManagerSchema.model_validate(manager)})


def admin_route_auth(request: Request):
    path = request.url.path
    token = request.headers.get("x-access-token")

    if match_route(admin_ignore_routes, path):
        return

    if not token:
        raise HTTPException(status_code=401, detail="登录失效")

    payload = encrypt.decode(token)

    if not payload or not payload.get("manager"):
        raise HTTPException(status_code=401, detail="登录失效")

    manager = payload["manager"]

    if manager["status"] == 0:
        raise HTTPException(status_code=499, detail="账号未启用")


def check_manager(request: Request) -> dict:
    token = request.headers.get("x-access-token")
    payload = encrypt.decode(token)

    if not payload or not payload.get("manager"):
        raise HTTPException(status_code=401, detail="登录失效")

    return payload.get("manager")


CurrentManager = Depends(check_manager)
