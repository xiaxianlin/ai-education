"""任务执行器 - Celery Worker 使用"""

import asyncio
from typing import Any, Dict

from loguru import logger
from shared.core.settings import envs
from shared.practice.generate import execute_generate_practice
from shared.worker.celery import Executor, celery_app
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker


def create_worker_session_factory():
    """为 Celery worker 创建独立的数据库引擎和会话工厂

    重要：在 Celery worker 中不能使用全局的 AsyncSessionLocal，因为：
    1. 全局的 async_engine 在模块导入时被创建并绑定到当时的事件循环
    2. asyncio.run() 每次调用会创建新的事件循环
    3. 使用绑定到旧事件循环的连接池会导致 "Future attached to a different loop" 错误

    因此需要在当前事件循环中创建新的引擎和会话工厂。
    """
    engine = create_async_engine(
        envs.DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_size=5,  # worker 使用较小的连接池
        max_overflow=5,
        pool_timeout=envs.DATABASE_POOL_TIMEOUT,
        pool_recycle=envs.DATABASE_POOL_RECYCLE,
        connect_args={"charset": "utf8mb4"},
    )

    session_factory = sessionmaker(
        class_=AsyncSession,
        expire_on_commit=False,
        bind=engine,
    )

    return engine, session_factory


@celery_app.task(
    bind=True,
    name=Executor.generate_practice_task.value,
)
def execute_generate_practice_task(self, session_id: str, generate_count: int = 15) -> Dict[str, Any]:
    """
    执行任务 - Celery Worker 调用的函数

    注意：Celery 任务函数必须是同步函数，内部使用 asyncio.run() 来执行异步代码。
    在 Celery worker 中，每个任务都在独立的进程中运行，需要创建新的事件循环。

    Args:
        session_id: 练习会话ID (UUID v4)
        generate_count: 生成题目数量，默认 15

    Returns:
        Dict: 任务执行结果
    """
    logger.info(f"开始执行练习生成任务: session_id={session_id}, generate_count={generate_count}")

    async def _execute():
        """内部异步执行函数"""
        # 在当前事件循环中创建独立的数据库引擎和会话工厂
        # 这样可以避免 "Future attached to a different loop" 错误
        engine, session_factory = create_worker_session_factory()

        try:
            async with session_factory() as db:
                # 传递 session_factory 给工作流，确保内部的并行任务也使用正确的事件循环
                await execute_generate_practice(db, session_id, generate_count, session_factory)
        finally:
            # 任务完成后关闭引擎，释放连接池资源
            await engine.dispose()

    try:
        # 在 Celery worker 中，使用 asyncio.run() 创建新的事件循环
        # 这确保每个任务都在独立的事件循环中运行
        # 注意：asyncio.run() 会自动创建新的事件循环并运行，完成后关闭
        asyncio.run(_execute())
        logger.info("练习生成任务执行成功")
        return {"success": True}
    except Exception as e:
        # 使用 JSON 序列化避免日志格式化问题（payload 中的 'type' 会被误解析为格式化占位符）
        logger.error(f"练习生成任务执行失败: error={str(e)}")
        raise ValueError(f"练习生成任务执行失败: {str(e)}")
