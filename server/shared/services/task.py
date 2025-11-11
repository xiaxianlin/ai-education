import json
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from common.database import Task
from utils.time import now
from loguru import logger


class TaskService:
    """优化的任务服务类"""

    @staticmethod
    async def create_task(
        db: AsyncSession,
        task_type: str,
        task_name: str,
        params: Dict[str, Any],
        handler_module: str,
        handler_function: str,
        priority: int = 5,  # 优先级(1-10, 10最高)
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
        logger.info(f"创建任务: {task.id} - {task_name} (优先级: {priority})")
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
            logger.warning(f"任务不存在: {task_id}")
            return None

        task.status = status
        task.update_time = now()

        if progress is not None:
            task.progress = min(100, max(0, progress))

        if status == "running" and not task.start_time:
            task.start_time = now()

        if status in ["completed", "failed", "cancelled"]:
            task.end_time = now()

        if error_message:
            task.error_message = error_message[:1000]  # 限制长度,防止超长

        try:
            await db.commit()
            await db.refresh(task)
            return task
        except Exception as e:
            logger.error(f"更新任务状态失败: {task_id} - {e}")
            await db.rollback()  # 添加回滚
            raise

    @staticmethod
    async def update_task_result(
        db: AsyncSession,
        task_id: int,
        result: Dict[str, Any],
    ) -> Optional[Task]:
        """更新任务结果"""
        task = await TaskService.get_task(db, task_id)
        if not task:
            logger.warning(f"任务不存在: {task_id}")
            return None

        task.result = json.dumps(result, ensure_ascii=False)
        task.update_time = now()

        try:
            await db.commit()
            await db.refresh(task)
            return task
        except Exception as e:
            logger.error(f"更新任务结果失败: {task_id} - {e}")
            await db.rollback()
            raise

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

        try:
            await db.commit()
            await db.refresh(task)
            return task
        except Exception as e:
            logger.error(f"更新任务进度失败: {task_id} - {e}")
            await db.rollback()
            return None

    @staticmethod
    async def list_tasks(
        db: AsyncSession,
        task_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        size: int = 20,
    ) -> Tuple[List[Task], int]:
        """查询任务列表"""
        # 构建查询条件
        conditions = []
        if task_type:
            conditions.append(Task.task_type == task_type)
        if status:
            conditions.append(Task.status == status)

        # ✅ 修复: 使用 func.count() 替代 len(all())
        count_query = select(func.count(Task.id))
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total = await db.scalar(count_query) or 0

        # 分页查询
        query = select(Task)
        if conditions:
            query = query.where(and_(*conditions))

        query = query.order_by(desc(Task.create_time)).offset((page - 1) * size).limit(size)
        result = await db.execute(query)
        tasks = list(result.scalars().all())

        return tasks, total

    @staticmethod
    async def get_pending_tasks(
        db: AsyncSession,
        limit: int = 10,
        priority_order: bool = True  # 是否按优先级排序
    ) -> List[Task]:
        """获取待执行的任务"""
        query = (
            select(Task)
            .where(Task.status == "pending")
        )

        # 暂时按创建时间排序
        query = query.order_by(Task.create_time)

        query = query.limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def recover_stuck_tasks(
        db: AsyncSession,
        timeout_seconds: int = 3600  # 1小时
    ) -> int:
        """
        恢复卡住的任务

        将运行时间超过timeout_seconds且状态为running的任务标记为失败
        适用于服务器异常重启等场景
        """
        current_time = now()
        timeout_threshold = current_time - timeout_seconds

        # 查找卡住的任务
        result = await db.execute(
            select(Task).where(
                and_(
                    Task.status == "running",
                    Task.start_time.isnot(None),
                    Task.start_time < timeout_threshold
                )
            )
        )
        stuck_tasks = list(result.scalars().all())

        recovered_count = 0
        for task in stuck_tasks:
            logger.warning(
                f"发现卡住的任务: {task.id} - {task.task_name} "
                f"(运行时间: {current_time - task.start_time}秒)"
            )
            task.status = "failed"
            task.error_message = f"任务超时(超过{timeout_seconds}秒未完成)"
            task.end_time = current_time
            task.update_time = current_time
            recovered_count += 1

        if recovered_count > 0:
            await db.commit()
            logger.info(f"已恢复 {recovered_count} 个卡住的任务")

        return recovered_count

    @staticmethod
    async def retry_failed_task(
        db: AsyncSession,
        task_id: int
    ) -> Optional[Task]:
        """
        重试失败的任务

        将失败的任务重置为pending状态,清空错误信息
        """
        task = await TaskService.get_task(db, task_id)
        if not task:
            return None

        if task.status != "failed":
            logger.warning(f"任务 {task_id} 状态不是failed,无法重试")
            return None

        logger.info(f"重试任务: {task_id} - {task.task_name}")
        task.status = "pending"
        task.progress = 0
        task.error_message = None
        task.start_time = None
        task.end_time = None
        task.update_time = now()

        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def cancel_task(
        db: AsyncSession,
        task_id: int
    ) -> Optional[Task]:
        """
        取消任务

        将pending或running状态的任务取消
        注意: 对于正在运行的任务,只是标记为cancelled,实际执行可能无法立即停止
        """
        task = await TaskService.get_task(db, task_id)
        if not task:
            return None

        if task.status not in ["pending", "running"]:
            logger.warning(f"任务 {task_id} 状态为 {task.status},无法取消")
            return None

        logger.info(f"取消任务: {task_id} - {task.task_name}")
        task.status = "cancelled"
        task.error_message = "任务已被用户取消"
        task.end_time = now()
        task.update_time = now()

        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def get_task_statistics(
        db: AsyncSession,
        task_type: Optional[str] = None,
        days: int = 7
    ) -> Dict[str, Any]:
        """
        获取任务统计信息

        返回指定天数内的任务统计
        """
        start_time = now() - (days * 86400)

        conditions = [Task.create_time >= start_time]
        if task_type:
            conditions.append(Task.task_type == task_type)

        # 总任务数
        total_count = await db.scalar(
            select(func.count(Task.id)).where(and_(*conditions))
        ) or 0

        # 各状态任务数
        status_counts = {}
        for status in ["pending", "running", "completed", "failed", "cancelled"]:
            count = await db.scalar(
                select(func.count(Task.id)).where(
                    and_(*conditions, Task.status == status)
                )
            ) or 0
            status_counts[status] = count

        # 平均执行时间(仅completed任务)
        completed_tasks_result = await db.execute(
            select(Task).where(
                and_(
                    *conditions,
                    Task.status == "completed",
                    Task.start_time.isnot(None),
                    Task.end_time.isnot(None)
                )
            )
        )
        completed_tasks = list(completed_tasks_result.scalars().all())

        avg_duration = 0
        if completed_tasks:
            durations = [task.end_time - task.start_time for task in completed_tasks]
            avg_duration = sum(durations) / len(durations)

        return {
            "total_count": total_count,
            "status_counts": status_counts,
            "average_duration_seconds": avg_duration,
            "success_rate": (
                status_counts["completed"] / total_count * 100
                if total_count > 0 else 0
            ),
            "days": days,
        }

