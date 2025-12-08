"""RQ 任务队列服务"""

from typing import Optional
from datetime import datetime
from loguru import logger
from rq import Queue, Job
from rq.job import JobStatus

from task.core.redis import get_redis_connection
from task.schema import TaskRequest, TaskResponse, TaskStatus
from task.core.executor import execute_task


class RQService:
    """RQ 任务队列服务"""

    def __init__(self, queue_name: str = "default"):
        """
        初始化 RQ 服务

        Args:
            queue_name: 队列名称，默认为 "default"
        """
        self.redis_conn = get_redis_connection()
        self.queue = Queue(queue_name, connection=self.redis_conn)
        self.queue_name = queue_name

    def submit_task(self, request: TaskRequest) -> str:
        """
        提交任务到 RQ 队列

        Args:
            request: 任务请求

        Returns:
            str: RQ Job ID
        """
        logger.info(f"提交任务到 RQ 队列: task_id={request.task_id}, type={request.task_type}")

        # 将任务请求转换为字典，以便序列化
        job_kwargs = {
            "task_id": request.task_id,
            "task_type": request.task_type.value,
            "payload": request.payload,
        }

        # 提交任务到队列
        job = self.queue.enqueue(
            execute_task,
            **job_kwargs,
            job_id=request.task_id,  # 使用 task_id 作为 job_id
            job_timeout=request.timeout or 300,  # 任务超时时间
            result_ttl=3600,  # 结果保留 1 小时
            failure_ttl=86400,  # 失败任务保留 24 小时
        )

        logger.info(f"任务已提交到 RQ: job_id={job.id}, task_id={request.task_id}")
        return job.id

    def get_task_status(self, task_id: str) -> Optional[TaskResponse]:
        """
        获取任务状态

        Args:
            task_id: 任务ID（也是 RQ Job ID）

        Returns:
            TaskResponse: 任务响应，如果不存在则返回 None
        """
        try:
            job = Job.fetch(task_id, connection=self.redis_conn)

            # 将 RQ Job 状态转换为 TaskStatus
            status = self._convert_job_status(job.get_status())

            # 构建 TaskResponse
            task_response = TaskResponse(
                task_id=task_id,
                status=status,
                result=job.result if job.result else None,
                error=str(job.exc_info) if job.exc_info else None,
                created_at=job.created_at if job.created_at else datetime.now(),
                updated_at=job.ended_at if job.ended_at else datetime.now(),
                processing_time=(
                    job.ended_at.timestamp() - job.started_at.timestamp()
                    if (job.started_at and job.ended_at)
                    else None
                ),
            )

            return task_response

        except Exception as e:
            logger.debug(f"获取任务状态失败: task_id={task_id}, error={e}")
            return None

    def cancel_task(self, task_id: str) -> bool:
        """
        取消任务

        Args:
            task_id: 任务ID

        Returns:
            bool: 是否成功取消
        """
        try:
            job = Job.fetch(task_id, connection=self.redis_conn)

            # 只能取消待处理或正在处理的任务
            if job.get_status() in [JobStatus.QUEUED, JobStatus.STARTED]:
                job.cancel()
                logger.info(f"任务已取消: task_id={task_id}")
                return True
            else:
                logger.warning(f"任务无法取消，当前状态: {job.get_status()}, task_id={task_id}")
                return False

        except Exception as e:
            logger.error(f"取消任务失败: task_id={task_id}, error={e}")
            return False

    def list_tasks(
        self, status: Optional[TaskStatus] = None, limit: int = 100
    ) -> list[TaskResponse]:
        """
        列出任务

        Args:
            status: 任务状态筛选
            limit: 返回数量限制

        Returns:
            list[TaskResponse]: 任务列表
        """
        tasks = []

        try:
            # 获取队列中的所有任务
            job_ids = self.queue.job_ids[:limit]

            for job_id in job_ids:
                try:
                    job = Job.fetch(job_id, connection=self.redis_conn)
                    job_status = self._convert_job_status(job.get_status())

                    # 如果指定了状态筛选，则过滤
                    if status and job_status != status:
                        continue

                    task_response = TaskResponse(
                        task_id=job_id,
                        status=job_status,
                        result=job.result if job.result else None,
                        error=str(job.exc_info) if job.exc_info else None,
                        created_at=job.created_at if job.created_at else datetime.now(),
                        updated_at=job.ended_at if job.ended_at else datetime.now(),
                        processing_time=(
                            job.ended_at.timestamp() - job.started_at.timestamp()
                            if (job.started_at and job.ended_at)
                            else None
                        ),
                    )
                    tasks.append(task_response)
                except Exception as e:
                    logger.debug(f"获取任务失败: job_id={job_id}, error={e}")
                    continue

            # 按创建时间倒序排列
            tasks.sort(key=lambda x: x.created_at, reverse=True)

        except Exception as e:
            logger.error(f"列出任务失败: {e}")

        return tasks[:limit]

    @staticmethod
    def _convert_job_status(job_status: str) -> TaskStatus:
        """将 RQ Job 状态转换为 TaskStatus"""
        status_map = {
            JobStatus.QUEUED: TaskStatus.PENDING,
            JobStatus.STARTED: TaskStatus.PROCESSING,
            JobStatus.FINISHED: TaskStatus.COMPLETED,
            JobStatus.FAILED: TaskStatus.FAILED,
            JobStatus.CANCELED: TaskStatus.CANCELLED,
            JobStatus.DEFERRED: TaskStatus.PENDING,
        }
        return status_map.get(job_status, TaskStatus.PENDING)
