import multiprocessing
import sys

from pydantic import field_validator
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

    # V2 迁移配置
    USE_QUESTION_V2_SYNC: bool = False  # 是否启用 V1->V2 双写同步
    USE_QUESTION_V2: bool = False  # 是否使用 V2 题型系统读取

    # 日志配置
    LOG_LEVEL: str | None = None  # 日志级别（DEBUG/INFO/WARNING/ERROR），None时根据环境自动设置
    LOG_FORMAT: str | None = None  # 日志格式（text/json），None时根据环境自动设置
    LOG_SQL_ENABLED: bool = False  # 是否启用SQL日志（默认false，开发环境可开启）
    LOG_PERFORMANCE_ENABLED: bool = True  # 是否启用性能日志（默认true）
    LOG_SLOW_QUERY_THRESHOLD: int = 1000  # 慢查询阈值（毫秒，默认1000）
    LOG_SLOW_REQUEST_THRESHOLD: int = 2000  # 慢请求阈值（毫秒，默认2000）

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
        # 开发环境至少16字符，生产环境至少32字符
        min_length = 16
        if len(v) < min_length:
            raise ValueError(
                f"APP_SECRET_KEY 长度必须至少{min_length}个字符，当前长度: {len(v)}。"
                f"建议使用至少32个字符的强密钥以确保安全性。"
            )
        if len(v) < 32:
            import warnings

            warnings.warn(
                f"APP_SECRET_KEY 长度仅为 {len(v)} 个字符，建议使用至少32个字符的强密钥以提高安全性。", UserWarning
            )
        return v

    @field_validator("LOG_LEVEL", mode="before")
    @classmethod
    def validate_log_level(cls, v, info):
        """根据环境自动设置日志级别"""
        if v is not None:
            if v.upper() not in ["DEBUG", "INFO", "WARNING", "ERROR"]:
                raise ValueError(f"LOG_LEVEL 必须是 DEBUG、INFO、WARNING 或 ERROR，当前值: {v}")
            return v.upper()
        # 根据环境自动设置
        run_env = info.data.get("RUN_ENV", "development")
        if run_env == "development":
            return "DEBUG"
        elif run_env == "production":
            return "INFO"
        else:  # test
            return "WARNING"

    @field_validator("LOG_FORMAT", mode="before")
    @classmethod
    def validate_log_format(cls, v, info):
        """根据环境自动设置日志格式"""
        if v is not None:
            if v.lower() not in ["text", "json"]:
                raise ValueError(f"LOG_FORMAT 必须是 text 或 json，当前值: {v}")
            return v.lower()
        # 根据环境自动设置
        run_env = info.data.get("RUN_ENV", "development")
        return "text" if run_env == "development" else "json"

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
        print("- APP_SECRET_KEY (至少16个字符，建议32个字符以上)", file=sys.stderr)
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
