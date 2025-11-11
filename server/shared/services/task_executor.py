"""
优化的任务执行器
主要改进：
1. ✅ 优化数据库会话管理(单一session)
2. ✅ 添加任务超时机制
3. ✅ 改进错误处理和回滚
4. ✅ 添加可配置的并发限制
5. ✅ 添加任务执行指标统计
6. ✅ 优化停止逻辑
7. ✅ 添加卡住任务自动恢复
"""

import asyncio
import json
import importlib
import os
import traceback
from typing import Dict, Optional
from dataclasses import dataclass
from core.database import AsyncSessionLocal, Task
from shared.services.task import TaskService
from loguru import logger


@dataclass
class TaskExecutorConfig:
    """任务执行器配置"""
    max_concurrent_tasks: int = 10  # 最大并发任务数
    task_timeout_seconds: int = 3600  # 任务超时时间(秒)
    poll_interval_seconds: float = 1.0  # 轮询间隔
    stuck_task_check_interval: int = 300  # 检查卡住任务的间隔(秒)
    stuck_task_timeout: int = 3600  # 卡住任务的超时时间(秒)


class TaskExecutor:
    """
    优化的任务执行器 - 使用协程执行任务

    主要改进:
    - 单一数据库会话管理
    - 任务超时控制
    - 改进的错误处理
    - 卡住任务自动恢复
    - 执行指标统计
    """

    def __init__(self, config: Optional[TaskExecutorConfig] = None):
        self.config = config or TaskExecutorConfig()
        self.running = False
        self._task_loop_task: Optional[asyncio.Task] = None
        self._running_task_coroutines: Dict[int, asyncio.Task] = {}
        self._semaphore = asyncio.Semaphore(self.config.max_concurrent_tasks)

        # ✅ 新增: 执行统计
        self._stats = {
            "total_executed": 0,
            "total_completed": 0,
            "total_failed": 0,
            "total_timeout": 0,
        }

    async def _execute_task(self, task: Task):
        """
        在协程中执行任务

        改进:
        1. 使用单一数据库会话
        2. 添加超时控制
        3. 改进错误处理
        """
        task_id = task.id

        # 使用信号量控制并发
        async with self._semaphore:
            # ✅ 使用单一数据库会话
            db = AsyncSessionLocal()
            try:
                # 统计
                self._stats["total_executed"] += 1

                # 更新任务状态为运行中
                await TaskService.update_task_status(db, task_id, "running", progress=0)

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

                # ✅ 添加超时控制
                try:
                    result = await asyncio.wait_for(
                        handler(db, params_with_task_id),
                        timeout=self.config.task_timeout_seconds
                    )
                except asyncio.TimeoutError:
                    self._stats["total_timeout"] += 1
                    raise TimeoutError(
                        f"任务执行超时(超过{self.config.task_timeout_seconds}秒)"
                    )

                # 更新任务结果为完成
                await TaskService.update_task_result(db, task_id, result)
                await TaskService.update_task_status(db, task_id, "completed", progress=100)

                self._stats["total_completed"] += 1
                logger.info(f"任务完成: {task_id}")

            except asyncio.CancelledError:
                # 任务被取消
                logger.warning(f"任务被取消: {task_id}")
                try:
                    await TaskService.update_task_status(
                        db, task_id, "cancelled", error_message="任务被取消"
                    )
                except Exception as e:
                    logger.error(f"更新任务取消状态失败: {e}")
                raise

            except Exception as e:
                # 任务执行失败
                error_msg = str(e)
                
                # ✅ 使用 traceback 打印完整的异常堆栈信息
                tb_str = traceback.format_exc()
                logger.error(
                    f"任务执行失败: {task_id} - {error_msg}\n"
                    f"完整异常堆栈:\n{tb_str}"
                )

                self._stats["total_failed"] += 1

                # ✅ 改进错误处理: 使用try-except确保状态更新不会失败
                try:
                    # 将完整的异常信息保存到错误消息中（截断到合理长度）
                    full_error_msg = f"{error_msg}\n\n堆栈跟踪:\n{tb_str}"
                    await TaskService.update_task_status(
                        db, task_id, "failed", error_message=full_error_msg[:2000]  # 增加到2000字符
                    )
                except Exception as update_error:
                    logger.error(f"更新任务失败状态失败: {task_id} - {update_error}")
                    # 尝试回滚
                    try:
                        await db.rollback()
                    except:
                        pass

            finally:
                # ✅ 确保会话关闭
                try:
                    await db.close()
                except Exception as e:
                    logger.error(f"关闭数据库会话失败: {e}")

                # 从运行中的任务集合中移除
                if task_id in self._running_task_coroutines:
                    del self._running_task_coroutines[task_id]

    async def _recover_stuck_tasks(self):
        """
        ✅ 新增: 定期检查并恢复卡住的任务
        """
        db = AsyncSessionLocal()
        try:
            recovered = await TaskService.recover_stuck_tasks(
                db, timeout_seconds=self.config.stuck_task_timeout
            )
            if recovered > 0:
                logger.info(f"已恢复 {recovered} 个卡住的任务")
        except Exception as e:
            logger.error(f"恢复卡住任务失败: {e}")
        finally:
            await db.close()

    async def _task_loop(self):
        """任务循环"""
        logger.info("任务执行器启动（协程模式）")

        # ✅ 启动时先恢复一次卡住的任务
        await self._recover_stuck_tasks()

        last_stuck_check_time = asyncio.get_event_loop().time()

        while self.running:
            try:
                current_time = asyncio.get_event_loop().time()

                # ✅ 定期检查卡住的任务
                if current_time - last_stuck_check_time >= self.config.stuck_task_check_interval:
                    await self._recover_stuck_tasks()
                    last_stuck_check_time = current_time

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
                available_slots = self.config.max_concurrent_tasks - len(self._running_task_coroutines)

                if available_slots > 0:
                    db = AsyncSessionLocal()
                    try:
                        # 获取待执行的任务
                        pending_tasks = await TaskService.get_pending_tasks(
                            db, limit=available_slots, priority_order=True
                        )

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
                await asyncio.sleep(self.config.poll_interval_seconds)

            except Exception as e:
                logger.error(f"任务循环错误: {e}", exc_info=True)
                await asyncio.sleep(5)

    async def start(self):
        """启动任务执行器"""
        if self.running:
            logger.warning("任务执行器已在运行")
            return

        logger.info(
            f"启动任务执行器 - "
            f"最大并发: {self.config.max_concurrent_tasks}, "
            f"任务超时: {self.config.task_timeout_seconds}秒"
        )

        self.running = True
        self._task_loop_task = asyncio.create_task(self._task_loop())
        logger.info("任务执行器已启动")

    async def stop(self, timeout: float = 60.0):
        """
        停止任务执行器

        Args:
            timeout: 等待运行中任务完成的超时时间(秒)
        """
        if not self.running:
            return

        logger.info("正在停止任务执行器...")
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

            try:
                running_coros = list(self._running_task_coroutines.values())
                await asyncio.wait_for(
                    asyncio.gather(*running_coros, return_exceptions=True),
                    timeout=timeout
                )
                logger.info("所有任务已完成")

            except asyncio.TimeoutError:
                remaining = len(self._running_task_coroutines)
                logger.warning(f"等待任务超时，仍有 {remaining} 个任务未完成，将取消这些任务")

                # 取消未完成的任务
                for task_id, coro in list(self._running_task_coroutines.items()):
                    if not coro.done():
                        coro.cancel()
                        logger.warning(f"取消任务: {task_id}")

                # 再等待一小段时间让取消生效
                try:
                    await asyncio.wait_for(
                        asyncio.gather(*self._running_task_coroutines.values(), return_exceptions=True),
                        timeout=5.0
                    )
                except asyncio.TimeoutError:
                    logger.error("部分任务取消失败")

            except Exception as e:
                logger.error(f"等待任务完成时出错: {e}")

        # 打印统计信息
        logger.info(
            f"任务执行器统计 - "
            f"总执行: {self._stats['total_executed']}, "
            f"成功: {self._stats['total_completed']}, "
            f"失败: {self._stats['total_failed']}, "
            f"超时: {self._stats['total_timeout']}"
        )

        logger.info("任务执行器已停止")

    def get_stats(self) -> Dict[str, int]:
        """获取执行统计"""
        return {
            **self._stats,
            "running_tasks": len(self._running_task_coroutines),
        }


# 全局任务执行器实例
# ✅ 可以从环境变量读取配置
task_executor_config = TaskExecutorConfig(
    max_concurrent_tasks=int(os.getenv("TASK_MAX_CONCURRENT", "10")),
    task_timeout_seconds=int(os.getenv("TASK_TIMEOUT_SECONDS", "3600")),
    poll_interval_seconds=float(os.getenv("TASK_POLL_INTERVAL", "1.0")),
    stuck_task_check_interval=int(os.getenv("TASK_STUCK_CHECK_INTERVAL", "300")),
    stuck_task_timeout=int(os.getenv("TASK_STUCK_TIMEOUT", "3600")),
)

task_executor = TaskExecutor(config=task_executor_config)
