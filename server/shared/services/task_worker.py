"""任务工作进程 - 在新进程中执行任务"""
import asyncio
import sys
import json
import os
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
        module = __import__(handler_module, fromlist=[handler_function])
        handler = getattr(module, handler_function)

        # 执行任务
        logger.info(f"开始执行任务: {task_id} - {handler_module}.{handler_function}")
        result = await handler(db, params)

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

