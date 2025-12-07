"""配置管理"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""

    # 运行环境
    RUN_ENV: str = "development"

    # 服务配置
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 7891

    # Redis 配置（可选，用于任务队列）
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0

    # AI 服务配置
    AI_SERVICE_URL: str = "http://server-ai:7892"

    # API 服务配置
    API_SERVICE_URL: str = "http://server-api:7890"

    # 日志配置
    LOG_DIR: str = "/app/tmp/logs"

    # 任务配置
    TASK_TIMEOUT: int = 300  # 5分钟
    TAKS_QUEUE_NAME: str = "ai-education-task"  # RQ 队列名称

    class Config:
        env_file = ".env"


envs = Settings()
