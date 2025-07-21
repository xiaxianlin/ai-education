from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, ConfigDict, field_validator
from fastapi import Query

from util import valid

T = TypeVar("T")


class ResponseSchema(BaseModel, Generic[T]):
    status: int = 0
    message: str = "success"
    data: Optional[T] = None

    model_config = ConfigDict(extra="ignore", exclude_none=True)


class NameSchema(BaseModel):
    name: str


class StatusSchema(BaseModel):
    status: int


class ModifyPasswordSchema(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        return valid.password(v)


class SearchSchema(BaseModel):
    current_page: Optional[int] = 1
    page_size: Optional[int] = 10
    keywords: Optional[str] = None
    sort: Optional[str] = Query("create_time", description="排序字段")
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$", description="排序方式")


class SearchResultSchema(BaseModel, Generic[T]):
    total: int = 0
    data: list[T] = []
