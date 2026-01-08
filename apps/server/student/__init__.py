from fastapi import Depends, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from shared.core.exception import (
    global_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    value_error_handler,
)
from shared.core.middleware.logging import LoggingMiddleware
from shared.core.middleware.performance import PerformanceMiddleware
from shared.core.response import WrappedResponse

from .auth import auth_router, student_router_filter
from .practice import practice_router
from .profile import profile_router
from .textbook import textbook_router

student_app = FastAPI(
    default_response_class=WrappedResponse,
    dependencies=[Depends(student_router_filter)],
    exception_handlers={
        RequestValidationError: validation_exception_handler,
        HTTPException: http_exception_handler,
        ValueError: value_error_handler,
        Exception: global_exception_handler,
    },
)

# 注册日志和性能监控中间件
student_app.add_middleware(PerformanceMiddleware)
student_app.add_middleware(LoggingMiddleware)

student_app.include_router(auth_router)
student_app.include_router(textbook_router)
student_app.include_router(profile_router)
student_app.include_router(practice_router)

__all__ = ["student_app"]
