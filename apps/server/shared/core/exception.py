from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from shared.core.settings import envs


def print_exception(request: Request, exc: any):
    """记录异常信息到日志"""
    logger.error(f"Path: {request.url.path} Method: {request.method} ")
    logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}\n", exc_info=exc)


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
    print_exception(request, exc)

    return JSONResponse(
        status_code=200,
        content={"status": exc.status_code, "message": exc.detail},
    )


async def value_error_handler(request: Request, exc: ValueError):
    """业务逻辑错误处理器"""
    print_exception(request, exc)

    return JSONResponse(
        status_code=200,
        content={"status": 400, "message": str(exc)},
    )


async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    print_exception(request, exc)

    error_message = get_error_message(exc, "服务器内部错误")
    return JSONResponse(status_code=200, content={"status": 500, "message": error_message})


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """参数验证异常处理器"""
    print_exception(request, exc)

    return JSONResponse(status_code=200, content={"status": 422, "message": "参数校验失败"})
