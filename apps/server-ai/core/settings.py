"""配置管理"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""

    # 运行环境
    RUN_ENV: str = "development"

    # 服务配置
    AI_SERVER_HOST: str = "0.0.0.0"
    AI_SERVER_PORT: int = 7892

    # AI 配置
    AI_PLATFORM: str
    AI_PLATFORM_KEY: str
    AI_PLATFORM_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    AI_TTS_VOICE: str = "Cherry"

    # 数据库配置
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_TIMEOUT: int = 30

    # 阿里云配置
    ALIYUN_ACCESS_KEY_ID: str = ""
    ALIYUN_ACCESS_KEY_SECRET: str = ""
    ALIYUN_OSS_ENDPOINT: str = ""
    ALIYUN_OSS_BUCKET: str = ""
    ALIYUN_OSS_REGION: str = ""
    ALIYUN_WORKSPACE_ID: str = ""
    ALIYUN_RAG_INDEX_ID: str = ""
    ALIYUN_RAG_CATEGORY_ID: str = ""

    # 临时目录
    TMP_DIR: str = "tmp"

    # 日志配置
    LOG_DIR: str = "tmp/logs"

    class Config:
        env_file = ".env"


envs = Settings()
