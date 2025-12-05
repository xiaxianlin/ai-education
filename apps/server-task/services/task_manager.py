"""任务管理器 - 使用 RQ 进行任务队列管理"""
from typing import Optional
from loguru import logger

from models.task import TaskRequest, TaskResponse, TaskStatus
from services.rq_service import RQService


class TaskManager:
    """任务管理器 - 使用 RQ 进行任务队列管理"""
    
    def __init__(self, queue_name: str = "default"):
        """
        初始化任务管理器
        
        Args:
            queue_name: RQ 队列名称，默认为 "default"
        """
        self.rq_service = RQService(queue_name=queue_name)
        logger.info(f"TaskManager 初始化完成，使用队列: {queue_name}")
        
    async def submit_task(self, request: TaskRequest) -> TaskResponse:
        """
        提交任务到 RQ 队列
        
        Args:
            request: 任务请求
            
        Returns:
            TaskResponse: 任务响应（初始状态为 PENDING）
        """
        # 提交任务到 RQ 队列
        job_id = self.rq_service.submit_task(request)
        
        # 创建初始任务响应
        task_response = TaskResponse(
            task_id=request.task_id,
            status=TaskStatus.PENDING,
            created_at=request.model_dump().get("created_at"),  # 如果 request 有 created_at
        )
        
        # 立即查询一次状态（可能已经在处理中）
        current_status = self.rq_service.get_task_status(request.task_id)
        if current_status:
            return current_status
        
        return task_response
    
    def get_task(self, task_id: str) -> Optional[TaskResponse]:
        """
        获取任务状态
        
        Args:
            task_id: 任务ID
            
        Returns:
            TaskResponse: 任务响应，如果不存在则返回 None
        """
        return self.rq_service.get_task_status(task_id)
    
    def cancel_task(self, task_id: str) -> bool:
        """
        取消任务
        
        Args:
            task_id: 任务ID
            
        Returns:
            bool: 是否成功取消
        """
        return self.rq_service.cancel_task(task_id)
    
    def list_tasks(
        self, 
        status: Optional[TaskStatus] = None,
        limit: int = 100
    ) -> list[TaskResponse]:
        """
        列出任务
        
        Args:
            status: 任务状态筛选
            limit: 返回数量限制
            
        Returns:
            list[TaskResponse]: 任务列表
        """
        return self.rq_service.list_tasks(status=status, limit=limit)

