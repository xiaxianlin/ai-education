import uuid
from sqlalchemy import asc, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from core import settings
from util import encrypt
from store.database.models import Manager
from schema.admin import CraeteManager, ManagerSearchParams


class ManagerService:

    async def create(db: AsyncSession, params: CraeteManager):
        manager = await db.scalar(
            select(Manager).where(Manager.username == params.username),
        )

        if manager:
            raise ValueError("账号已经存在")

        manager = Manager(
            id=uuid.uuid4(),
            username=params.username,
            password=encrypt.hash(settings.MANAGER_INIT_PASSWORD),
            type=params.type,
        )
        db.add(manager)
        await db.commit()

        return manager.id

    async def modify_status(db: AsyncSession, id: str, status: int):
        manager = await db.scalar(select(Manager).where(Manager.id == id))
        if not manager:
            raise ValueError("账号不存在")

        if manager.username == settings.ADMIN_USERNAME:
            raise ValueError("初始管理员不能更改状态")

        manager.status = status
        await db.commit()

    async def delete(db: AsyncSession, id: str):
        manager = await db.scalar(select(Manager).where(Manager.id == id))
        if not manager:
            raise ValueError("账号不存在")

        if manager["username"] == settings.ADMIN_USERNAME:
            raise ValueError("初始管理员不能被删除")

        await db.delete(manager)
        await db.commit()

    async def search(db: AsyncSession, params: ManagerSearchParams):
        stmt = select(Manager)
        if params.keywords:
            stmt = stmt.where(Manager.username.like(f"%{params.keywords}%"))
        if params.type:
            stmt = stmt.where(Manager.type == params.type)
        if params.status:
            stmt = stmt.where(Manager.status == params.status)

        # --- 总数 ---
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await db.scalar(count_stmt)

        # --- 排序 ---
        sort_column = getattr(Manager, params.sort, Manager.create_time)
        stmt = stmt.order_by(
            desc(sort_column) if params.order == "desc" else asc(sort_column),
        )

        # --- 分页 ---
        offset = (params.current_page - 1) * params.page_size
        stmt = stmt.offset(offset).limit(params.page_size)

        results = await db.scalars(stmt)

        return {
            "total": total,
            "data": [manager.to_dict({"password"}) for manager in results.all()],
        }
