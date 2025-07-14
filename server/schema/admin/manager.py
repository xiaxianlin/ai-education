from enum import Enum
from pydantic import BaseModel, field_validator


class ManagerStatus(int, Enum):
    Forbidden = -1
    InActive = 0
    Active = 1


class CraeteManager(BaseModel):
    type: int
    username: str

    @field_validator("type")
    @classmethod
    def valid_username(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError("账户类型错误")
        return v


class ModifyManagerStatus(BaseModel):
    status: ManagerStatus

    @field_validator("status")
    @classmethod
    def valid_status(cls, v):
        if v not in ManagerStatus._value2member_map_:
            raise ValueError(
                f"状态 '{v}' 无效，只允许: {list(ManagerStatus._value2member_map_.keys())}"
            )
        return v
