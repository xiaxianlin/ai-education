"""
数据库基础模块

包含数据库连接、Base 类和基础模型。
"""

from typing import Optional

from fastapi import Depends
from shared.core.settings import envs
from shared.utils.time import now
from sqlalchemy import JSON, Boolean, Integer, String, Text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    column_property,
    mapped_column,
    relationship,
    sessionmaker,
)

# 数据库引擎
async_engine = create_async_engine(
    envs.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=envs.DATABASE_POOL_SIZE,
    max_overflow=envs.DATABASE_MAX_OVERFLOW,
    pool_timeout=envs.DATABASE_POOL_TIMEOUT,
    pool_recycle=envs.DATABASE_POOL_RECYCLE,
)

# 异步会话工厂
AsyncSessionLocal = sessionmaker(
    class_=AsyncSession,
    expire_on_commit=False,
    bind=async_engine,
)


async def init_database():
    """初始化数据库（创建表）"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """获取数据库会话（用于路由依赖）"""
    async with AsyncSessionLocal() as session:
        yield session


Database = Depends(get_db)


def get_async_session() -> AsyncSession:
    """获取异步数据库会话（用于后台任务）"""
    return AsyncSessionLocal()


class Base(DeclarativeBase):
    """SQLAlchemy 声明式基类"""

    pass


class BaseModel(Base):
    """基础模型（抽象类）"""

    __abstract__ = True


# 导出常用类型供其他模块使用
__all__ = [
    "async_engine",
    "AsyncSessionLocal",
    "init_database",
    "get_db",
    "get_async_session",
    "Database",
    "Base",
    "BaseModel",
    # SQLAlchemy 类型
    "Mapped",
    "mapped_column",
    "relationship",
    "column_property",
    # 数据类型
    "JSON",
    "Boolean",
    "Integer",
    "String",
    "Text",
    # 工具
    "now",
    "Optional",
]
