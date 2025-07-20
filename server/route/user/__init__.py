from fastapi import FastAPI, Depends, HTTPException
from fastapi.exceptions import RequestValidationError

from core.auth import user_route_auth
from core.exceptions import (
    global_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    value_error_handler,
)
from . import auth, question

user_app = FastAPI(
    dependencies=[Depends(user_route_auth)],
    exception_handlers={
        RequestValidationError: validation_exception_handler,
        HTTPException: http_exception_handler,
        ValueError: value_error_handler,
        Exception: global_exception_handler,
    },
)

user_app.include_router(auth.router)
user_app.include_router(question.router)


__all__ = ["user_app"]
