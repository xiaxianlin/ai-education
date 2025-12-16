from typing import Optional

from pydantic import BaseModel, field_validator

from shared.core.constants import SEMESTERS, SUBJECTS, TEXTBOOK_VERSIONS
from shared.core.schema import SearchSchema
from shared.utils import validation


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

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v < 1:
            raise ValueError("管理员类型异常")
        return v


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
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v

    @field_validator("version")
    @classmethod
    def valid_version(cls, v):
        if v and v not in TEXTBOOK_VERSIONS:
            raise ValueError(f"版本只能选泽{'、'.join(TEXTBOOK_VERSIONS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        if v and v not in range(1, 13):
            raise ValueError("非法年级")
        return v

    @field_validator("semester")
    @classmethod
    def valid_semester(cls, v):
        if v and v not in SEMESTERS:
            raise ValueError(f"学期只能选择{'、'.join(SEMESTERS)}")
        return v


class SearchTextbookSchema(SearchSchema):
    version: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[str] = None


class SaveTeacherBookSchema(BaseModel):
    subject: str
    version: str
    grade: int
    semester: str

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v

    @field_validator("version")
    @classmethod
    def valid_version(cls, v):
        if v and v not in TEXTBOOK_VERSIONS:
            raise ValueError(f"版本只能选泽{'、'.join(TEXTBOOK_VERSIONS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        if v and v not in range(1, 13):
            raise ValueError("非法年级")
        return v

    @field_validator("semester")
    @classmethod
    def valid_semester(cls, v):
        if v and v not in SEMESTERS:
            raise ValueError(f"学期只能选择{'、'.join(SEMESTERS)}")
        return v


class SearchTeacherBookSchema(SearchSchema):
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
    unit_id: int
    name: str
    content: str


class UpdateKnowledgeSchema(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None


class UpdateQuestionSchema(BaseModel):
    subject: Optional[str] = None
    grade: Optional[int] = None
    type: Optional[str] = None
    subtype: Optional[str] = None
    content: Optional[str] = None
    options: Optional[str] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    knowledge: Optional[str] = None
    unit_id: Optional[int] = None
    textbook_id: Optional[int] = None


class SearchQuestionSchema(SearchSchema):
    question_id: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[int] = None
    type: Optional[str] = None
    resource_type: Optional[str] = None
    resource_generated: Optional[bool] = None


class CreateStudentSchema(BaseModel):
    name: str
    phone: str


class SaveStudentSubjectSchema(BaseModel):
    ids: list[int]


class UpdateStudentSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    grade: Optional[int] = None
    status: Optional[int] = None


class SearchStudentSchema(SearchSchema):
    phone: Optional[str] = None
    status: Optional[int] = None


class CreateQuestionTypeSchema(BaseModel):
    title: str  # 题型标题，如：看图选词、根据首字母填空
    scene: str  # 类型，如：选择题、填空题、判断题、口语题、应用题
    subject: str
    grade: int
    description: Optional[str] = None
    resource_type: Optional[str] = None
    prompt: Optional[str] = None  # 生成该题型的 AI 指令

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        if v and v not in range(1, 7):
            raise ValueError("年级只能选择1-6")
        return v

    @field_validator("resource_type")
    @classmethod
    def valid_resource_type(cls, v):
        if v and v not in ["image", "audio"]:
            raise ValueError("资源类型只能选择 image 或 audio")
        return v


class UpdateQuestionTypeSchema(BaseModel):
    title: Optional[str] = None
    scene: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    prompt: Optional[str] = None  # 生成该题型的 AI 指令

    @field_validator("resource_type")
    @classmethod
    def valid_resource_type(cls, v):
        if v is not None and v not in ["image", "audio", ""]:
            raise ValueError("资源类型只能选择 image、audio 或空字符串")
        return v


class SearchQuestionTypeSchema(BaseModel):
    scene: Optional[str] = None  # 按类型筛选
    subject: Optional[str] = None
    grade: Optional[int] = None


# ======================== Prompt 管理 ======================== #


class PromptDetailSchema(BaseModel):
    """提示词详情"""

    id: int
    name: str
    slug: str
    scene: str
    description: Optional[str] = None
    tags: list[str] = []

    version_id: int
    template_content: str
    negative_content: Optional[str] = None
    model_params: dict = {}
    changelog: Optional[str] = None
    is_published: int = 0

    create_time: int
    update_time: Optional[int] = None


class SavePromptSchema(BaseModel):
    """提示词表单"""

    name: str
    slug: str
    scene: str
    description: Optional[str] = None
    tags: list[str] = []
    template_content: str
    negative_content: Optional[str] = None
    model_params: dict = {}
    timeout: Optional[int] = None
    changelog: Optional[str] = None


class TestPromptSchema(BaseModel):
    """提示词测试表单"""

    version_id: int
    input_payload: dict = {}
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    model_params: dict = {}


class SearchPromptSchema(SearchSchema):
    name: Optional[str] = None
    slug: Optional[str] = None
    scene: Optional[str] = None
    tag: Optional[str] = None


class SearchPromptVersionSchema(SearchSchema):
    prompt_id: int
