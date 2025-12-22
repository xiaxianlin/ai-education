import multiprocessing
import sys
from pydantic_settings import BaseSettings
from pydantic import field_validator


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

    # AI 配置
    AI_PLATFORM: str
    AI_PLATFORM_KEY: str
    AI_PLATFORM_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    # Redis 配置（用于任务队列）
    REDIS_URL: str = "redis://redis:6379/0"  # 完整的 Redis 连接 URL

    # 任务配置
    TASK_QUEUE_NAME: str = "ai-education-task"  # Celery 队列名称
    TASK_TIMEOUT: int = 1800  # 任务默认超时时间（秒）- 30分钟
    TASK_CONCURRENCY: int = multiprocessing.cpu_count()  # 任务并发数，自动检测（CPU核心数）
    TASK_LOGLEVEL: str = "info"  # 任务日志级别

    @field_validator("RUN_ENV")
    @classmethod
    def validate_run_env(cls, v):
        """验证运行环境"""
        if v not in ["development", "production", "test"]:
            raise ValueError(f"RUN_ENV 必须是 development、production 或 test，当前值: {v}")
        return v

    @field_validator("APP_SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v):
        """验证密钥长度"""
        if len(v) < 32:
            raise ValueError("APP_SECRET_KEY 长度必须至少32个字符，请使用更强的密钥")
        return v

    class Config:
        env_file = ".env"


def validate_settings():
    """验证所有必需的环境变量并输出友好的错误信息"""
    try:
        return Settings()
    except Exception as e:
        print("=" * 60, file=sys.stderr)
        print("环境变量配置错误！", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        print(f"错误详情: {e}", file=sys.stderr)
        print("\n请检查 .env 文件，确保以下必需变量已正确配置：", file=sys.stderr)
        print("- RUN_ENV (development/production/test)", file=sys.stderr)
        print("- TMP_DIR", file=sys.stderr)
        print("- LOG_DIR", file=sys.stderr)
        print("- APP_SECRET_KEY (至少32个字符)", file=sys.stderr)
        print("- ADMIN_USERNAME", file=sys.stderr)
        print("- ADMIN_PASSWORD", file=sys.stderr)
        print("- DATABASE_URL", file=sys.stderr)
        print("- AI_PLATFORM", file=sys.stderr)
        print("- AI_PLATFORM_KEY", file=sys.stderr)
        print("- ALIYUN_ACCESS_KEY_ID", file=sys.stderr)
        print("- ALIYUN_ACCESS_KEY_SECRET", file=sys.stderr)
        print("- ALIYUN_OSS_ENDPOINT", file=sys.stderr)
        print("- ALIYUN_OSS_BUCKET", file=sys.stderr)
        print("- ALIYUN_OSS_REGION", file=sys.stderr)
        print("- ALIYUN_WORKSPACE_ID", file=sys.stderr)
        print("- ALIYUN_RAG_INDEX_ID", file=sys.stderr)
        print("- ALIYUN_RAG_CATEGORY_ID", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        sys.exit(1)


envs = validate_settings()
