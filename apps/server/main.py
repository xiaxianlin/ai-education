import os
from contextlib import asynccontextmanager
from pathlib import Path

import dotenv
import uvicorn
from admin import admin_app
from admin.auth import init_super_manager
from admin.practice import init_system_practices
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

##################################
from shared.core.database import init_database
from shared.core.logger import logger
from shared.core.settings import envs
from student import student_app

dotenv.load_dotenv()
os.environ["NO_PROXY"] = "*"


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info(">" * 10 + "服务启动" + "<" * 10)
    # 初始化数据库
    await init_database()
    # 初始化运行目录
    Path(envs.TMP_DIR).mkdir(parents=True, exist_ok=True)
    # 初始化运行目录
    Path(envs.LOG_DIR).mkdir(parents=True, exist_ok=True)
    # 初始化超级管理员
    if envs.ADMIN_USERNAME and envs.ADMIN_PASSWORD:
        await init_super_manager()
    # 初始化系统练习
    await init_system_practices()

    yield


app = FastAPI(lifespan=lifespan)

# 配置CORS - 从环境变量读取允许的域名
logger.info("服务启动端口: 7890")
cors_origins = envs.CORS_ORIGINS.split(",") if envs.CORS_ORIGINS != "*" else ["*"]
logger.info(f"CORS允许的域名: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


app.mount("/api/admin", admin_app)
app.mount("/api/student", student_app)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        port=7890,
        reload=True,
        log_level="info",
        reload_dirs=["admin", "student", "shared", "generation"],
    )
