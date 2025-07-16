from pydantic import BaseModel
from typing import Optional, List, Dict

from .common import *
from .admin import *


class ManagerSchema(BaseModel):
    id: str
    username: str
    type: int = 0
    status: int = 0
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class UserSchema(BaseModel):
    id: str
    username: str = ""
    phone: str
    openid: str = ""
    status: int = 0
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class UserProfileSchema(BaseModel):
    id: str
    user_id: str
    provice: str
    stage: str
    enrollment: str
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class UserSubjectSchema(BaseModel):
    id: str
    user_id: str
    textbook_version: str
    subject: str
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class SubjectSchema(BaseModel):
    id: int
    name: str
    status: int = 1
    create_time: int

    model_config = {"from_attributes": True}


class TextbookVersionSchema(BaseModel):
    id: int
    name: str
    status: int = 1
    create_time: int

    model_config = {"from_attributes": True}


class KnowledgeSchema(BaseModel):
    id: str
    course_unit_id: int
    content: str
    analysis_text: Optional[str] = None
    analysis_audio: Optional[str] = None
    analysis_video: Optional[str] = None
    status: int = 1
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class CourseUnitSchema(BaseModel):
    id: int
    textbook_id: int
    name: str
    content: str
    status: int = 1
    create_time: int
    update_time: Optional[int] = None
    knowledges: Optional[List[KnowledgeSchema]] = None

    model_config = {"from_attributes": True}


class TextbookSchema(BaseModel):
    id: int
    subject: str
    version: str
    stage: str
    grade: int
    semester: int
    pdf: Optional[str] = None
    status: int = 1
    create_time: int
    course_units: Optional[List[CourseUnitSchema]] = None

    model_config = {"from_attributes": True}


class QuestionSchema(BaseModel):
    id: str
    type: Optional[str] = None
    content: str
    options: Optional[Dict] = None
    answer: Optional[str] = None
    knowledge_id: Optional[int] = None
    course_unit_id: int
    analysis_text: Optional[str] = None
    analysis_audio: Optional[str] = None
    analysis_video: Optional[str] = None
    grade: Optional[str] = None
    subject: Optional[str] = None
    source: Optional[str] = None
    image: Optional[str] = None
    status: int = 1
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class SolutionSchema(BaseModel):
    id: str
    user_id: str
    question_id: str
    last_hisotry_id: str = ""
    status: int = 0
    create_time: int
    update_time: Optional[int] = None

    model_config = {"from_attributes": True}


class SolutionHistorySchema(BaseModel):
    id: str
    user_id: str
    question_id: str
    solution_id: str
    thinking: Optional[str] = None
    answer: Optional[str] = None
    ai_score: Optional[int] = None
    ai_summary_text: Optional[str] = None
    ai_summary_audio: Optional[str] = None
    ai_summary_video: Optional[str] = None
    create_time: int

    model_config = {"from_attributes": True}


class SolutionMessageSchema(BaseModel):
    id: str
    last_message_id: str = ""
    user_id: str
    question_id: str
    solution_id: str
    type: Optional[str] = None
    role: Optional[str] = None
    model: Optional[str] = None
    thinking: Optional[str] = None
    content: Optional[str] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    ai_summary_video: Optional[str] = None
    create_time: int

    model_config = {"from_attributes": True}
