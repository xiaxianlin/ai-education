from fastapi import FastAPI, Depends, HTTPException
from fastapi.exceptions import RequestValidationError
from admin.services.auth import admin_route_filter
from shared.core.middleware import WrappedResponse
from shared.core.exception import (
    global_exception_handler,
    http_exception_handler,
    value_error_handler,
    validation_exception_handler,
)

from .routes.auth import auth_router
from .routes.knowledge import knowledge_router
from .routes.manager import manager_router
from .routes.question import question_router
from .routes.question_type import question_type_router
from .routes.student import student_router
from .routes.textbook import textbook_router
from .routes.teacher_book import teacher_book_router
from .routes.unit import unit_router
from .routes.config import config_router
from .routes.practice import practice_router


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
admin_app.include_router(knowledge_router)
admin_app.include_router(manager_router)
admin_app.include_router(question_router)
admin_app.include_router(question_type_router)
admin_app.include_router(student_router)
admin_app.include_router(textbook_router)
admin_app.include_router(teacher_book_router)
admin_app.include_router(unit_router)
admin_app.include_router(config_router)
admin_app.include_router(practice_router)

__all__ = ["admin_app"]
