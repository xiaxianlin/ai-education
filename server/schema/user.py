from typing import Optional
from pydantic import BaseModel, field_validator
from util import valid


class UserLogin(BaseModel):
    type: int
    account: str
    password: Optional[str] = None
    code: Optional[str] = None


class SendCode(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        return valid.phone(v)


class UserRegister(BaseModel):
    username: str
    password: str
    phone: str
    code: str

    @field_validator("username")
    @classmethod
    def valid_username(clas, v):
        return valid.username(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return valid.password(v)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        return valid.phone(v)


class Wechat(BaseModel):
    code: str
    openid: Optional[str] = None
