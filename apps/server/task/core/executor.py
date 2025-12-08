"""任务执行器 - RQ Worker 使用"""
from typing import Dict, Any
from loguru import logger
import asyncio

from task.workers.question_worker import QuestionWorker
from task.models.task import TaskType


def execute_task(task_id: str, task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    执行任务 - RQ Worker 调用的函数
    
    当前只支持题目生成任务。
    注意：这个函数必须是同步的，因为 RQ 默认不支持异步函数。
    
    Args:
        task_id: 任务ID
        task_type: 任务类型字符串（当前只支持 "question_generation"）
        payload: 任务负载数据
        
    Returns:
        Dict: 任务执行结果
    """
    logger.info(f"开始执行任务: task_id={task_id}, type={task_type}")
    
    try:
        # 将字符串转换为 TaskType 枚举
        task_type_enum = TaskType(task_type)
        
        # 只支持题目生成任务
        if task_type_enum == TaskType.QUESTION_GENERATION:
            worker = QuestionWorker()
            # 注意：RQ 不支持异步，所以需要使用 asyncio.run()
            result = asyncio.run(worker.run(payload))
        else:
            raise ValueError(f"不支持的任务类型: {task_type}，当前只支持 question_generation")
        
        logger.info(f"任务执行成功: task_id={task_id}, type={task_type}")
        return result
        
    except Exception as e:
        logger.error(f"任务执行失败: task_id={task_id}, type={task_type}, error={e}", exc_info=True)
        raise  # 重新抛出异常，让 RQ 记录失败状态

