import uuid
import random
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from util import encrypt, time
from store.cache import SimpleCache
from store.database.models import User
from schema.user import UserRegister

from .wechat import WechatService


from fastapi import Request, HTTPException, Depends
from core import get_logger
from common.schemas import ManagerStatus
from util import encrypt

logger = get_logger("ROUTE_AUTH")


def match_route(routes: list[str], path: str):
    for route in routes:
        if path.startswith(route):
            return True
    return False


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





class UserAuthService:

    async def check_user(db: AsyncSession, id: str):
        return await db.scalar(select(User).where(User.id == id))

    def send_code(phone: str):
        cache = SimpleCache()
        if cache.exists(f"{phone}:expire"):
            raise ValueError("发送短信太频繁，等稍后再发")

        code = "".join(random.choices("0123456789", k=6))
        # 缓存 5 分钟
        cache.set(f"{phone}:code", code, ex=300)
        # 间隔 1 分钟
        cache.set(f"{phone}:expire", 1, ex=60)

    async def register(db: AsyncSession, params: UserRegister):
        user = await db.scalar(
            select(User).where(
                or_(User.phone == params.phone, User.username == params.username),
            )
        )

        if user:
            raise ValueError("手机号或用户名已经被注册")

        cache = SimpleCache()
        key = f"{params.phone}:code"

        # 校验验证码
        if cache.get(key) != params.code:
            raise ValueError("验证码错误")
        cache.delete(key)

        user = User(
            id=uuid.uuid4(),
            username=params.username,
            password=encrypt.hash(params.password),
            phone=params.phone,
            status=1,
        )
        db.add(user)
        await db.commit()

        return user.id

    async def password_login(db: AsyncSession, account: str, password: str):
        user = await db.scalar(
            select(User).where(
                or_(User.phone == account, User.username == account),
            )
        )
        if not user:
            raise ValueError("当前用户名或密码错误")

        # 校验密码
        if type == 1 and user.password != encrypt.hash(password):
            raise ValueError("当前用户名或密码错误")

        user.update_time = time.now()

        await db.commit()

        return encrypt.encode_user(user.to_dict({"password"}))

    async def sms_login(db: AsyncSession, phone: str, code: str):
        cache = SimpleCache()
        key = f"{phone}:code"
        if cache.get(key) != code:
            raise ValueError("验证码错误")

        user = await db.scalar(select(User).where(User.phone == phone))

        if not user:
            raise ValueError("当前账户不存在")

        user.update_time = time.now()
        await db.commit()
        return encrypt.encode_user(user.to_dict({"password"}))

    async def wechat_register(db: AsyncSession, code: str, openid: str):
        user = await db.scalar(select(User).where(User.openid == openid))

        if not user:
            phone = WechatService.get_phone_number(code)
            user = await db.scalar(select(User).where(User.phone == phone))

        if user and user.openid != openid:
            raise ValueError("该手机号已经被其他微信绑定")

        if not user:
            user = User(
                id=uuid.uuid4(),
                openid=openid,
                phone=phone,
                status=1,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        return encrypt.encode_user(user.to_dict({"password"}))

    async def wechat_login(db: AsyncSession, code: str):
        data = WechatService.login(code)
        openid = data.get("openid")

        user = await db.scalar(select(User).where(User.openid == openid))

        if not user:
            return openid, None

        user.update_time = time.now()
        await db.commit()
        return encrypt.encode_user(user.to_dict({"password"}))
