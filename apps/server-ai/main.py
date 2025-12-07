"""AI Service 主应用"""

import os
import dotenv
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from core.logger import logger
from core.settings import envs
from core.exception import (
    http_exception_handler,
    value_error_handler,
    global_exception_handler,
    validation_exception_handler,
)
from routes import image, audio, analysis, question

dotenv.load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info(">" * 10 + "AI Service 启动" + "<" * 10)

    # 初始化运行目录
    os.makedirs(envs.LOG_DIR, exist_ok=True)

    yield

    logger.info("AI Service 关闭")


app = FastAPI(
    title="AI Education AI Service",
    description="AI 服务 - 提供 LLM、图片生成、语音生成、答题分析等 AI 能力",
    version="0.1.0",
    lifespan=lifespan,
    exception_handlers={
        RequestValidationError: validation_exception_handler,
        HTTPException: http_exception_handler,
        ValueError: value_error_handler,
        Exception: global_exception_handler,
    },
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
app.include_router(image.router)
app.include_router(audio.router)
app.include_router(question.router)
app.include_router(analysis.router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "AI Education AI Service",
        "version": "0.1.0",
        "status": "running",
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=envs.AI_SERVER_HOST,
        port=envs.AI_SERVER_PORT,
        reload=envs.RUN_ENV == "development",
        log_level="info",
    )
