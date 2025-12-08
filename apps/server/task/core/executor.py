"""任务执行器 - RQ Worker 使用"""

import asyncio

from typing import Dict, Any
from loguru import logger

from task.schema import TaskType
from task.workers.practice import PracticeWorker


def execute_task(task_id: str, task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    执行任务 - RQ Worker 调用的函数

    Args:
        task_id: 任务ID
        task_type: 任务类型字符串
        payload: 任务负载数据

    Returns:
        Dict: 任务执行结果
    """
    logger.info(f"开始执行任务: task_id={task_id}, type={task_type}")

    try:
        # 将字符串转换为 TaskType 枚举
        task_type_enum = TaskType(task_type)

        if task_type_enum == TaskType.PRACTICE:
            worker = PracticeWorker()
            # RQ 不支持异步，需要使用 asyncio.run()
            result = asyncio.run(worker.run(payload))
        else:
            raise ValueError(f"不支持的任务类型: {task_type}")

        logger.info(f"任务执行成功: task_id={task_id}, type={task_type}")
        return result

    except Exception as e:
        logger.error(f"任务执行失败: task_id={task_id}, type={task_type}, error={e}", exc_info=True)
        raise
