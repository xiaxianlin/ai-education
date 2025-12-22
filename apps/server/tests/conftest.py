import asyncio
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from unittest.mock import MagicMock

from shared.core.database import Base
from shared.core.settings import envs

# 测试数据库和 Redis 配置
TEST_DATABASE_URL = "mysql+asyncmy://xiaxianlin:Xiaxl.901208@47.96.105.206:3306/ai_education_test"
TEST_REDIS_URL = "redis://127.0.0.1:6379/1"

@pytest_asyncio.fixture
async def db_engine():
    """每个测试创建一个引擎，避免跨事件循环问题"""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    
    # 确保表存在
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(autouse=True)
async def setup_test_envs(monkeypatch, db_engine):
    """设置测试环境变量并替换全局引擎（函数作用域）"""
    from shared.core import database
    
    # 替换全局变量
    monkeypatch.setattr(database, "async_engine", db_engine)
    async_session_factory = sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )
    monkeypatch.setattr(database, "AsyncSessionLocal", async_session_factory)
    
    # 也要替换可能已经导入了 AsyncSessionLocal 的模块
    try:
        from admin.services import manager as manager_service
        monkeypatch.setattr(manager_service, "AsyncSessionLocal", async_session_factory)
    except (ImportError, AttributeError):
        pass
        
    try:
        from student.services import practice as practice_service
        monkeypatch.setattr(practice_service, "AsyncSessionLocal", async_session_factory)
    except (ImportError, AttributeError):
        pass

    # 覆盖配置
    monkeypatch.setattr(envs, "DATABASE_URL", TEST_DATABASE_URL)
    monkeypatch.setattr(envs, "REDIS_URL", TEST_REDIS_URL)
    monkeypatch.setattr(envs, "ADMIN_USERNAME", "admin")
    monkeypatch.setattr(envs, "ADMIN_PASSWORD", "admin_password")
    monkeypatch.setattr(envs, "APP_SECRET_KEY", "test_secret_key_long_enough_for_security_checks_32chars")

    yield

@pytest_asyncio.fixture
async def db_session(db_engine):
    """获取测试数据库会话"""
    async_session_factory = sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session_factory() as session:
        yield session
        await session.rollback()

@pytest.fixture
def mock_aliyun_provider():
    """Mock 阿里云 Provider"""
    from shared.provider.aliyun import AliyunProvider
    mock = MagicMock(spec=AliyunProvider)
    return mock

@pytest.fixture(autouse=True)
def patch_provider(monkeypatch, mock_aliyun_provider):
    """自动应用 Provider Mock"""
    # 基础 patch
    monkeypatch.setattr("shared.provider.get_provider", lambda: mock_aliyun_provider)
    
    # 针对已导入模块的 patch
    try:
        from shared.services import answer as answer_service
        monkeypatch.setattr(answer_service, "get_provider", lambda: mock_aliyun_provider)
    except (ImportError, AttributeError):
        pass
        
    try:
        from admin.services import practice as practice_service
        monkeypatch.setattr(practice_service, "get_provider", lambda: mock_aliyun_provider)
    except (ImportError, AttributeError):
        pass
