from enum import Enum
from typing import Optional
from pydantic import BaseModel, field_validator
from schema.common import SearchSchema
from util import valid


class ManagerStatus(int, Enum):
    Forbidden = -1
    InActive = 0
    Active = 1


class AdminLoginSchema(BaseModel):

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


class ManagerSaveSchema(BaseModel):
    type: int
    username: str

    @field_validator("type")
    @classmethod
    def valid_username(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError("账户类型错误")
        return v


class ManagerSearchSchema(SearchSchema):
    type: Optional[int] = None
    status: Optional[int] = None


class TextbookSaveSchema(BaseModel):
    stage: str
    subject: str
    version: str
    grade: int
    semester: int

    @field_validator("grade")
    @classmethod
    def valid_grade(clas, v):
        if v and v not in range(1, 13):
            raise ValueError("年级只能选择一年级到十二年级")
        return v

    @field_validator("semester")
    @classmethod
    def valid_semester(clas, v):
        if v and v not in range(4):
            raise ValueError("学期不合法")
        return v

    @field_validator("stage")
    @classmethod
    def valid_stage(clas, v):
        if v and v not in ["小学", "初中", "高中"]:
            raise ValueError("阶段只能选择小学、初中、高中")
        return v


class TextbookSearchSchema(SearchSchema):
    subject: Optional[str] = None
    version: Optional[str] = None
    stage: Optional[str] = None
    grade: Optional[int] = None


class CourseUnitCreateSchema(BaseModel):
    textbook_id: int
    name: str
    content: str


class CourseUnitUpdateSchema(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    analysis_text: Optional[str] = None
    analysis_audio: Optional[str] = None
    analysis_video: Optional[str] = None
    status: Optional[int] = None


class KnowledgeCreateSchema(BaseModel):
    course_unit_id: int
    name: str
    content: str


class KnowledgeUpdateSchema(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    analysis_text: Optional[str] = None
    analysis_audio: Optional[str] = None
    analysis_video: Optional[str] = None
    status: Optional[int] = None
