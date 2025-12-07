"""异常处理"""
from loguru import logger
from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP 异常处理"""
    logger.warning(
        f"HTTP exception: {exc.status_code} - {exc.detail}\n"
        f"Path: {request.url.path}\n"
        f"Method: {request.method}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={"status": exc.status_code, "message": exc.detail},
    )


async def value_error_handler(request: Request, exc: ValueError):
    """业务异常处理"""
    logger.warning(
        f"Value error: {str(exc)}\n"
        f"Path: {request.url.path}\n"
        f"Method: {request.method}"
    )

    return JSONResponse(
        status_code=200,
        content={"status": 400, "message": str(exc)},
    )


async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)}\n"
        f"Path: {request.url.path}\n"
        f"Method: {request.method}\n"
        f"Client: {request.client.host if request.client else 'unknown'}",
        exc_info=exc,
    )

    return JSONResponse(
        status_code=200,
        content={"status": 500, "message": "服务器内部错误，请稍后重试"},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """参数验证异常处理"""
    logger.error(exc.errors())
    data = []
    for err in exc.errors():
        data.append(
            {"field": err["loc"][1] if len(err["loc"]) > 1 else err["loc"][0], "error": err["msg"].replace("Value error, ", "")}
        )

    return JSONResponse(
        status_code=200,
        content={"message": "参数校验失败", "data": data, "status": 422},
    )

