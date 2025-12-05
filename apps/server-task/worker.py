"""RQ Worker 启动脚本"""
import os
import sys
import dotenv
from rq import Worker, Queue, Connection
from loguru import logger

# 加载环境变量（必须在导入其他模块之前）
dotenv.load_dotenv()

from core.redis_client import get_redis_connection
from core.logger import logger  # 导入时会自动初始化


def start_worker(queue_name: str = "default"):
    """
    启动 RQ Worker
    
    Args:
        queue_name: 队列名称，默认为 "default"
    """
    logger.info(f"启动 RQ Worker，监听队列: {queue_name}")
    
    # 获取 Redis 连接
    redis_conn = get_redis_connection()
    
    # 创建队列
    queue = Queue(queue_name, connection=redis_conn)
    
    # 启动 Worker
    with Connection(redis_conn):
        worker = Worker([queue], name=f"worker-{queue_name}")
        logger.info(f"Worker 已启动: {worker.name}")
        worker.work()


if __name__ == "__main__":
    # 从环境变量或命令行参数获取队列名称
    queue_name = os.getenv("RQ_QUEUE_NAME", "default")
    
    if len(sys.argv) > 1:
        queue_name = sys.argv[1]
    
    logger.info(f"准备启动 Worker，队列: {queue_name}")
    start_worker(queue_name=queue_name)

