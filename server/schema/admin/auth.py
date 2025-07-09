from pydantic import BaseModel, field_validator
from util import valid


class LoginParams(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def valid_username(clas, v):
        return valid.username(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return valid.password(v)


class ModifyPasswordParams(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        return valid.password(v)
