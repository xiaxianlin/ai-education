from fastapi import Request, HTTPException, Depends
from core import get_logger
from schema import ManagerStatus
from util import encrypt

logger = get_logger("ROUTE_AUTH")


def match_route(routes: list[str], path: str):
    for route in routes:
        if path.startswith(route):
            return True
    return False


# 数据管理路由
admmin_data_routes = [
    "device/add",
    "device/search",
]

# 审核管理路由
admin_audit_routes = [
    *admmin_data_routes,
]

admin_ignore_routes = [
    "/api/admin/login",
]

admin_ignore_check_routes = [
    "/api/admin/check",
    "/api/admin/modify_password",
]


def admin_route_auth(request: Request):
    path = request.url.path
    token = request.headers.get("x-access-token")

    if match_route(admin_ignore_routes, path):
        return

    if not token:
        logger.info("admin token missing")
        raise HTTPException(status_code=401, detail="登录失效")

    payload = encrypt.decode(token)

    if not payload or not payload.get("manager"):
        logger.info("admin token error")
        raise HTTPException(status_code=401, detail="登录失效")

    if match_route(admin_ignore_check_routes, path):
        return

    manager = payload["manager"]

    if manager["status"] == ManagerStatus.InActive.value:
        raise HTTPException(status_code=499, detail="账号未启用")

    if manager["status"] == ManagerStatus.Forbidden.value:
        raise HTTPException(status_code=423, detail="账号被禁用")

    # 审核管理员
    if manager["type"] == 2 and not match_route(admin_audit_routes, path):
        raise HTTPException(status_code=403, detail="权限不足")

    # 数据管理员
    if manager["type"] == 3 and not match_route(admmin_data_routes, path):
        raise HTTPException(status_code=403, detail="权限不足")


user_ignore_routes = [
    "/api/user/login",
    "/api/user/register",
]


def user_route_auth(request: Request):
    path = request.url.path
    token = request.headers.get("x-access-token")

    if match_route(user_ignore_routes, path):
        return

    if not token:
        logger.info("user token missing")
        raise HTTPException(status_code=401, detail="登录失效")

    payload = encrypt.decode(token)

    if not payload or not payload.get("user"):
        logger.info("user token error")
        raise HTTPException(status_code=401, detail="登录失效")


def get_current_user(request: Request) -> dict:
    """获取当前用户信息"""
    token = request.headers.get("x-access-token")
    
    if not token:
        logger.info("user token missing")
        raise HTTPException(status_code=401, detail="登录失效")
    
    payload = encrypt.decode(token)
    
    if not payload or not payload.get("user"):
        logger.info("user token error")
        raise HTTPException(status_code=401, detail="登录失效")
    
    return payload["user"]


def get_current_manager(request: Request) -> dict:
    """获取当前管理员信息"""
    token = request.headers.get("x-access-token")
    
    if not token:
        logger.info("admin token missing")
        raise HTTPException(status_code=401, detail="登录失效")
    
    payload = encrypt.decode(token)
    
    if not payload or not payload.get("manager"):
        logger.info("admin token error")
        raise HTTPException(status_code=401, detail="登录失效")
    
    return payload["manager"]
