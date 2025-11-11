import asyncio
import json
import importlib
from typing import Dict, Optional, Set
from common.database import AsyncSessionLocal, Task
from shared.services.task import TaskService
from loguru import logger


class TaskExecutor:
    """任务执行器 - 使用协程执行任务"""

    def __init__(self):
        self.running = False
        self._task_loop_task: Optional[asyncio.Task] = None
        self._running_task_coroutines: Dict[int, asyncio.Task] = {}  # 正在运行的任务协程
        self._max_concurrent_tasks = 10  # 最大并发任务数
        self._semaphore = asyncio.Semaphore(self._max_concurrent_tasks)  # 使用信号量控制并发

    async def _execute_task(self, task: Task):
        """在协程中执行任务"""
        task_id = task.id
        
        # 使用信号量控制并发
        async with self._semaphore:
            db = AsyncSessionLocal()
            try:
                # 更新任务状态为运行中
                await TaskService.update_task_status(db, task_id, "running", progress=0)
                await db.commit()

                # 解析任务参数
                try:
                    params = json.loads(task.params)
                except json.JSONDecodeError as e:
                    raise ValueError(f"任务参数JSON解析失败: {e}")

                # 动态导入处理器
                try:
                    module = importlib.import_module(task.handler_module)
                except ImportError as e:
                    logger.error(f"导入模块失败: {task.handler_module} - {e}")
                    raise

                # 检查模块属性
                if not hasattr(module, task.handler_function):
                    available_attrs = [attr for attr in dir(module) if not attr.startswith('_')]
                    logger.error(f"模块 {task.handler_module} 中没有找到函数 {task.handler_function}")
                    logger.error(f"可用属性: {available_attrs}")
                    raise AttributeError(
                        f"module '{task.handler_module}' has no attribute '{task.handler_function}'"
                    )

                handler = getattr(module, task.handler_function)

                # 执行任务
                logger.info(f"开始执行任务: {task_id} - {task.handler_module}.{task.handler_function}")
                
                # 将task_id添加到params中，以便handler可以更新进度
                params_with_task_id = {**params, "task_id": task_id}
                
                # 创建新的数据库会话供任务使用
                task_db = AsyncSessionLocal()
                try:
                    result = await handler(task_db, params_with_task_id)
                    
                    # 更新任务结果为完成
                    await TaskService.update_task_result(task_db, task_id, result)
                    await TaskService.update_task_status(task_db, task_id, "completed", progress=100)
                    await task_db.commit()
                    logger.info(f"任务完成: {task_id}")
                finally:
                    await task_db.close()

            except asyncio.CancelledError:
                # 任务被取消
                logger.warning(f"任务被取消: {task_id}")
                try:
                    await TaskService.update_task_status(
                        db, task_id, "failed", error_message="任务被取消"
                    )
                    await db.commit()
                except Exception:
                    pass
                raise
            except Exception as e:
                error_msg = str(e)
                logger.error(f"任务执行失败: {task_id} - {error_msg}", exc_info=True)
                
                # 标记任务为失败
                try:
                    await TaskService.update_task_status(
                        db, task_id, "failed", error_message=error_msg[:500]
                    )
                    await db.commit()
                except Exception as commit_error:
                    logger.error(f"更新任务状态失败: {task_id} - {commit_error}")
            finally:
                await db.close()
                # 从运行中的任务集合中移除
                if task_id in self._running_task_coroutines:
                    del self._running_task_coroutines[task_id]

    async def _task_loop(self):
        """任务循环"""
        logger.info("任务执行器启动（协程模式）")
        while self.running:
            try:
                # 清理已完成的任务
                completed_tasks = [
                    task_id for task_id, coro in self._running_task_coroutines.items()
                    if coro.done()
                ]
                for task_id in completed_tasks:
                    coro = self._running_task_coroutines.pop(task_id, None)
                    if coro and coro.exception():
                        logger.error(f"任务 {task_id} 执行异常: {coro.exception()}")

                # 检查是否还有并发空间
                available_slots = self._max_concurrent_tasks - len(self._running_task_coroutines)
                
                if available_slots > 0:
                    db = AsyncSessionLocal()
                    try:
                        # 获取待执行的任务（限制数量以避免过载）
                        pending_tasks = await TaskService.get_pending_tasks(db, limit=available_slots)
                        for task in pending_tasks:
                            # 检查任务是否已经在运行
                            if task.id not in self._running_task_coroutines:
                                # 在后台协程中执行任务
                                task_coro = asyncio.create_task(self._execute_task(task))
                                self._running_task_coroutines[task.id] = task_coro
                                logger.info(f"启动任务协程: {task.id}")
                    finally:
                        await db.close()

                # 等待一段时间再检查
                await asyncio.sleep(1)
            except Exception as e:
                logger.error(f"任务循环错误: {e}", exc_info=True)
                await asyncio.sleep(5)

    async def start(self):
        """启动任务执行器"""
        if self.running:
            logger.warning("任务执行器已在运行")
            return

        self.running = True
        self._task_loop_task = asyncio.create_task(self._task_loop())
        logger.info("任务执行器已启动")

    async def stop(self):
        """停止任务执行器"""
        if not self.running:
            return

        self.running = False
        
        # 停止任务循环
        if self._task_loop_task:
            self._task_loop_task.cancel()
            try:
                await self._task_loop_task
            except asyncio.CancelledError:
                pass

        # 等待所有运行中的任务完成
        if self._running_task_coroutines:
            logger.info(f"等待 {len(self._running_task_coroutines)} 个任务协程完成...")
            
            # 使用 asyncio.gather 等待所有任务完成，设置超时
            try:
                running_coros = list(self._running_task_coroutines.values())
                await asyncio.wait_for(
                    asyncio.gather(*running_coros, return_exceptions=True),
                    timeout=60.0
                )
            except asyncio.TimeoutError:
                logger.warning(f"等待任务超时，仍有 {len(self._running_task_coroutines)} 个任务未完成")
                # 取消未完成的任务
                for task_id, coro in list(self._running_task_coroutines.items()):
                    if not coro.done():
                        coro.cancel()
                        logger.warning(f"取消任务: {task_id}")
            except Exception as e:
                logger.error(f"等待任务完成时出错: {e}")

        logger.info("任务执行器已停止")


# 全局任务执行器实例
task_executor = TaskExecutor()
