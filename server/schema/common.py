from typing import Generic, TypeVar, Optional
from pydantic import BaseModel
from fastapi import Query

T = TypeVar("T")


class ResponseModel(BaseModel, Generic[T]):
    status: int = 0
    message: str = "success"
    data: Optional[T] = None


class SimpleNameParams(BaseModel):
    name: str
class SimpleStatusParams(BaseModel):
    status: int


class SearchParams(BaseModel):
    current_page: Optional[int] = 1
    page_size: Optional[int] = 10
    keywords: Optional[str] = None
    sort: Optional[str] = Query("create_time", description="排序字段")
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$", description="排序方式")
