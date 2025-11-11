"""任务工作进程 - 在新进程中执行任务"""
import asyncio
import sys
import json
import os
import importlib
from pathlib import Path
from typing import Dict, Any
import dotenv

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# 加载环境变量
dotenv.load_dotenv()
os.environ["NO_PROXY"] = "*"

from sqlalchemy.ext.asyncio import AsyncSession
from common.database import AsyncSessionLocal
from shared.services.task import TaskService
from loguru import logger
from utils.time import now


async def execute_task_in_process(task_id: int, handler_module: str, handler_function: str, params: Dict[str, Any]):
    """在进程中执行任务"""
    db = AsyncSessionLocal()
    try:
        # 更新任务状态为运行中
        await TaskService.update_task_status(db, task_id, "running", progress=0)

        # 动态导入处理器
        # 使用 importlib 确保正确导入模块
        try:
            module = importlib.import_module(handler_module)
        except ImportError as e:
            logger.error(f"导入模块失败: {handler_module} - {e}")
            raise
        
        # 调试：检查模块属性
        if not hasattr(module, handler_function):
            available_attrs = [attr for attr in dir(module) if not attr.startswith('_')]
            logger.error(f"模块 {handler_module} 中没有找到函数 {handler_function}")
            logger.error(f"可用属性: {available_attrs}")
            raise AttributeError(f"module '{handler_module}' has no attribute '{handler_function}'")
        
        handler = getattr(module, handler_function)

        # 执行任务
        logger.info(f"开始执行任务: {task_id} - {handler_module}.{handler_function}")
        # 将task_id添加到params中，以便handler可以更新进度
        params_with_task_id = {**params, "task_id": task_id}
        result = await handler(db, params_with_task_id)

        # 更新任务结果为完成
        await TaskService.update_task_result(db, task_id, result)
        await TaskService.update_task_status(db, task_id, "completed", progress=100)
        logger.info(f"任务完成: {task_id}")

    except Exception as e:
        error_msg = str(e)
        logger.error(f"任务执行失败: {task_id} - {error_msg}", exc_info=True)
        await TaskService.update_task_status(
            db, task_id, "failed", error_message=error_msg
        )
    finally:
        await db.close()


def main():
    """主函数 - 从命令行参数获取任务信息"""
    if len(sys.argv) < 5:
        print("Usage: task_worker.py <task_id> <handler_module> <handler_function> <params_json>")
        sys.exit(1)

    task_id = int(sys.argv[1])
    handler_module = sys.argv[2]
    handler_function = sys.argv[3]
    params_json = sys.argv[4]

    try:
        params = json.loads(params_json)
    except json.JSONDecodeError as e:
        logger.error(f"解析任务参数失败: {e}")
        sys.exit(1)

    # 运行异步任务
    asyncio.run(execute_task_in_process(task_id, handler_module, handler_function, params))


if __name__ == "__main__":
    main()

