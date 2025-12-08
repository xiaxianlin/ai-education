"""任务服务 - 提供任务提交和查询功能"""
from typing import Optional, Dict, Any
from datetime import datetime
from loguru import logger
import uuid

from task.models.task import TaskRequest, TaskResponse, TaskStatus, TaskType, QuestionSubmitRequest
from task.services.rq_service import RQService
from shared.core.settings import envs

# 初始化 RQ 服务，使用默认队列
_rq_service = RQService(queue_name=envs.TASK_QUEUE_NAME)


async def submit_question_task(request: QuestionSubmitRequest) -> TaskResponse:
    """
    提交题目生成任务
    
    提交一个题目生成任务到任务队列，任务将异步执行。
    参数与 invoke_generate_workflow 函数要求一致。
    
    Args:
        request: 题目生成请求
        
    Returns:
        TaskResponse: 任务响应
    """
    try:
        # 自动生成任务ID
        task_id = f"question_{uuid.uuid4().hex[:16]}"
        
        # 构建任务负载
        payload = {
            "type": request.type,
            "count": request.count,
            "textbook_id": request.textbook_id,
        }
        if request.student_id:
            payload["student_id"] = request.student_id
        if request.unit_id:
            payload["unit_id"] = request.unit_id
        
        # 创建 TaskRequest
        task_request = TaskRequest(
            task_id=task_id,
            task_type=TaskType.QUESTION_GENERATION,
            payload=payload,
            timeout=600,  # 题目生成默认超时时间 10 分钟
        )
        
        # 提交任务到 RQ 队列
        job_id = _rq_service.submit_task(task_request)
        
        # 创建初始任务响应
        now = datetime.now()
        task_response = TaskResponse(
            task_id=task_id,
            status=TaskStatus.PENDING,
            created_at=now,
            updated_at=now,
        )
        
        # 立即查询一次状态（可能已经在处理中）
        current_status = _rq_service.get_task_status(task_id)
        if current_status:
            return current_status
        
        return task_response
    except Exception as e:
        logger.error(f"提交任务失败: {e}", exc_info=True)
        raise ValueError(f"提交任务失败: {str(e)}")


async def get_task_status(task_id: str) -> Optional[TaskResponse]:
    """
    获取任务状态
    
    根据任务ID查询任务的执行状态和结果。
    
    Args:
        task_id: 任务ID
        
    Returns:
        TaskResponse: 任务响应，如果不存在则返回 None
    """
    return _rq_service.get_task_status(task_id)


async def cancel_task(task_id: str) -> bool:
    """
    取消任务
    
    取消一个待处理的任务。只能取消状态为 `pending` 的任务。
    
    Args:
        task_id: 任务ID
        
    Returns:
        bool: 是否成功取消
    """
    return _rq_service.cancel_task(task_id)

