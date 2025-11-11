from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from shared.services.task import TaskService
from shared.services.task_executor import task_executor
from common.database import Database
from typing import Optional

task_router = APIRouter(prefix="/task")


@task_router.get("/{task_id}")
async def get_task(task_id: int, db: AsyncSession = Database):
    """获取任务详情"""
    task = await TaskService.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
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


@task_router.post("/{task_id}/retry")
async def retry_task(task_id: int, db: AsyncSession = Database):
    """
    ✅ 新增: 重试失败的任务
    """
    task = await TaskService.retry_failed_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在或无法重试")

    return {
        "message": "任务已重置为待执行状态",
        "task_id": task.id,
        "status": task.status,
    }


@task_router.post("/{task_id}/cancel")
async def cancel_task(task_id: int, db: AsyncSession = Database):
    """
    ✅ 新增: 取消任务
    """
    task = await TaskService.cancel_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在或无法取消")

    return {
        "message": "任务已取消",
        "task_id": task.id,
        "status": task.status,
    }


@task_router.get("/statistics/summary")
async def get_task_statistics(
    task_type: Optional[str] = Query(None, description="任务类型"),
    days: int = Query(7, ge=1, le=90, description="统计天数"),
    db: AsyncSession = Database,
):
    """
    ✅ 新增: 获取任务统计信息
    """
    stats = await TaskService.get_task_statistics(db, task_type, days)
    return stats


@task_router.get("/executor/status")
async def get_executor_status():
    """
    ✅ 新增: 获取任务执行器状态
    """
    stats = task_executor.get_stats()
    return {
        "running": task_executor.running,
        "max_concurrent_tasks": task_executor.config.max_concurrent_tasks,
        "current_running_tasks": stats["running_tasks"],
        "statistics": {
            "total_executed": stats["total_executed"],
            "total_completed": stats["total_completed"],
            "total_failed": stats["total_failed"],
            "total_timeout": stats["total_timeout"],
        },
    }

