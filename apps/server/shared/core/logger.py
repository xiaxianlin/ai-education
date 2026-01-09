import json
import logging
import os
from contextvars import ContextVar
from typing import Dict, Optional

from loguru import logger
from shared.core.settings import envs
from sqlalchemy.orm import Query
from sqlalchemy.sql import Select

# 请求上下文变量
request_id_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
user_id_var: ContextVar[Optional[str]] = ContextVar("user_id", default=None)
path_var: ContextVar[Optional[str]] = ContextVar("path", default=None)
method_var: ContextVar[Optional[str]] = ContextVar("method", default=None)


class InterceptHandler(logging.Handler):
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_globals.get("__name__") == __name__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def _get_text_format() -> str:
    """获取文本格式（已废弃，使用 _text_formatter 函数）"""
    # 注意：此函数已不再使用，保留仅为向后兼容
    # 如果将来需要使用格式字符串，需要转义 < 和 > 字符
    # 例如：使用 \{function\} 或使用函数格式化器
    return "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {extra[request_id]!s} | {name}:{{function}}:{line} - {message}"


def _json_formatter(record):
    """JSON格式化器"""
    # 设置请求上下文
    record["extra"]["request_id"] = request_id_var.get()
    record["extra"]["user_id"] = user_id_var.get()
    record["extra"]["path"] = path_var.get()
    record["extra"]["method"] = method_var.get()

    # 构建JSON日志
    log_data = {
        "time": record["time"].isoformat(),
        "level": record["level"].name,
        "request_id": record["extra"].get("request_id"),
        "user_id": record["extra"].get("user_id"),
        "module": record["name"],
        "function": record["function"],
        "line": record["line"],
        "message": record["message"],
    }
    # 添加额外的上下文信息
    if record["extra"].get("path"):
        log_data["path"] = record["extra"]["path"]
    if record["extra"].get("method"):
        log_data["method"] = record["extra"]["method"]
    # 添加异常信息
    if record.get("exception"):
        log_data["exception"] = str(record["exception"])
    # 添加其他额外字段
    extra = {k: v for k, v in record["extra"].items() if k not in ["request_id", "user_id", "path", "method"]}
    if extra:
        log_data["extra"] = extra
    return json.dumps(log_data, ensure_ascii=False) + "\n"


def _text_formatter(record):
    """文本格式化器"""
    # 设置请求上下文，确保 None 值被转换为空字符串
    request_id = request_id_var.get()
    user_id = user_id_var.get()
    path = path_var.get()
    method = method_var.get()

    record["extra"]["request_id"] = request_id if request_id else "-"
    record["extra"]["user_id"] = user_id if user_id else "-"
    record["extra"]["path"] = path if path else "-"
    record["extra"]["method"] = method if method else "-"

    # 手动格式化字符串，避免 None 值导致的格式化错误
    # 处理 function 字段，将包含 < > 的函数名（如 <module>, <lambda>）替换为安全格式
    # 避免被 Loguru 误解析为颜色指令
    time_str = record["time"].strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]  # 精确到毫秒
    level_str = f"{record['level'].name:<8}"
    request_id_str = record["extra"].get("request_id", "-")
    name_str = record["name"]
    function_str = str(record["function"])
    # 将包含 < > 的函数名替换为安全格式，避免 Loguru 颜色解析错误
    if function_str.startswith("<") and function_str.endswith(">"):
        function_str = function_str[1:-1]  # 移除 < 和 >
    line_str = record["line"]
    message_str = record["message"]

    return f"{time_str} | {level_str} | {request_id_str} | {name_str}:{function_str}:{line_str} - {message_str}\n"


# 接管标准库 logging（包括 uvicorn）
intercept_handler = InterceptHandler()
logging.basicConfig(handlers=[intercept_handler], level=logging.INFO, force=True)

for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
    log = logging.getLogger(name)
    log.handlers = [intercept_handler]
    log.propagate = False

# 配置日志
os.makedirs(envs.LOG_DIR, exist_ok=True)

# 确定日志格式和级别
log_format = envs.LOG_FORMAT
log_level = envs.LOG_LEVEL
is_production = envs.RUN_ENV == "production"
is_development = envs.RUN_ENV == "development"

# 选择格式化器
formatter = _json_formatter if log_format == "json" else _text_formatter

# 配置日志文件
if is_production:
    # 生产环境：使用 rotation、retention、compression
    # app.log - 所有应用日志
    logger.add(
        f"{envs.LOG_DIR}/app.log",
        rotation="500 MB",
        retention="10 days",
        compression="zip",
        format=formatter,
        level=log_level,
        encoding="utf-8",
        enqueue=True,
        filter=lambda record: record["level"].name in ["INFO", "WARNING", "DEBUG"],
    )

    # error.log - 错误日志
    logger.add(
        f"{envs.LOG_DIR}/error.log",
        rotation="100 MB",
        retention="30 days",
        compression="zip",
        format=formatter,
        level="ERROR",
        encoding="utf-8",
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )

    # access.log - 访问日志
    logger.add(
        f"{envs.LOG_DIR}/access.log",
        rotation="500 MB",
        retention="10 days",
        compression="zip",
        format=formatter,
        level="INFO",
        encoding="utf-8",
        enqueue=True,
        filter=lambda record: record["extra"].get("log_type") == "access",
    )

    # performance.log - 性能日志
    if envs.LOG_PERFORMANCE_ENABLED:
        logger.add(
            f"{envs.LOG_DIR}/performance.log",
            rotation="500 MB",
            retention="7 days",
            compression="zip",
            format=formatter,
            level="INFO",
            encoding="utf-8",
            enqueue=True,
            filter=lambda record: record["extra"].get("log_type") == "performance",
        )

    # sql.log - SQL日志（如果启用）
    if envs.LOG_SQL_ENABLED:
        logger.add(
            f"{envs.LOG_DIR}/sql.log",
            rotation="500 MB",
            retention="7 days",
            compression="zip",
            format=formatter,
            level="DEBUG",
            encoding="utf-8",
            enqueue=True,
            filter=lambda record: record["extra"].get("log_type") == "sql",
        )
else:
    # 开发环境：每次启动覆盖
    log_files = [
        f"{envs.LOG_DIR}/app.log",
        f"{envs.LOG_DIR}/error.log",
        f"{envs.LOG_DIR}/access.log",
    ]
    if envs.LOG_PERFORMANCE_ENABLED:
        log_files.append(f"{envs.LOG_DIR}/performance.log")
    if envs.LOG_SQL_ENABLED:
        log_files.append(f"{envs.LOG_DIR}/sql.log")

    # 删除旧的日志文件
    for log_file in log_files:
        if os.path.exists(log_file):
            os.remove(log_file)

    # app.log - 所有应用日志
    logger.add(
        f"{envs.LOG_DIR}/app.log",
        format=formatter,
        level=log_level,
        encoding="utf-8",
        filter=lambda record: record["level"].name in ["INFO", "WARNING", "DEBUG"],
    )

    # error.log - 错误日志
    logger.add(
        f"{envs.LOG_DIR}/error.log",
        format=formatter,
        level="ERROR",
        encoding="utf-8",
        backtrace=True,
        diagnose=True,
    )

    # access.log - 访问日志
    logger.add(
        f"{envs.LOG_DIR}/access.log",
        format=formatter,
        level="INFO",
        encoding="utf-8",
        filter=lambda record: record["extra"].get("log_type") == "access",
    )

    # performance.log - 性能日志
    if envs.LOG_PERFORMANCE_ENABLED:
        logger.add(
            f"{envs.LOG_DIR}/performance.log",
            format=formatter,
            level="INFO",
            encoding="utf-8",
            filter=lambda record: record["extra"].get("log_type") == "performance",
        )

    # sql.log - SQL日志（如果启用）
    if envs.LOG_SQL_ENABLED:
        logger.add(
            f"{envs.LOG_DIR}/sql.log",
            format=formatter,
            level="DEBUG",
            encoding="utf-8",
            filter=lambda record: record["extra"].get("log_type") == "sql",
        )


def set_request_context(
    request_id: Optional[str] = None,
    user_id: Optional[str] = None,
    path: Optional[str] = None,
    method: Optional[str] = None,
):
    """设置请求上下文"""
    if request_id is not None:
        request_id_var.set(request_id)
    if user_id is not None:
        user_id_var.set(user_id)
    if path is not None:
        path_var.set(path)
    if method is not None:
        method_var.set(method)


def clear_request_context():
    """清除请求上下文"""
    request_id_var.set(None)
    user_id_var.set(None)
    path_var.set(None)
    method_var.set(None)


def log_request(path: str, method: str, **kwargs):
    """记录请求信息"""
    logger.bind(log_type="access", path=path, method=method, **kwargs).info(f"{method} {path}")


def log_response(path: str, method: str, status_code: int, duration: float, **kwargs):
    """记录响应信息"""
    logger.bind(
        log_type="access",
        path=path,
        method=method,
        status_code=status_code,
        duration_ms=round(duration * 1000, 2),
        **kwargs,
    ).info(f"{method} {path} - {status_code} ({duration*1000:.2f}ms)")


def log_error(message: str, exc: Optional[Exception] = None, **kwargs):
    """记录错误（带上下文）"""
    if exc:
        logger.bind(**kwargs).exception(message)
    else:
        logger.bind(**kwargs).error(message)


def log_performance(metric: str, value: float, unit: str = "ms", **kwargs):
    """记录性能指标"""
    logger.bind(log_type="performance", metric=metric, value=value, unit=unit, **kwargs).info(
        f"{metric}: {value}{unit}"
    )


def log_sql(query: str, duration: float = 0, params: Optional[Dict] = None, is_slow: bool = False):
    """记录SQL查询"""
    extra = {
        "log_type": "sql",
        "duration_ms": round(duration * 1000, 2),
        "is_slow": is_slow,
    }
    if params:
        # 脱敏处理敏感信息
        safe_params = _sanitize_params(params)
        extra["params"] = safe_params
    logger.bind(**extra).debug(query)


def _sanitize_params(params: Dict) -> Dict:
    """脱敏处理敏感参数"""
    sensitive_keys = ["password", "pwd", "secret", "token", "key", "api_key", "access_key"]
    safe_params = {}
    for k, v in params.items():
        if any(sensitive in k.lower() for sensitive in sensitive_keys):
            safe_params[k] = "***"
        else:
            safe_params[k] = v
    return safe_params


def print_sql(query, engine=None, duration: float = 0):
    """
    打印 SQLAlchemy 生成的 SQL 语句（带实参）

    参数:
        query: 可以是 ORM 的 Query 或 Core 的 Select 对象
        engine: 可选，用于获取方言 dialect；如果不传会尝试 query.session.bind
        duration: SQL执行时间（秒）
    """
    # 获取 engine / dialect
    dialect = None
    if engine is not None:
        dialect = engine.dialect
    elif hasattr(query, "session") and query.session is not None:
        dialect = query.session.bind.dialect

    # 处理 ORM 1.x 的 Query 对象
    if isinstance(query, Query):
        stmt = query.statement
    # 处理 ORM 2.x 的 select()
    elif isinstance(query, Select):
        stmt = query
    else:
        raise TypeError("不支持的 query 类型，请传入 ORM Query 或 select()")

    compiled = stmt.compile(dialect=dialect, compile_kwargs={"literal_binds": True})
    sql_str = str(compiled)

    # 检测慢查询
    duration_ms = duration * 1000
    is_slow = duration_ms > envs.LOG_SLOW_QUERY_THRESHOLD

    # 如果启用了SQL日志，使用专门的SQL日志函数
    if envs.LOG_SQL_ENABLED:
        log_sql(sql_str, duration=duration, is_slow=is_slow)
    else:
        # 否则只记录慢查询
        if is_slow:
            logger.warning(f"慢查询 ({duration_ms:.2f}ms): {sql_str}")
        else:
            logger.debug(f"SQL: {sql_str}")
