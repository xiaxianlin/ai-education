from typing import Optional

from pydantic import BaseModel, field_validator
from shared.core.schema import SearchSchema
from shared.utils import validation


class SearchStudentSchema(SearchSchema):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[int] = None


class SaveStudentSchema(BaseModel):
    name: str
    phone: str
    grade: int
    status: int = 1

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        return validation.grade(v)

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v):
        return validation.phone(v)

    @field_validator("status")
    @classmethod
    def valid_status(cls, v):
        return validation.status(v)


class HandleStudentTextbookSchema(BaseModel):
    ids: list[int]


class HandleStudentPracticeSchema(BaseModel):
    ids: list[int]
