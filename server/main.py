import os
import uuid
import dotenv
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import select

##################################
from core import settings, get_logger, init_logger
from store.database import init_db, AsyncSessionLocal
from store.database.models import Manager
from util import encrypt

from route.user import user_app
from route.admin import admin_app

dotenv.load_dotenv()
os.environ["NO_PROXY"] = "*"

logger = get_logger("Main")


async def init_run_enviroment():
    if not os.path.exists(settings.RUNTIME_DIR):
        logger.info(f"创建运行目录：{settings.RUNTIME_DIR}")
        os.makedirs(settings.RUNTIME_DIR)

    init_logger()

    if settings.ADMIN_USERNAME and settings.ADMIN_PASSWORD:
        async with AsyncSessionLocal() as db:
            manager = await db.scalar(
                select(Manager).where(Manager.username == settings.ADMIN_USERNAME),
            )
            if not manager:
                logger.info(f"创建初始管理员：{settings.ADMIN_USERNAME}")
                manager = Manager(
                    id=uuid.uuid4(),
                    username=settings.ADMIN_USERNAME,
                    password=encrypt.hash(settings.ADMIN_PASSWORD),
                    type=0,
                    status=1,
                )
                db.add(manager)
                await db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info(">" * 10 + "服务启动" + "<" * 10)
    await init_db()
    await init_run_enviroment()
    
    # 启动后台任务队列
    from core.task_queue import task_queue
    await task_queue.start()
    logger.info("Background task queue started")
    
    yield
    
    # 关闭后台任务队列
    await task_queue.stop()
    logger.info("Background task queue stopped")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


app.mount("/api/user", user_app)
app.mount("/api/admin", admin_app)


if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True, log_level="info")
