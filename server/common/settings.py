from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 运行环境
    RUN_ENV: str
    # 临时目录
    RUNTIME_DIR: str
    # APP 运行密钥
    APP_SECRET_KEY: str
    # 阿里云访问配置
    ALIYUN_ACCESS_KEY_ID: str
    ALIYUN_ACCESS_KEY_SECRET: str
    # 阿里云 AI 配置
    ALIYUN_AI_BASE_URL: str
    ALIYUN_AI_KEY: str
    ALIYUN_LLM_MODEL: str
    ALIYUN_TTS_MODEL: str
    ALIYUN_ASR_MODEL: str
    ALIYUN_OCR_MODEL: str
    ALIYUN_MULTI_MODEL: str
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
    # Redis 缓存配置
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    REDIS_CACHE_THRESHOLD: float
    # 微信配置
    WECHAT_APP_ID: str
    WECHAT_APP_SECRET: str
    # 管理系统配置
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    MANAGER_INIT_PASSWORD: str
    # 教育系统配置
    QUESTION_MAX_UPLOAD: int

    class Config:
        env_file = ".env"


envs = Settings()
