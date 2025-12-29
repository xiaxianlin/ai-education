from fastapi import Depends, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from shared.core.exception import (
    global_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    value_error_handler,
)
from shared.core.middleware import WrappedResponse

from .auth import admin_route_filter
from .auth.route import auth_router
from .practice.route import practice_router
from .question.route import question_router
from .student.route import student_router
from .teacher_book.route import teacher_book_router
from .textbook.route import textbook_router

admin_app = FastAPI(
    default_response_class=WrappedResponse,
    dependencies=[Depends(admin_route_filter)],
    exception_handlers={
        RequestValidationError: validation_exception_handler,
        HTTPException: http_exception_handler,
        ValueError: value_error_handler,
        Exception: global_exception_handler,
    },
)


admin_app.include_router(auth_router)
admin_app.include_router(question_router)
admin_app.include_router(student_router)
admin_app.include_router(textbook_router)
admin_app.include_router(teacher_book_router)
admin_app.include_router(practice_router)

__all__ = ["admin_app"]
