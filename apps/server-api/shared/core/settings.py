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
    
    # 服务间通信配置
    TASK_SERVICE_URL: str = "http://server-task:7891"
    AI_SERVICE_URL: str = "http://server-ai:7892"

    class Config:
        env_file = ".env"


envs = Settings()
