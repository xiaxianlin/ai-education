from loguru import logger
from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(
        status_code=200,
        content={"status": exc.status_code, "message": exc.detail},
    )


async def value_error_handler(_: Request, exc: ValueError):
    return JSONResponse(
        status_code=200,
        content={"status": 400, "message": str(exc)},
    )


async def global_exception_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=200,
        content={"status": 500, "message": "服务器异常"},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(exc.errors())
    data = []
    for err in exc.errors():
        data.append({"field": err["loc"][1], "error": err["msg"].replace("Value error, ", "")})

    return JSONResponse(
        status_code=200,
        content={"message": "参数校验失败", "data": data, "status": 422},
    )
