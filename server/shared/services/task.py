import json
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from common.database import Task
from utils.time import now
from loguru import logger


class TaskService:
    """任务服务类"""

    @staticmethod
    async def create_task(
        db: AsyncSession,
        task_type: str,
        task_name: str,
        params: Dict[str, Any],
        handler_module: str,
        handler_function: str,
    ) -> Task:
        """创建任务"""
        task = Task(
            task_type=task_type,
            task_name=task_name,
            status="pending",
            progress=0,
            handler_module=handler_module,
            handler_function=handler_function,
            params=json.dumps(params, ensure_ascii=False),
            result="{}",
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)
        logger.info(f"创建任务: {task.id} - {task_name}")
        return task

    @staticmethod
    async def get_task(db: AsyncSession, task_id: int) -> Optional[Task]:
        """获取任务"""
        result = await db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_task_status(
        db: AsyncSession,
        task_id: int,
        status: str,
        progress: Optional[int] = None,
        error_message: Optional[str] = None,
    ) -> Optional[Task]:
        """更新任务状态"""
        task = await TaskService.get_task(db, task_id)
        if not task:
            return None

        task.status = status
        task.update_time = now()

        if progress is not None:
            task.progress = progress

        if status == "running" and not task.start_time:
            task.start_time = now()

        if status in ["completed", "failed"]:
            task.end_time = now()

        if error_message:
            task.error_message = error_message

        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def update_task_result(
        db: AsyncSession,
        task_id: int,
        result: Dict[str, Any],
    ) -> Optional[Task]:
        """更新任务结果"""
        task = await TaskService.get_task(db, task_id)
        if not task:
            return None

        task.result = json.dumps(result, ensure_ascii=False)
        task.update_time = now()
        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def update_task_progress(
        db: AsyncSession,
        task_id: int,
        progress: int,
    ) -> Optional[Task]:
        """更新任务进度"""
        task = await TaskService.get_task(db, task_id)
        if not task:
            return None

        task.progress = min(100, max(0, progress))
        task.update_time = now()
        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def list_tasks(
        db: AsyncSession,
        task_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        size: int = 20,
    ) -> tuple[List[Task], int]:
        """查询任务列表"""
        query = select(Task)

        conditions = []
        if task_type:
            conditions.append(Task.task_type == task_type)
        if status:
            conditions.append(Task.status == status)

        if conditions:
            query = query.where(and_(*conditions))

        # 获取总数
        count_query = select(Task)
        if conditions:
            count_query = count_query.where(and_(*conditions))
        total_result = await db.execute(count_query)
        total = len(total_result.scalars().all())

        # 分页查询
        query = query.order_by(desc(Task.create_time)).offset((page - 1) * size).limit(size)
        result = await db.execute(query)
        tasks = result.scalars().all()

        return tasks, total

    @staticmethod
    async def get_pending_tasks(db: AsyncSession, limit: int = 10) -> List[Task]:
        """获取待执行的任务"""
        result = await db.execute(
            select(Task)
            .where(Task.status == "pending")
            .order_by(Task.create_time)
            .limit(limit)
        )
        return list(result.scalars().all())

