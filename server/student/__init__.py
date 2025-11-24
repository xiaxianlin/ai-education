from fastapi import FastAPI, Depends, HTTPException
from fastapi.exceptions import RequestValidationError
from student.services.auth import student_router_filter
from core.middleware import WrappedResponse
from core.exception import (
    global_exception_handler,
    http_exception_handler,
    value_error_handler,
    validation_exception_handler,
)

from .routes.auth import auth_router
from .routes.textbook import textbook_router
from .routes.practice import practice_router
from .routes.unit import unit_router
from .routes.wrong_records import wrong_records_router


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
student_app.include_router(textbook_router)
student_app.include_router(practice_router)
student_app.include_router(unit_router)
student_app.include_router(wrong_records_router)

__all__ = ["student_app"]
