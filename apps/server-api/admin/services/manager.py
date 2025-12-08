import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import ModifyPasswordSchema, CreateManangeSchema, UpdateManangeSchema
from shared.core.database import AsyncSessionLocal, Manager
from shared.core.schema import ManagerSchema
from shared.core.settings import envs
from shared.utils import encrypt
from shared.utils.time import now


async def init_super_manager():
    """初始化超级管理员"""
    async with AsyncSessionLocal() as db:
        manager = await db.scalar(select(Manager).where(Manager.username == envs.ADMIN_USERNAME))
        if manager is not None:
            return

        manager = Manager(
            id=uuid.uuid4(),
            username=envs.ADMIN_USERNAME,
            password=encrypt.hash(envs.ADMIN_PASSWORD),
            type=0,
            status=1,
        )
        db.add(manager)
        await db.commit()


async def create_manager(db: AsyncSession, params: CreateManangeSchema):
    """创建管理员"""
    manager = await db.scalar(select(Manager).where(Manager.username == params.username))
    if manager:
        raise ValueError("账号已经存在")

    password = encrypt.generate_password()
    manager = Manager(
        id=uuid.uuid4(),
        username=params.username,
        password=encrypt.hash(password),
        type=params.type,
        status=1,
    )
    db.add(manager)
    await db.commit()
    return password


async def reset_manager_password(db: AsyncSession, id: str):
    """重置管理员密码"""
    manager = await db.scalar(select(Manager).where(Manager.id == id))
    if not manager:
        raise ValueError("账号不存在")

    if manager.username == envs.ADMIN_USERNAME:
        raise ValueError("不能重置超级管理员密码")

    password = encrypt.generate_password()
    manager.password = encrypt.hash(password)
    manager.update_time = now()
    await db.commit()
    return password


async def update_manager_password(db: AsyncSession, id: str, params: ModifyPasswordSchema):
    """更新管理员密码"""
    manager = await db.scalar(select(Manager).where(Manager.id == id))
    if not manager:
        raise ValueError("账号不存在")

    origin = encrypt.hash(params.origin)
    if origin != manager.password:
        raise ValueError("旧密码错误")

    manager.password = encrypt.hash(params.password)
    manager.update_time = now()

    token = encrypt.encode({"id": manager.id, "update_time": manager.update_time})
    manager.token = token
    await db.commit()


async def update_manager(db: AsyncSession, id: str, params: UpdateManangeSchema):
    """更新管理员信息"""
    manager = await db.scalar(select(Manager).where(Manager.id == id))
    if not manager:
        raise ValueError("管理员不存在")

    if manager.username == envs.ADMIN_USERNAME:
        raise ValueError("不能修改超级管理员")

    if params.status is not None:
        manager.status = params.status
    if params.type is not None:
        manager.type = params.type
    manager.update_time = now()
    await db.commit()


async def delete_manager(db: AsyncSession, id: str):
    """删除管理员"""
    manager = await db.scalar(select(Manager).where(Manager.id == id))
    if not manager:
        raise ValueError("管理员不存在")

    if manager.username == envs.ADMIN_USERNAME:
        raise ValueError("不能删除超级管理员")

    await db.delete(manager)
    await db.commit()


async def find_all(db: AsyncSession):
    """查询所有管理员"""
    result = await db.scalars(select(Manager))
    return [ManagerSchema.model_validate(item) for item in result.all()]
