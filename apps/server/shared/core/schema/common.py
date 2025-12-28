"""
通用 Schema 模块

包含响应、分页等通用 Schema。
"""

from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ResponseSchema(BaseModel, Generic[T]):
    """通用响应格式"""

    status: int = 0
    message: str = "success"
    data: Optional[T] = None

    model_config = ConfigDict(extra="ignore", exclude_none=True)


class SearchSchema(BaseModel):
    """分页查询参数"""

    page: Optional[int] = 1
    size: Optional[int] = 10


class SearchResultSchema(BaseModel, Generic[T]):
    """分页查询结果"""

    total: int = 0
    data: list[T] = []


__all__ = [
    "T",
    "ResponseSchema",
    "SearchSchema",
    "SearchResultSchema",
]
