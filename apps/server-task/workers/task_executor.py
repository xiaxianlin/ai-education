"""任务执行器 - RQ Worker 使用"""
from typing import Dict, Any
from loguru import logger

from workers.question_worker import QuestionWorker
from workers.resource_worker import ResourceWorker
from workers.analysis_worker import AnalysisWorker
from models.task import TaskType


def execute_task(task_id: str, task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    执行任务 - RQ Worker 调用的函数
    
    这个函数会被 RQ Worker 调用，执行具体的任务。
    注意：这个函数必须是同步的，因为 RQ 默认不支持异步函数。
    
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
        
        # 根据任务类型选择对应的处理器
        if task_type_enum == TaskType.QUESTION_GENERATION:
            worker = QuestionWorker()
            # 注意：RQ 不支持异步，所以需要同步执行
            # 如果 worker 是异步的，需要使用 asyncio.run()
            import asyncio
            result = asyncio.run(worker.generate(payload))
            
        elif task_type_enum == TaskType.IMAGE_GENERATION:
            worker = ResourceWorker()
            import asyncio
            result = asyncio.run(worker.generate_image(payload))
            
        elif task_type_enum == TaskType.AUDIO_GENERATION:
            worker = ResourceWorker()
            import asyncio
            result = asyncio.run(worker.generate_audio(payload))
            
        elif task_type_enum == TaskType.ANSWER_ANALYSIS:
            worker = AnalysisWorker()
            import asyncio
            result = asyncio.run(worker.analyze(payload))
            
        else:
            raise ValueError(f"不支持的任务类型: {task_type}")
        
        logger.info(f"任务执行成功: task_id={task_id}, type={task_type}")
        return result
        
    except Exception as e:
        logger.error(f"任务执行失败: task_id={task_id}, type={task_type}, error={e}", exc_info=True)
        raise  # 重新抛出异常，让 RQ 记录失败状态

