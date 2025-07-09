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


class SearchParams(BaseModel):
    page: Optional[int] = Query(1, ge=1, description="页码，从 1 开始")
    size: Optional[int] = Query(20, ge=1, le=100, description="每页条数")
    keywords: Optional[str] = Query(None, description="搜索关键词")
    sort: Optional[str] = Query("", description="排序字段")
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$", description="排序方式")
