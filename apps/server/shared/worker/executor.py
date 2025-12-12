"""任务执行器 - Celery Worker 使用"""

import asyncio
from typing import Dict, Any
from loguru import logger
import json

from shared.worker.celery import Executor, celery_app
from shared.core.database import AsyncSessionLocal
from student.services.practice_generate import generate_practice_session


@celery_app.signals.worker_process_init.connect
def init_worker_process(**kwargs):
    """Worker 进程初始化钩子

    在 Celery worker 进程启动时调用，确保数据库连接池正确初始化。
    这解决了 fork 进程后连接池绑定到不同事件循环的问题。

    注意：SQLAlchemy 的异步引擎会在第一次使用时自动创建连接池，
    所以这里主要是确保事件循环正确设置。
    """
    # 确保当前进程有事件循环（虽然任务执行时会创建新的）
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
    except RuntimeError:
        # 如果没有事件循环，创建新的（虽然任务执行时会创建新的）
        pass

    logger.debug("Worker 进程已初始化")


@celery_app.task(
    bind=True,
    name=Executor.generate_practice_task.value,
)
def execute_generate_practice_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    执行任务 - Celery Worker 调用的函数

    注意：Celery 任务函数必须是同步函数，内部使用 asyncio.run() 来执行异步代码。
    在 Celery worker 中，每个任务都在独立的进程中运行，需要创建新的事件循环。

    Args:
        payload: 练习提交请求（字典格式，已从 JSON 反序列化）

    Returns:
        Dict: 任务执行结果
    """
    # 使用 JSON 序列化 payload 避免日志格式化问题（payload 中的 'type' 会被误解析为格式化占位符）
    payload_str = json.dumps(payload, ensure_ascii=False)
    logger.info(f"开始执行练习生成任务: payload={payload_str}")

    async def _execute():
        """内部异步执行函数"""
        # 创建新的数据库会话（Celery Worker 中不能共享主应用的会话）
        # 使用 context manager 确保会话正确关闭
        async with AsyncSessionLocal() as db:
            await generate_practice_session(
                db=db,
                type=payload.get("type"),
                student_id=payload.get("student_id"),
                textbook_id=payload.get("textbook_id"),
                unit_id=payload.get("unit_id", None),
            )

    try:
        # 在 Celery worker 中，使用 asyncio.run() 创建新的事件循环
        # 这确保每个任务都在独立的事件循环中运行，避免连接池绑定到不同事件循环的问题
        # 注意：asyncio.run() 会自动创建新的事件循环并运行，完成后关闭
        asyncio.run(_execute())
        logger.info(f"练习生成任务执行成功: payload={payload_str}")
        return {"success": True}
    except Exception as e:
        # 使用 JSON 序列化避免日志格式化问题（payload 中的 'type' 会被误解析为格式化占位符）
        logger.error(f"练习生成任务执行失败: payload={payload_str}, error={str(e)}", exc_info=True)
        raise ValueError(f"练习生成任务执行失败: {str(e)}")
