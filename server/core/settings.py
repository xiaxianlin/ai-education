from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 运行环境
    RUN_ENV: str
    # 临时目录
    RUNTIME_DIR: str
    # APP 运行密钥
    APP_SECRET_KEY: str

    # 大语言模型
    LLM_MODEL: str
    # 语言识别模型
    ASR_MODEL: str
    # 语言合成模型
    TTS_MODEL: str
    # 视觉模型
    VISION_MODEL: str
    # 多模态模型
    MULTI_MODEL: str

    # 阿里云 AI 配置
    ALIYUN_AI_BASE_URL: str
    ALIYUN_AI_KEY: str
    ALIYUN_LLM_MODEL: str
    ALIYUN_TTS_MODEL: str
    ALIYUN_ASR_MODEL: str
    ALIYUN_VISION_MODEL: str
    ALIYUN_MULTI_MODEL: str

    # 豆包 AI 配置
    DOUBAO_AI_BASE_URL: str
    DOUBAO_AI_KEY: str
    DOUBAO_LLM_MODEL: str
    DOUBAO_TTS_MODEL: str
    DOUBAO_ASR_MODEL: str
    DOUBAO_VISION_MODEL: str
    DOUBAO_MULTI_MODEL: str

    # 对象存储平台
    OSS_PLATFORM: str
    ALIYUN_OSS_KEY_ID: str
    ALIYUN_OSS_KEY_SECRET: str
    ALIYUN_OSS_ENDPOINT: str
    ALIYUN_OSS_BUCKET: str
    ALIYUN_OSS_REGION: str

    # 数据库配置
    DATABASE_URL: str

    # Redis 缓存配置
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    REDIS_CACHE_THRESHOLD: float

    # Neo4j 数据库配置
    NEO4J_URL: str
    NEO4J_USERNAME: str
    NEO4J_PASSWORD: str
    NEO4J_DATABASE: str

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


settings = Settings()
