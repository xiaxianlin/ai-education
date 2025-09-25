from enum import Enum
from typing import Optional
from pydantic import BaseModel, field_validator
from common import validation
from common.schemas import SearchSchema


class LoginSchema(BaseModel):

    username: str
    password: str

    @field_validator("username")
    @classmethod
    def valid_username(clas, v):
        return validation.username(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return validation.password(v)


class ModifyPasswordSchema(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        return validation.password(v)


class CreateUserSchema(BaseModel):
    username: str


class SearchUserSchema(SearchSchema):
    type: Optional[int] = None
    status: Optional[int] = None
