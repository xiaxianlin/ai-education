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

    # AI 配置
    AI_PLATFORM: str
    AI_PLATFORM_KEY: str
    AI_PLATFORM_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    
    # AI 模型配置
    AI_MODEL_NAME: str = "qwen3-max"
    AI_TEMPERATURE: float = 0.7
    AI_MAX_TOKENS: int = 2000
    AI_TOP_P: float = 1.0
    
    # AI TTS 配置
    AI_TTS_VOICE: str = "Cherry"
    AI_TTS_LANGUAGE: str = "Chinese"
    
    # AI 图像生成配置
    AI_IMAGE_MODEL: str = "qwen-image-plus"
    AI_IMAGE_WIDTH: int = 1024
    AI_IMAGE_HEIGHT: int = 1024
    
    # AI 语音识别配置
    AI_ASR_MODEL: str = "qwen-audio-turbo"
    AI_ASR_LANGUAGE: str = "zh"
    AI_ASR_FORMAT: str = "wav"

    # Redis 配置（用于任务队列）
    REDIS_URL: str = "redis://redis:6379/0"  # 完整的 Redis 连接 URL

    # 任务配置
    TASK_QUEUE_NAME: str = "ai-education-task"  # Celery 队列名称
    TASK_TIMEOUT: int = 1800  # 任务默认超时时间（秒）- 30分钟
    TASK_CONCURRENCY: int = multiprocessing.cpu_count()  # 任务并发数，自动检测（CPU核心数）
    TASK_LOGLEVEL: str = "info"  # 任务日志级别

    class Config:
        env_file = ".env"


envs = Settings()
