from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Generic, TypeVar


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


class SearchSchema(BaseModel):
    page: Optional[int] = 1
    size: Optional[int] = 10
    sort: Optional[str] = Query("create_time", description="排序字段")
    order: Optional[str] = Query("desc", pattern="^(asc|desc)$", description="排序方式")
    keywords: Optional[str] = None


class SearchResultSchema(BaseModel, Generic[T]):
    total: int = 0
    data: list[T] = []


class ManagerSchema(BaseModel):
    id: str
    username: str
    type: int
    status: int
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class TextbookSchema(BaseModel):
    id: int
    subject: str
    version: str
    grade: int
    semester: str
    file: Optional[str] = None
    index_file_id: Optional[str] = None
    is_parsed: int = 0
    status: int = 1
    create_time: int
    update_time: Optional[int] = None

    course_units: Optional[List["UnitSchema"]] = None

    model_config = {"from_attributes": True}


class UnitSchema(BaseModel):
    id: int
    textbook_id: int
    name: str
    content: str
    status: int = 1
    create_time: int
    update_time: Optional[int] = None
    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


class KnowledgeSchema(BaseModel):
    id: int
    textbook_id: int
    unit_id: int
    name: str
    content: str
    status: int = 1
    create_time: int
    update_time: Optional[int] = None

    textbook: Optional["TextbookSchema"] = None
    unit: Optional["UnitSchema"] = None

    model_config = {"from_attributes": True}


class QuestionSchema(BaseModel):
    id: int
    type: str
    subject: str
    grade: int
    content: str
    options: Optional[str] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    difficulty: Optional[str] = None
    status: int
    create_time: int
    update_time: Optional[int] = None

    knowledge: Optional[str] = None
    unit: Optional["UnitSchema"] = None
    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}


#### ================================= 分割线 ================================= ####


class StudentSchema(BaseModel):
    id: str
    name: str = ""
    phone: str
    status: int = 0
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class StudentTextbookSchema(BaseModel):
    id: int
    create_time: int
    textbook: Optional["TextbookSchema"] = None

    model_config = {"from_attributes": True}
