"""Task Service 主应用"""

import os
import sys
import dotenv
import uvicorn
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from rq import Worker, Queue, Connection

from core.logger import logger
from core.settings import envs
from core.redis import get_redis_connection
from routes import task

dotenv.load_dotenv()


# Worker 线程引用，用于在应用关闭时停止 Worker
worker_thread = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global worker_thread

    logger.info(">" * 10 + "Task Service 启动" + "<" * 10)

    # 初始化运行目录
    os.makedirs(envs.LOG_DIR, exist_ok=True)

    # 如果启用了 Worker，在后台启动
    if envs.ENABLE_WORKER:
        logger.info(f"启动 RQ Worker，队列: {envs.RQ_QUEUE_NAME}")
        worker_thread = threading.Thread(
            target=start_worker,
            args=(envs.RQ_QUEUE_NAME,),
            daemon=True,  # 设置为守护线程，主进程退出时自动退出
            name="RQ-Worker",
        )
        worker_thread.start()
        logger.info("RQ Worker 已在后台启动")

    yield

    logger.info("Task Service 关闭")


app = FastAPI(
    title="AI Education Task Service",
    description="AI 生成任务处理服务",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(task.router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "AI Education Task Service",
        "version": "0.1.0",
        "status": "running",
    }


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
    # 启动服务
    uvicorn.run(
        "main:app",
        host=envs.SERVER_HOST,
        port=envs.SERVER_PORT,
        reload=envs.RUN_ENV == "development",
        log_level="info",
    )
