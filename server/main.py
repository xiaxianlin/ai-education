import os
import dotenv
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

##################################
from core.database import init_database
from core.settings import envs
from core.logger import logger

from admin import admin_app
from admin.services.manager import init_super_manager
from shared.services.task_executor import task_executor
from student import student_app

dotenv.load_dotenv()
os.environ["NO_PROXY"] = "*"


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info(">" * 10 + "服务启动" + "<" * 10)
    # 初始化数据库
    await init_database()
    # 初始化运行目录
    os.makedirs(envs.TMP_DIR, exist_ok=True)
    # 初始化运行目录
    os.makedirs(envs.LOG_DIR, exist_ok=True)
    # 初始化超级管理员
    if envs.ADMIN_USERNAME and envs.ADMIN_PASSWORD:
        await init_super_manager()
    
    # 启动任务执行器
    await task_executor.start()
    logger.info("任务执行器已启动")
    
    yield
    
    # 停止任务执行器
    await task_executor.stop()
    logger.info("任务执行器已停止")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


app.mount("/api/admin", admin_app)
app.mount("/api/student", student_app)


if __name__ == "__main__":
    uvicorn.run("main:app", port=7890, reload=True, log_level="info", workers=2)
