from fastapi import FastAPI, Depends, HTTPException
from fastapi.exceptions import RequestValidationError

from core.auth import admin_route_auth
from core.exceptions import (
    global_exception_handler,
    http_exception_handler,
    value_error_handler,
    validation_exception_handler,
)
from . import auth, manager, subject, textbook_version, textbook, course_unit, knowledge, question


admin_app = FastAPI(
    dependencies=[Depends(admin_route_auth)],
    exception_handlers={
        RequestValidationError: validation_exception_handler,
        HTTPException: http_exception_handler,
        ValueError: value_error_handler,
        Exception: global_exception_handler,
    },
)

admin_app.include_router(auth.router)
admin_app.include_router(manager.router)
admin_app.include_router(subject.router)
admin_app.include_router(textbook_version.router)
admin_app.include_router(textbook.router)
admin_app.include_router(course_unit.router)
admin_app.include_router(knowledge.router)
admin_app.include_router(question.router)

__all__ = ["admin_app"]
