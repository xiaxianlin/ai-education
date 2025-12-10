from datetime import datetime
from enum import Enum
from typing import Any, List

from celery import Celery, states
from celery.result import AsyncResult
from loguru import logger

from shared.core.settings import envs


class Executor(Enum):
    generate_practice_task = "shared.worker.executor.execute_generate_practice_task"


# 创建 Celery 应用
celery_app = Celery(
    "ai-education",
    broker=envs.REDIS_URL,
    backend=envs.REDIS_URL,
    include=["shared.worker.executor"],  # 包含任务模块
)

# Celery 配置
celery_app.conf.update(
    # 任务序列化
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # 时区设置
    timezone="Asia/Shanghai",
    enable_utc=True,
    # 任务跟踪和超时
    task_track_started=True,  # 跟踪任务开始时间
    task_time_limit=envs.TASK_TIMEOUT + 60,  # 任务硬超时时间（秒）- 30分钟 + 1分钟缓冲
    task_soft_time_limit=envs.TASK_TIMEOUT,  # 任务软超时时间（秒）- 30分钟
    # 结果存储
    result_expires=3600,  # 结果保留 1 小时
    # Worker 可靠性
    task_reject_on_worker_lost=True,  # Worker 丢失时拒绝任务
    task_acks_late=True,  # 任务完成后才确认
    worker_prefetch_multiplier=1,  # 每个 worker 只预取 1 个任务
    # 重试配置
    task_default_retry_delay=60,  # 默认重试延迟（秒）
    task_max_retries=3,  # 最大重试次数
    # 性能优化
    worker_max_tasks_per_child=1000,  # 每个子进程最多处理任务数
    worker_disable_rate_limits=False,  # 启用速率限制
    # 队列配置
    task_default_queue=envs.TASK_QUEUE_NAME,
    task_default_exchange=envs.TASK_QUEUE_NAME,
    task_default_exchange_type="direct",
    task_default_routing_key=envs.TASK_QUEUE_NAME,
    # 监控
    worker_send_task_events=True,  # 发送任务事件
    task_send_sent_event=True,  # 发送任务发送事件
)

logger.info(f"Celery 应用已初始化: broker={envs.REDIS_URL}")


def submit_task(task_id: str, executor: Executor, args: List[Any]) -> str:
    """
    提交任务到 Celery 队列

    Args:
        task_id: 任务ID
        executor: 任务执行器枚举
        args: 任务参数列表（会被序列化为 JSON）

    Returns:
        str: Celery 任务ID
    """
    logger.info(
        f"提交任务到 Celery 队列: task_id={task_id}, task_name={executor.value}, args={args}"
    )

    task = celery_app.send_task(
        name=executor.value,
        args=args,
        task_id=task_id,
        time_limit=envs.TASK_TIMEOUT + 60,
        soft_time_limit=envs.TASK_TIMEOUT,
        queue=envs.TASK_QUEUE_NAME,
    )

    logger.info(f"任务已提交到 Celery: task_id={task.id}, task_name={executor.value}")
    return task.id


def get_task_status(task_id: str) -> str:
    """
    获取任务状态
    Args:
        task_id: 任务ID
        executor: 任务执行器枚举
        args: 任务参数列表（会被序列化为 JSON）

    Returns:
        TaskResultSchema: 任务状态
    """
    try:
        result = AsyncResult(task_id, app=celery_app)
        return result.state

    except Exception as e:
        logger.debug(f"获取任务状态失败: task_id={task_id}, error={e}")
        return "FAILURE"


def cancel_task(task_id: str) -> bool:
    """取消任务"""
    try:
        result = AsyncResult(task_id, app=celery_app)

        # 只能取消待处理或正在处理的任务
        if result.state in [states.PENDING, states.STARTED]:
            result.revoke(terminate=True)
            logger.info(f"任务已取消: task_id={task_id}")
            return True
        else:
            logger.warning(f"任务无法取消，当前状态: {result.state}, task_id={task_id}")
            return False

    except Exception as e:
        logger.error(f"取消任务失败: task_id={task_id}, error={e}")
        return False
