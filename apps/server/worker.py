#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Celery Worker 启动脚本

用于启动 Celery Worker 进程，处理异步任务。

使用方法:
    uv run worker.py                              # 使用默认队列和配置
"""

import os
import sys
import dotenv
from loguru import logger

from shared.core.settings import envs
from shared.worker import celery_app


def start_worker():
    # 加载环境变量
    dotenv.load_dotenv()

    os.makedirs(envs.LOG_DIR, exist_ok=True)

    queue_name = envs.TASK_QUEUE_NAME
    concurrency = envs.TASK_CONCURRENCY
    loglevel = envs.TASK_LOGLEVEL

    logger.info("=" * 50)
    logger.info("启动 Celery Worker")
    logger.info(f"队列名称: {queue_name}")
    logger.info(f"Redis 地址: {envs.REDIS_URL}")
    logger.info(f"日志级别: {loglevel}")
    logger.info(f"并发数: {concurrency}")
    logger.info("=" * 50)

    try:
        celery_app.worker_main(
            [
                "worker",
                f"--queues={queue_name}",
                f"--loglevel={loglevel}",
                "--without-gossip",
                "--without-mingle",
                "--without-heartbeat",
                "--max-tasks-per-child=1000",
                f"--concurrency={str(concurrency)}",
            ]
        )
        logger.info("任务 Worker 已启动")

    except KeyboardInterrupt:
        logger.info("收到中断信号，正在关闭任务 Worker...")
    except Exception as e:
        logger.error(f"任务 Worker 启动失败: {e}", exc_info=True)
        sys.exit(1)
    finally:
        logger.info("任务 Worker 已关闭")


if __name__ == "__main__":
    start_worker()
