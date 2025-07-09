from typing import Optional
from fastapi import Query
from pydantic import BaseModel, field_validator

from schema.common import SearchParams


class TextbookSave(BaseModel):
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


class TextbookSearchParams(SearchParams):
    subject: Optional[str] = Query(None, description="科目")
    version: Optional[str] = Query(None, description="版本")
    stage: Optional[str] = Query(None, description="阶段")
    grade: Optional[int] = Query(None, description="年级")
