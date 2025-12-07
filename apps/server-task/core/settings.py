"""配置管理"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    
    # 运行环境
    RUN_ENV: str = "development"
    
    # 服务配置
    TASK_SERVER_HOST: str = "0.0.0.0"
    TASK_SERVER_PORT: int = 7891
    
    # Redis 配置（可选，用于任务队列）
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    
    # AI 配置
    AI_PLATFORM: str
    AI_PLATFORM_KEY: str
    AI_PLATFORM_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    
    # AI 服务配置
    AI_SERVICE_URL: str = "http://server-ai:7892"
    
    # 阿里云配置
    ALIYUN_ACCESS_KEY_ID: str = ""
    ALIYUN_ACCESS_KEY_SECRET: str = ""
    ALIYUN_OSS_ENDPOINT: str = ""
    ALIYUN_OSS_BUCKET: str = ""
    ALIYUN_OSS_REGION: str = ""
    ALIYUN_WORKSPACE_ID: str = ""
    ALIYUN_RAG_INDEX_ID: str = ""
    ALIYUN_RAG_CATEGORY_ID: str = ""
    
    # 日志配置
    LOG_DIR: str = "/app/tmp/logs"
    LOG_TO_FILE: bool = False
    
    # 任务配置
    MAX_RETRY_TIMES: int = 3
    TASK_TIMEOUT: int = 300  # 5分钟
    
    class Config:
        env_file = ".env"


envs = Settings()

