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
    AI_TTS_VOICE: str = "Cherry"

    # Redis 配置（用于任务队列）
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0

    # 任务配置
    TASK_TIMEOUT: int = 300  # 5分钟
    TASK_QUEUE_NAME: str = "ai-education-task"  # RQ 队列名称

    class Config:
        env_file = ".env"


envs = Settings()
