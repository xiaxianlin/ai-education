"""
启动脚本，需要启动任务队列
"""
import asyncio
from core.task_queue import task_queue
from core import get_logger

logger = get_logger("startup")

async def startup_event():
    """应用启动事件"""
    logger.info("Starting background task queue...")
    await task_queue.start()
    logger.info("Background task queue started")


async def shutdown_event():
    """应用关闭事件"""
    logger.info("Shutting down background task queue...")
    await task_queue.stop()
    logger.info("Background task queue stopped")


# 在main.py中需要添加这些事件处理器
# app.add_event_handler("startup", startup_event)
# app.add_event_handler("shutdown", shutdown_event)