from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core import settings
from util import encrypt, time
from store.database.models import Manager
from schema.admin import LoginParams, ModifyPasswordParams


class AdminAuthService:
    async def login(db: AsyncSession, params: LoginParams):
        manager = await db.scalar(
            select(Manager).where(
                Manager.username == params.username,
            )
        )

        if not manager:
            raise ValueError("用户名或密码错误")

        if manager.password != encrypt.hash(params.password):
            raise ValueError("用户名或密码错误")

        if manager.status == -1:
            raise ValueError("账号已被禁用")

        manager.update_time = time.now()

        await db.commit()
        await db.refresh(manager)

        return encrypt.encode_manager(manager.to_dict({"password"}))

    async def valid_login(db: AsyncSession, id: str):
        return await db.scalar(select(Manager).where(Manager.id == id))

    async def modify_password(
        db: AsyncSession,
        id: str,
        params: ModifyPasswordParams,
    ):
        if params.new == settings.MANAGER_INIT_PASSWORD:
            raise ValueError("新密码不能和初始密码相同")

        manager = await db.scalar(select(Manager).where(Manager.id == id))

        if not manager:
            raise ValueError("账户不存在")

        hash_old = encrypt.hash(params.old)
        if hash_old != manager.password:
            raise ValueError("旧密码错误")

        manager.password = encrypt.hash(params.new)

        await db.commit()
