import os
import dotenv
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

##################################
from common.database import init_database
from common.settings import envs
from common.logger import *

from admin import admin_app
from admin.services.manager import init_super_manager
from student import student_app

dotenv.load_dotenv()
os.environ["NO_PROXY"] = "*"


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info(">" * 10 + "服务启动" + "<" * 10)
    # 初始化数据库
    await init_database()

    # 初始化运行目录
    if not os.path.exists(envs.TMP_DIR):
        os.makedirs(envs.TMP_DIR)
    # 初始化运行目录
    if not os.path.exists(envs.LOG_DIR):
        os.makedirs(envs.LOG_DIR)

    # 初始化超级管理员
    if envs.ADMIN_USERNAME and envs.ADMIN_PASSWORD:
        await init_super_manager()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


app.mount("/admin_api", admin_app)
app.mount("/student_api", student_app)


if __name__ == "__main__":
    uvicorn.run("main:app", port=7890, reload=True, log_level="info")
