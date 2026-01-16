import logging
import os

from loguru import logger
from shared.core.settings import envs


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

# 配置日志
os.makedirs(envs.LOG_DIR, exist_ok=True)

# 确定日志级别
log_level = logging.INFO
is_production = envs.RUN_ENV == "production"
is_development = envs.RUN_ENV == "development"


# 配置日志文件
if is_production:
    # 生产环境：使用 rotation、retention、compression
    # app.log - 所有应用日志
    logger.add(
        f"{envs.LOG_DIR}/app.log",
        rotation="500 MB",
        retention="10 days",
        compression="zip",
        level=log_level,
        encoding="utf-8",
        enqueue=True,
        filter=lambda record: record["level"].name in ["INFO", "WARNING", "DEBUG"],
    )

    # error.log - 错误日志
    logger.add(
        f"{envs.LOG_DIR}/error.log",
        rotation="100 MB",
        retention="30 days",
        compression="zip",
        level="ERROR",
        encoding="utf-8",
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )


else:
    # 开发环境：每次启动覆盖
    log_files = [
        f"{envs.LOG_DIR}/app.log",
        f"{envs.LOG_DIR}/error.log",
    ]

    # 删除旧的日志文件
    for log_file in log_files:
        if os.path.exists(log_file):
            os.remove(log_file)

    # app.log - 所有应用日志
    logger.add(
        f"{envs.LOG_DIR}/app.log",
        level=log_level,
        encoding="utf-8",
        filter=lambda record: record["level"].name in ["INFO", "WARNING", "DEBUG"],
    )

    # error.log - 错误日志
    logger.add(
        f"{envs.LOG_DIR}/error.log",
        level="ERROR",
        encoding="utf-8",
        backtrace=True,
        diagnose=True,
    )
