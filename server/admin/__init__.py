from fastapi import FastAPI, Depends, HTTPException
from fastapi.exceptions import RequestValidationError
from admin.services.auth import admin_route_auth
from common.middleware import ExcludeNoneJSONResponse
from common.exception import (
    global_exception_handler,
    http_exception_handler,
    value_error_handler,
    validation_exception_handler,
)

from .routes.auth import auth_router


manage_app = FastAPI(
    default_response_class=ExcludeNoneJSONResponse,
    dependencies=[Depends(admin_route_auth)],
    exception_handlers={
        RequestValidationError: validation_exception_handler,
        HTTPException: http_exception_handler,
        ValueError: value_error_handler,
        Exception: global_exception_handler,
    },
)

manage_app.include_router(auth_router)
# manage_app.include_router(user.router)
# manage_app.include_router(student.router)
# manage_app.include_router(subject.router)
# manage_app.include_router(textbook_version.router)
# manage_app.include_router(textbook.router)
# manage_app.include_router(course_unit.router)
# manage_app.include_router(knowledge.router)
# manage_app.include_router(question.router)

__all__ = ["manage_app"]
