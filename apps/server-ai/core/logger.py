"""日志配置"""

import sys
import os
from loguru import logger

from core.settings import envs


def setup_logger():
    """配置日志"""
    # 移除默认的 logger
    logger.remove()

    # 控制台输出
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO" if envs.RUN_ENV == "production" else "DEBUG",
        colorize=True,
    )

    if envs.RUN_ENV == "production":
        os.makedirs(envs.LOG_DIR, exist_ok=True)
        logger.add(
            os.path.join(envs.LOG_DIR, "ai_{time:YYYY-MM-DD}.log"),
            rotation="00:00",
            retention="30 days",
            compression="zip",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level="INFO",
        )
        logger.add(
            os.path.join(envs.LOG_DIR, "error_{time:YYYY-MM-DD}.log"),
            rotation="00:00",
            retention="30 days",
            compression="zip",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level="ERROR",
        )


# 初始化日志
setup_logger()
