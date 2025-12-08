import logging
import os
from loguru import logger
from shared.core.settings import envs
from sqlalchemy.sql import Select
from sqlalchemy.orm import Query


class InterceptHandler(logging.Handler):
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_globals.get("__name__") == __name__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


# 接管标准库 logging（包括 uvicorn）
intercept_handler = InterceptHandler()
logging.basicConfig(handlers=[intercept_handler], level=logging.INFO, force=True)
for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
    log = logging.getLogger(name)
    log.handlers = [intercept_handler]
    log.propagate = False

if envs.RUN_ENV == "production":
    os.makedirs(envs.LOG_DIR, exist_ok=True)

    # 添加文件输出 - 普通日志
    logger.add(
        f"{envs.LOG_DIR}/app.log",
        rotation="500 MB",  # 单个文件最大500MB
        retention="10 days",  # 保留10天
        compression="zip",  # 压缩旧日志
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
        level="INFO",
        encoding="utf-8",
        enqueue=True,  # 异步写入，提高性能
    )

    # 错误日志单独存储
    logger.add(
        f"{envs.LOG_DIR}/error.log",
        rotation="100 MB",  # 单个文件最大100MB
        retention="30 days",  # 错误日志保留30天
        compression="zip",
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
        level="ERROR",
        encoding="utf-8",
        enqueue=True,
        backtrace=True,  # 记录完整的堆栈跟踪
        diagnose=True,  # 添加诊断信息
    )


def print_sql(query, engine=None):
    """
    打印 SQLAlchemy 生成的 SQL 语句（带实参）

    参数:
        query: 可以是 ORM 的 Query 或 Core 的 Select 对象
        engine: 可选，用于获取方言 dialect；如果不传会尝试 query.session.bind
    """
    # 获取 engine / dialect
    dialect = None
    if engine is not None:
        dialect = engine.dialect
    elif hasattr(query, "session") and query.session is not None:
        dialect = query.session.bind.dialect

    # 处理 ORM 1.x 的 Query 对象
    if isinstance(query, Query):
        stmt = query.statement
    # 处理 ORM 2.x 的 select()
    elif isinstance(query, Select):
        stmt = query
    else:
        raise TypeError("不支持的 query 类型，请传入 ORM Query 或 select()")

    compiled = stmt.compile(dialect=dialect, compile_kwargs={"literal_binds": True})
    logger.info(str(compiled))
