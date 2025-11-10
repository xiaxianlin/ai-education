from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from shared.services.task import TaskService
from common.database import Database
from typing import Optional

task_router = APIRouter(prefix="/task")


@task_router.get("/{task_id}")
async def get_task(task_id: int, db: AsyncSession = Database):
    """获取任务详情"""
    task = await TaskService.get_task(db, task_id)
    if not task:
        return {"error": "任务不存在"}
    return {
        "id": task.id,
        "task_type": task.task_type,
        "task_name": task.task_name,
        "status": task.status,
        "progress": task.progress,
        "handler_module": task.handler_module,
        "handler_function": task.handler_function,
        "params": task.params,
        "result": task.result,
        "error_message": task.error_message,
        "start_time": task.start_time,
        "end_time": task.end_time,
        "create_time": task.create_time,
        "update_time": task.update_time,
    }


@task_router.get("/")
async def list_tasks(
    task_type: Optional[str] = Query(None, description="任务类型"),
    status: Optional[str] = Query(None, description="任务状态"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Database,
):
    """查询任务列表"""
    tasks, total = await TaskService.list_tasks(
        db=db,
        task_type=task_type,
        status=status,
        page=page,
        size=size,
    )
    return {
        "items": [
            {
                "id": task.id,
                "task_type": task.task_type,
                "task_name": task.task_name,
                "status": task.status,
                "progress": task.progress,
                "start_time": task.start_time,
                "end_time": task.end_time,
                "create_time": task.create_time,
            }
            for task in tasks
        ],
        "total": total,
        "page": page,
        "size": size,
    }

