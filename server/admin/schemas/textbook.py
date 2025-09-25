from enum import Enum
from typing import Optional
from pydantic import BaseModel, field_validator
from common.constants import SEMESTERS, STAGES, GRADES
from common.schemas import SearchSchema
from common import validation


class TextbookSaveSchema(BaseModel):
    stage: str
    subject: str
    version: str
    grade: str
    semester: str

    @field_validator("grade")
    @classmethod
    def valid_grade(clas, v):
        if v and v not in GRADES:
            raise ValueError("年级只能选择一年级到六年级")
        return v

    @field_validator("semester")
    @classmethod
    def valid_semester(clas, v):
        if v and v not in SEMESTERS:
            raise ValueError("学期只能选择上学期、下学期、整学期")
        return v

    @field_validator("stage")
    @classmethod
    def valid_stage(clas, v):
        if v and v not in STAGES:
            raise ValueError("阶段只能选择小学、初中、高中")
        return v
