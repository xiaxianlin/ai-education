"""任务相关路由"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional

from models.task import TaskRequest, TaskResponse, TaskStatus
from services.task_manager import TaskManager
from core.settings import envs

router = APIRouter(prefix="/api/task", tags=["task"])

# 初始化任务管理器，使用默认队列
task_manager = TaskManager(queue_name="default")


@router.post("/submit", response_model=TaskResponse)
async def submit_task(request: TaskRequest):
    """
    提交任务
    
    提交一个 AI 生成任务到任务队列，任务将异步执行。
    
    **任务类型**:
    - `question_generation`: 题目生成
    - `image_generation`: 图片生成
    - `audio_generation`: 语音生成
    - `answer_analysis`: 答题分析
    
    **示例请求**:
    ```json
    {
        "task_id": "task_123",
        "task_type": "image_generation",
        "payload": {
            "text": "一只可爱的小猫",
            "width": 1328,
            "height": 1328,
            "optimize_prompt": true
        },
        "priority": 0,
        "timeout": 300
    }
    ```
    """
    try:
        response = await task_manager.submit_task(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """
    获取任务状态
    
    根据任务ID查询任务的执行状态和结果。
    """
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task


@router.post("/{task_id}/cancel")
async def cancel_task(task_id: str):
    """
    取消任务
    
    取消一个待处理的任务。只能取消状态为 `pending` 的任务。
    """
    success = task_manager.cancel_task(task_id)
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
    tasks = task_manager.list_tasks(status=status, limit=limit)
    return tasks

