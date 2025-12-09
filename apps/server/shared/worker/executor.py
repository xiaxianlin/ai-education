"""任务执行器 - Celery Worker 使用"""

import asyncio
from typing import Dict, Any
from loguru import logger

from shared.worker.celery import Executor, celery_app
from shared.core.database import AsyncSessionLocal
from student.schema import PracticeSubmitParams
from student.services.practice_generate import generate_practice_session


@celery_app.task(
    bind=True,
    name=Executor.generate_practice_task.value,
    autoretry_for=(Exception,),  # 自动重试所有异常
    retry_backoff=60,  # 重试延迟：60秒，然后翻倍
    retry_kwargs={"max_retries": 3},  # 最大重试 3 次
    retry_jitter=True,  # 添加随机抖动避免雷群效应
)
def execute_generate_practice_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    执行任务 - Celery Worker 调用的函数

    注意：Celery 任务函数必须是同步函数，内部使用 asyncio.run() 来执行异步代码。

    Args:
        payload: 练习提交请求（字典格式，已从 JSON 反序列化）

    Returns:
        Dict: 任务执行结果
    """
    # 将字典转换为 Pydantic 模型
    params = PracticeSubmitParams(**payload)
    logger.info(f"开始执行练习生成任务: payload={params}")

    async def _execute():
        """内部异步执行函数"""
        # 创建新的数据库会话（Celery Worker 中不能共享主应用的会话）
        # 使用 context manager 确保会话正确关闭
        async with AsyncSessionLocal() as db:
            await generate_practice_session(
                db=db,
                type=params.type,
                student_id=params.student_id,
                textbook_id=params.textbook_id,
                unit_id=params.unit_id,
            )

    try:
        # 在同步函数中运行异步代码
        asyncio.run(_execute())
        logger.info(f"练习生成任务执行成功: payload={params}")
        return {"success": True}
    except Exception as e:
        logger.error(f"练习生成任务执行失败: payload={params}, error={e}", exc_info=True)
        raise ValueError(f"练习生成任务执行失败: {str(e)}")
