import asyncio
import subprocess
import sys
from pathlib import Path
from typing import Dict, Optional
from common.database import AsyncSessionLocal, Task
from shared.services.task import TaskService
from loguru import logger


class TaskExecutor:
    """任务执行器 - 使用新进程执行任务"""

    def __init__(self):
        self.running = False
        self._task_loop_task: Optional[asyncio.Task] = None
        self._running_processes: Dict[int, subprocess.Popen] = {}

        # 获取任务工作脚本路径
        self.worker_script = Path(__file__).parent / "task_worker.py"

    def _start_task_process(self, task: Task):
        """在新进程中启动任务执行"""
        try:
            # task.params 已经是 JSON 字符串，直接使用
            params_json = task.params

            # 构建命令
            python_executable = sys.executable
            cmd = [
                python_executable,
                str(self.worker_script),
                str(task.id),
                task.handler_module,
                task.handler_function,
                params_json,
            ]

            # 启动新进程
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=Path(__file__).parent.parent.parent,
            )

            self._running_processes[task.id] = process
            logger.info(f"启动任务进程: {task.id} - PID: {process.pid}")

            # 异步检查进程状态
            asyncio.create_task(self._monitor_process(task.id, process))

        except Exception as e:
            logger.error(f"启动任务进程失败: {task.id} - {e}", exc_info=True)
            # 如果启动失败，更新任务状态
            asyncio.create_task(self._mark_task_failed(task.id, str(e)))

    async def _monitor_process(self, task_id: int, process: subprocess.Popen):
        """监控进程状态"""
        try:
            # 等待进程完成（非阻塞）
            while process.poll() is None:
                await asyncio.sleep(1)

            # 进程已完成
            return_code = process.returncode

            # 读取输出
            stdout, stderr = process.communicate()
            if stdout:
                logger.debug(f"任务 {task_id} 输出: {stdout.decode('utf-8', errors='ignore')}")
            if stderr:
                logger.warning(
                    f"任务 {task_id} 错误输出: {stderr.decode('utf-8', errors='ignore')}"
                )

            # 清理进程记录
            if task_id in self._running_processes:
                del self._running_processes[task_id]

            if return_code != 0:
                logger.error(f"任务进程异常退出: {task_id}, 返回码: {return_code}")
                # 如果进程异常退出，检查任务状态，如果还是 running 则标记为失败
                db = AsyncSessionLocal()
                try:
                    task = await TaskService.get_task(db, task_id)
                    if task and task.status == "running":
                        error_msg = (
                            stderr.decode("utf-8", errors="ignore")
                            if stderr
                            else f"进程异常退出，返回码: {return_code}"
                        )
                        await TaskService.update_task_status(
                            db, task_id, "failed", error_message=error_msg[:500]
                        )
                finally:
                    await db.close()

        except Exception as e:
            logger.error(f"监控任务进程失败: {task_id} - {e}", exc_info=True)

    async def _mark_task_failed(self, task_id: int, error_message: str):
        """标记任务为失败"""
        db = AsyncSessionLocal()
        try:
            await TaskService.update_task_status(db, task_id, "failed", error_message=error_message)
        finally:
            await db.close()

    async def _task_loop(self):
        """任务循环"""
        logger.info("任务执行器启动")
        while self.running:
            try:
                db = AsyncSessionLocal()
                try:
                    # 获取待执行的任务
                    pending_tasks = await TaskService.get_pending_tasks(db, limit=5)
                    for task in pending_tasks:
                        # 立即将任务标记为运行中，避免重复执行
                        await TaskService.update_task_status(db, task.id, "running", progress=0)
                        # 在新进程中启动任务
                        self._start_task_process(task)
                finally:
                    await db.close()

                # 等待一段时间再检查
                await asyncio.sleep(2)
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
        if self._task_loop_task:
            self._task_loop_task.cancel()
            try:
                await self._task_loop_task
            except asyncio.CancelledError:
                pass

        # 等待所有运行中的进程完成（可选，也可以直接终止）
        # 这里我们选择等待，让任务自然完成
        if self._running_processes:
            logger.info(f"等待 {len(self._running_processes)} 个任务进程完成...")
            # 等待最多30秒
            for _ in range(30):
                if not self._running_processes:
                    break
                await asyncio.sleep(1)

        logger.info("任务执行器已停止")


# 全局任务执行器实例
task_executor = TaskExecutor()
