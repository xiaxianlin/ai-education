"""任务相关路由"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from loguru import logger
import uuid

from models.task import TaskRequest, TaskResponse, TaskStatus, TaskType, QuestionSubmitRequest
from services.rq_service import RQService
from core.settings import envs

router = APIRouter(prefix="/api/task", tags=["task"])

# 初始化 RQ 服务，使用默认队列
rq_service = RQService(queue_name="default")


@router.post("/question/submit/", response_model=TaskResponse)
async def submit_question_task(request: QuestionSubmitRequest):
    """
    提交题目生成任务
    
    提交一个题目生成任务到任务队列，任务将异步执行。
    参数与 invoke_generate_workflow 函数要求一致。
    
    **参数说明**:
    - `count`: 生成题目数量
    - `type`: 生成类型 (unit, textbook, daily_practice, unit_practice, assessment)
    - `textbook_id`: 教材ID（必填）
    - `student_id`: 学生ID（可选，每日练习时需要）
    - `unit_id`: 单元ID（可选，单元生成时需要）
    
    **示例请求**:
    ```json
    {
        "type": "unit",
        "count": 10,
        "textbook_id": 1,
        "unit_id": 1
    }
    ```
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
        job_id = rq_service.submit_task(task_request)
        
        # 创建初始任务响应
        now = datetime.now()
        task_response = TaskResponse(
            task_id=task_id,
            status=TaskStatus.PENDING,
            created_at=now,
            updated_at=now,
        )
        
        # 立即查询一次状态（可能已经在处理中）
        current_status = rq_service.get_task_status(task_id)
        if current_status:
            return current_status
        
        return task_response
    except Exception as e:
        logger.error(f"提交任务失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """
    获取任务状态
    
    根据任务ID查询任务的执行状态和结果。
    """
    task = rq_service.get_task_status(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task


@router.post("/{task_id}/cancel")
async def cancel_task(task_id: str):
    """
    取消任务
    
    取消一个待处理的任务。只能取消状态为 `pending` 的任务。
    """
    success = rq_service.cancel_task(task_id)
    if not success:
        raise HTTPException(
            status_code=400, 
            detail="任务无法取消（任务不存在或不在待处理状态）"
        )
    return {"message": "任务已取消", "task_id": task_id}


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    status: Optional[TaskStatus] = None,
    limit: int = 100
):
    """
    列出任务
    
    获取任务列表，可以按状态筛选。
    
    **查询参数**:
    - `status`: 任务状态筛选（可选）
    - `limit`: 返回数量限制（默认 100）
    """
    tasks = rq_service.list_tasks(status=status, limit=limit)
    return tasks

