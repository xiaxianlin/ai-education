#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Celery Worker 启动脚本

用于启动 Celery Worker 进程，处理异步任务。

使用方法:
    uv run worker.py                # 普通模式启动
    uv run worker.py --reload       # 开发模式，监听文件变化自动重启
"""

import argparse
import os
import sys

import dotenv
from loguru import logger

from shared.core.settings import envs
from shared.worker import celery_app
from shared.worker.celery import init_celery_app


def start_worker():
    """启动 Celery Worker"""
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

    # 初始化 Celery 应用
    init_celery_app()
    logger.info(f"Celery 应用已初始化: broker={envs.REDIS_URL}")

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


def start_worker_with_reload():
    """带热重载的 Worker 启动（开发模式）"""
    try:
        from watchfiles import run_process
    except ImportError:
        logger.error("请安装 watchfiles: uv add watchfiles")
        sys.exit(1)

    watch_path = os.path.dirname(os.path.abspath(__file__))
    logger.info("=" * 50)
    logger.info("🔄 开发模式: 监听文件变化自动重启")
    logger.info(f"监听目录: {watch_path}")
    logger.info("=" * 50)

    run_process(
        watch_path,
        target=start_worker,
        watch_filter=lambda change, path: path.endswith(".py"),
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Celery Worker 启动脚本")
    parser.add_argument(
        "--reload",
        action="store_true",
        help="开发模式，监听文件变化自动重启",
    )
    args = parser.parse_args()

    if args.reload:
        start_worker_with_reload()
    else:
        start_worker()
