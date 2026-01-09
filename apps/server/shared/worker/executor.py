"""任务执行器 - Celery Worker 使用"""

import asyncio
from typing import Any, Dict

from loguru import logger
from shared.core.database import AsyncSessionLocal
from shared.practice.generate import execute_generate_practice
from shared.worker.celery import Executor, celery_app


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
        # 创建新的数据库会话（Celery Worker 中不能共享主应用的会话）
        # 使用 context manager 确保会话正确关闭
        async with AsyncSessionLocal() as db:
            await execute_generate_practice(db, session_id, generate_count)

    try:
        # 在 Celery worker 中，使用 asyncio.run() 创建新的事件循环
        # 这确保每个任务都在独立的事件循环中运行，避免连接池绑定到不同事件循环的问题
        # 注意：asyncio.run() 会自动创建新的事件循环并运行，完成后关闭
        asyncio.run(_execute())
        logger.info("练习生成任务执行成功")
        return {"success": True}
    except Exception as e:
        # 使用 JSON 序列化避免日志格式化问题（payload 中的 'type' 会被误解析为格式化占位符）
        logger.error(f"练习生成任务执行失败: error={str(e)}")
        raise ValueError(f"练习生成任务执行失败: {str(e)}")
