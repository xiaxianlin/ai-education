from pydantic import BaseModel, field_validator


class CraeteManager(BaseModel):
    type: int
    username: str

    @field_validator("type")
    @classmethod
    def valid_username(clas, v):
        if v not in [1, 2, 3]:
            raise ValueError("账户类型错误")
        return v


class ManagerStatus(BaseModel):
    status: int

    @field_validator("status")
    @classmethod
    def valid_username(clas, v):
        if v not in [0, 1]:
            raise ValueError("状态错误")
        return v
