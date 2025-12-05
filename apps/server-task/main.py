"""Task Service 主应用"""
import os
import dotenv
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.logger import logger
from core.settings import envs
from routes import task, health

dotenv.load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info(">" * 10 + "Task Service 启动" + "<" * 10)
    
    # 初始化运行目录
    os.makedirs(envs.LOG_DIR, exist_ok=True)
    
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
app.include_router(health.router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "AI Education Task Service",
        "version": "0.1.0",
        "status": "running"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=envs.TASK_SERVER_HOST,
        port=envs.TASK_SERVER_PORT,
        reload=envs.RUN_ENV == "development",
        log_level="info",
    )

