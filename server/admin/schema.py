from typing import Optional
from pydantic import BaseModel, field_validator
from utils import validation
from common.constants import SEMESTERS, SUBJECTS, TEXTBOOK_VERSIONS
from common.schema import SearchSchema


class LoginSchema(BaseModel):

    username: str
    password: str

    @field_validator("username")
    @classmethod
    def valid_username(clas, v):
        return validation.username(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return validation.password(v)


class ModifyPasswordSchema(BaseModel):
    origin: str
    password: str

    @field_validator("origin")
    @classmethod
    def validate_origin(cls, v):
        return validation.password(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return validation.password(v)


class CreateManangeSchema(BaseModel):
    username: str
    type: int


class UpdateManangeSchema(BaseModel):
    type: Optional[int] = None
    status: Optional[int] = None


class SaveTextbookSchema(BaseModel):
    subject: str
    version: str
    grade: int
    semester: str

    @field_validator("subject")
    @classmethod
    def valid_subject(clas, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{"、".join(SUBJECTS)}")
        return v

    @field_validator("version")
    @classmethod
    def valid_version(clas, v):
        if v and v not in TEXTBOOK_VERSIONS:
            raise ValueError(f"版本只能选泽{"、".join(TEXTBOOK_VERSIONS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(clas, v):
        if v and v not in range(1, 13):
            raise ValueError(f"非法年级")
        return v

    @field_validator("semester")
    @classmethod
    def valid_semester(clas, v):
        if v and v not in SEMESTERS:
            raise ValueError(f"学期只能选择{"、".join(SEMESTERS)}")
        return v


class SearchTextbookSchema(SearchSchema):
    version: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[str] = None


class CreateUnitSchema(BaseModel):
    textbook_id: int
    name: str
    content: str


class UpdateUnitSchema(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None


class CreateKnowledgeSchema(BaseModel):
    textbook_id: int
    course_unit_id: int
    name: str
    content: str


class UpdateKnowledgeSchema(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    status: Optional[int] = None


class UpdateQuestionSchema(BaseModel):
    subject: Optional[str] = None
    grade: Optional[int] = None
    type: Optional[str] = None
    content: Optional[str] = None
    options: Optional[list[str]] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    knowledge_id: Optional[int] = None
    course_unit_id: Optional[int] = None
    textbook_id: Optional[int] = None
    status: Optional[int] = None


class SearchQuestionSchema(SearchSchema):
    subject: Optional[str] = None
    grade: Optional[int] = None
    type: Optional[str] = None


class CreateStudentSchema(BaseModel):
    name: str
    phone: str


class UpdateStudentSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[int] = None


class SearchStudentSchema(SearchSchema):
    phone: Optional[str] = None
    status: Optional[int] = None
