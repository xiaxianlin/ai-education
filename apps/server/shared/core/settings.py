from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 运行环境
    RUN_ENV: str
    # 临时目录
    TMP_DIR: str
    # 日志目录
    LOG_DIR: str
    # 是否启用日志文件输出
    LOG_TO_FILE: bool = False
    # APP 运行密钥
    APP_SECRET_KEY: str
    # 阿里云访问配置
    ALIYUN_ACCESS_KEY_ID: str
    ALIYUN_ACCESS_KEY_SECRET: str
    # 对象存储平台
    ALIYUN_OSS_ENDPOINT: str
    ALIYUN_OSS_BUCKET: str
    ALIYUN_OSS_REGION: str
    # 百炼业务空间 ID
    ALIYUN_WORKSPACE_ID: str
    # 知识库 ID
    ALIYUN_RAG_INDEX_ID: str
    ALIYUN_RAG_CATEGORY_ID: str
    # 数据库配置
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_TIMEOUT: int = 30
    # 管理系统配置
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    # CORS配置
    CORS_ORIGINS: str = "*"  # 多个域名用逗号分隔
    # 题目召回数量配置
    QUESTION_RECALL_COUNT: int = 0
    
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
    ENABLE_WORKER: bool = False  # 是否启用 Worker（默认不启用，需要单独启动）

    class Config:
        env_file = ".env"


envs = Settings()
