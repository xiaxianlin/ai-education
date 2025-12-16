from loguru import logger
from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def print_exception(request: Request, exc: any):
    logger.error(f"Path: {request.url.path} Method: {request.method} ")
    logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}\n", exc_info=exc)


async def http_exception_handler(request: Request, exc: HTTPException):
    print_exception(request, exc)

    return JSONResponse(
        status_code=200,
        content={"status": exc.status_code, "message": exc.detail},
    )


async def value_error_handler(request: Request, exc: ValueError):
    print_exception(request, exc)

    return JSONResponse(
        status_code=200,
        content={"status": 400, "message": str(exc)},
    )


async def global_exception_handler(request: Request, exc: Exception):
    print_exception(request, exc)

    return JSONResponse(status_code=200, content={"status": 500, "message": "服务器内部错误"})


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print_exception(request, exc)

    return JSONResponse(status_code=200, content={"message": "参数校验失败", "status": 422})
