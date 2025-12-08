# -*- coding: utf-8 -*-
"""RQ Worker 启动脚本

用于独立启动 RQ Worker 进程，处理异步任务。

使用方法:
    python -m task.worker                    # 使用默认队列
    python -m task.worker --queue default    # 指定队列名称
    python -m task.worker --queue high-priority --burst  # 使用突发模式
"""

import os
import sys
import signal
import argparse
import dotenv
from rq import Worker, Queue, Connection
from loguru import logger

from shared.core.settings import envs
from task.core.redis import get_redis_connection

# 全局变量，用于优雅关闭
worker_instance = None


def signal_handler(signum, frame):
    """信号处理器，用于优雅关闭 Worker"""
    global worker_instance
    logger.info(f"收到信号 {signum}，正在关闭 Worker...")
    if worker_instance:
        worker_instance.shutdown()
    sys.exit(0)


def start_worker(queue_name: str = None, burst: bool = False):
    """
    启动 RQ Worker
    
    Args:
        queue_name: 队列名称，如果为 None 则使用配置中的默认值
        burst: 是否使用突发模式（处理完所有任务后退出）
    """
    global worker_instance
    
    # 加载环境变量
    dotenv.load_dotenv()
    
    # 初始化运行目录
    os.makedirs(envs.LOG_DIR, exist_ok=True)
    
    # 确定队列名称
    if queue_name is None:
        queue_name = envs.TASK_QUEUE_NAME
    
    logger.info("=" * 50)
    logger.info("启动 RQ Worker")
    logger.info(f"队列名称: {queue_name}")
    logger.info(f"Redis 地址: {envs.REDIS_HOST}:{envs.REDIS_PORT}")
    logger.info(f"运行模式: {'突发模式 (处理完任务后退出)' if burst else '持续运行'}")
    logger.info("=" * 50)
    
    try:
        # 获取 Redis 连接
        redis_conn = get_redis_connection()
        
        # 创建队列
        queue = Queue(queue_name, connection=redis_conn)
        
        # 注册信号处理器
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # 启动 Worker
        with Connection(redis_conn):
            worker_instance = Worker(
                [queue],
                name=f"worker-{queue_name}",
                connection=redis_conn,
            )
            logger.info(f"Worker 已启动: {worker_instance.name}")
            logger.info(f"Worker 正在监听队列: {queue_name}")
            
            # 开始工作
            if burst:
                worker_instance.work(burst=True)
                logger.info("突发模式：所有任务处理完成，Worker 退出")
            else:
                worker_instance.work()
                
    except KeyboardInterrupt:
        logger.info("收到中断信号，正在关闭 Worker...")
    except Exception as e:
        logger.error(f"Worker 启动失败: {e}", exc_info=True)
        sys.exit(1)
    finally:
        logger.info("Worker 已关闭")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="启动 RQ Worker 处理异步任务",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python -m task.worker                          # 使用默认队列持续运行
  python -m task.worker --queue default          # 监听 default 队列
  python -m task.worker --queue high-priority    # 监听 high-priority 队列
  python -m task.worker --burst                  # 突发模式，处理完任务后退出
        """
    )
    
    parser.add_argument(
        "--queue",
        type=str,
        default=None,
        help=f"队列名称（默认: {envs.TASK_QUEUE_NAME}）"
    )
    
    parser.add_argument(
        "--burst",
        action="store_true",
        help="突发模式：处理完所有任务后退出（用于测试或一次性处理）"
    )
    
    args = parser.parse_args()
    
    start_worker(queue_name=args.queue, burst=args.burst)


if __name__ == "__main__":
    main()

