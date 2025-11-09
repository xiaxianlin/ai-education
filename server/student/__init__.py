from fastapi import FastAPI, Depends, HTTPException
from fastapi.exceptions import RequestValidationError
from student.services.auth import student_router_filter
from common.middleware import WrappedResponse
from common.exception import (
    global_exception_handler,
    http_exception_handler,
    value_error_handler,
    validation_exception_handler,
)

from .routes.auth import auth_router
from .routes.config import config_router
from .routes.profile import profile_router
from .routes.practice import practice_router


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

student_app.include_router(auth_router)
student_app.include_router(config_router)
student_app.include_router(profile_router)
student_app.include_router(practice_router)

__all__ = ["student_app"]
