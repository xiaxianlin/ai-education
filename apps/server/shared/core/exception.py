import json

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from shared.core.settings import envs


def print_exception(request: Request, exc: Exception, exception_type: str = "exception"):
    """记录异常信息到日志（使用结构化日志）"""
    # 获取请求上下文信息
    request_id = getattr(request.state, "request_id", None)
    user_id = None
    if hasattr(request.state, "user_id"):
        user_id = request.state.user_id
    elif hasattr(request.state, "user") and hasattr(request.state.user, "id"):
        user_id = str(request.state.user.id)

    # 构建异常信息
    exception_info = {
        "exception_type": exception_type,
        "exception_class": type(exc).__name__,
        "exception_message": str(exc),
        "path": request.url.path,
        "method": request.method,
        "request_id": request_id,
        "user_id": user_id,
        "client_ip": request.client.host if request.client else None,
    }

    # 对于验证异常，添加验证错误详情
    # 将 validation_errors 序列化为 JSON 字符串，避免字典键（如 'type'）与 Loguru 格式占位符冲突
    if isinstance(exc, RequestValidationError):
        validation_errors = exc.errors()
        exception_info["validation_errors"] = json.dumps(validation_errors, ensure_ascii=False)


def get_error_message(exc: Exception, default_message: str) -> str:
    """
    根据环境返回错误信息

    Args:
        exc: 异常对象
        default_message: 默认错误信息

    Returns:
        错误信息字符串
    """
    # 生产环境隐藏详细错误信息，开发环境显示详细信息
    if envs.RUN_ENV == "production":
        return default_message
    else:
        return str(exc)


async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP 异常处理器"""
    print_exception(request, exc, exception_type="http_exception")

    return JSONResponse(
        status_code=200,
        content={"status": exc.status_code, "message": exc.detail},
        media_type="application/json; charset=utf-8",
    )


async def value_error_handler(request: Request, exc: ValueError):
    """业务逻辑错误处理器"""
    print_exception(request, exc, exception_type="business_error")

    return JSONResponse(
        status_code=200,
        content={"status": 400, "message": str(exc)},
        media_type="application/json; charset=utf-8",
    )


async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    print_exception(request, exc, exception_type="system_error")

    error_message = get_error_message(exc, "服务器内部错误")
    return JSONResponse(
        status_code=200,
        content={"status": 500, "message": error_message},
        media_type="application/json; charset=utf-8",
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """参数验证异常处理器"""
    print_exception(request, exc, exception_type="validation_error")

    return JSONResponse(
        status_code=200,
        content={"status": 422, "message": "参数校验失败"},
        media_type="application/json; charset=utf-8",
    )
