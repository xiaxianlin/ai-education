import multiprocessing

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 运行环境
    RUN_ENV: str
    TMP_DIR: str
    LOG_DIR: str
    APP_SECRET_KEY: str
    CORS_ORIGINS: str = "*"  # 多个域名用逗号分隔
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    # 阿里云访问配置
    ALIYUN_ACCESS_KEY_ID: str
    ALIYUN_ACCESS_KEY_SECRET: str
    ALIYUN_OSS_ENDPOINT: str
    ALIYUN_OSS_BUCKET: str
    ALIYUN_OSS_REGION: str
    ALIYUN_WORKSPACE_ID: str
    ALIYUN_RAG_INDEX_ID: str
    ALIYUN_RAG_CATEGORY_ID: str

    # 数据库配置
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_POOL_RECYCLE: int = 3600  # 连接回收时间（秒），默认1小时

    # Redis 配置（用于任务队列）
    REDIS_URL: str = "redis://redis:6379/0"  # 完整的 Redis 连接 URL

    # 任务配置
    TASK_QUEUE_NAME: str = "ai-education-task"  # Celery 队列名称
    TASK_TIMEOUT: int = 1800  # 任务默认超时时间（秒）- 30分钟
    TASK_CONCURRENCY: int = multiprocessing.cpu_count()  # 任务并发数，自动检测（CPU核心数）
    TASK_LOGLEVEL: str = "info"  # 任务日志级别

    LLM_API_KEY: str
    LLM_API_BASE: str
    LLM_MODEL_NAME: str

    class Config:
        env_file = ".env"


envs = Settings()
