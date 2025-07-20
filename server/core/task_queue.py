import asyncio
import logging
from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass
from enum import Enum
from core import get_logger


logger = get_logger("TaskQueue")


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Task:
    id: str
    name: str
    func: Callable
    args: tuple
    kwargs: dict
    status: TaskStatus = TaskStatus.PENDING
    result: Any = None
    error: Optional[str] = None
    created_at: float = None
    started_at: Optional[float] = None
    completed_at: Optional[float] = None

    def __post_init__(self):
        if self.created_at is None:
            import time
            self.created_at = time.time()


class BackgroundTaskQueue:
    """简单的后台任务队列实现"""
    
    def __init__(self, max_workers: int = 3):
        self.max_workers = max_workers
        self.tasks: Dict[str, Task] = {}
        self.queue = asyncio.Queue()
        self.workers = []
        self.running = False
    
    async def start(self):
        """启动任务队列"""
        if self.running:
            return
            
        self.running = True
        self.workers = []
        
        for i in range(self.max_workers):
            worker = asyncio.create_task(self._worker(f"worker-{i}"))
            self.workers.append(worker)
        
        logger.info(f"Task queue started with {self.max_workers} workers")
    
    async def stop(self):
        """停止任务队列"""
        self.running = False
        
        # 取消所有worker
        for worker in self.workers:
            worker.cancel()
        
        # 等待worker结束
        await asyncio.gather(*self.workers, return_exceptions=True)
        logger.info("Task queue stopped")
    
    async def add_task(self, task_id: str, name: str, func: Callable, *args, **kwargs) -> str:
        """添加任务到队列"""
        task = Task(
            id=task_id,
            name=name,
            func=func,
            args=args,
            kwargs=kwargs
        )
        
        self.tasks[task_id] = task
        await self.queue.put(task)
        
        logger.info(f"Task {task_id} ({name}) added to queue")
        return task_id
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取任务状态"""
        task = self.tasks.get(task_id)
        if not task:
            return None
        
        return {
            "id": task.id,
            "name": task.name,
            "status": task.status,
            "result": task.result,
            "error": task.error,
            "created_at": task.created_at,
            "started_at": task.started_at,
            "completed_at": task.completed_at
        }
    
    async def _worker(self, worker_name: str):
        """工作进程"""
        logger.info(f"Worker {worker_name} started")
        
        while self.running:
            try:
                # 等待任务，超时1秒
                task = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                
                logger.info(f"Worker {worker_name} processing task {task.id}")
                
                # 更新任务状态
                import time
                task.status = TaskStatus.RUNNING
                task.started_at = time.time()
                
                try:
                    # 执行任务
                    if asyncio.iscoroutinefunction(task.func):
                        result = await task.func(*task.args, **task.kwargs)
                    else:
                        result = task.func(*task.args, **task.kwargs)
                    
                    # 任务完成
                    task.status = TaskStatus.COMPLETED
                    task.result = result
                    task.completed_at = time.time()
                    
                    logger.info(f"Task {task.id} completed successfully")
                    
                except Exception as e:
                    # 任务失败
                    task.status = TaskStatus.FAILED
                    task.error = str(e)
                    task.completed_at = time.time()
                    
                    logger.error(f"Task {task.id} failed: {str(e)}")
                
                finally:
                    self.queue.task_done()
                    
            except asyncio.TimeoutError:
                # 超时继续循环
                continue
            except asyncio.CancelledError:
                logger.info(f"Worker {worker_name} cancelled")
                break
            except Exception as e:
                logger.error(f"Worker {worker_name} error: {str(e)}")
        
        logger.info(f"Worker {worker_name} stopped")


# 全局任务队列实例
task_queue = BackgroundTaskQueue()