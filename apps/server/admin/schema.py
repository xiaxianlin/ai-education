from typing import Optional, Any

from pydantic import BaseModel, Field, field_validator

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
    username: str = Field(..., min_length=1, max_length=255, description="用户名")
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


class SearchTextbookSchema(BaseModel):
    """教材搜索（无分页）"""

    version: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[int] = None


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


class CreateQuestionSchema(BaseModel):
    subject: str
    grade: int
    type: str
    subtype: str
    content: str
    options: Optional[str] = None
    answer: str
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
    title: str = Field(..., min_length=1, max_length=100, description="题型标题，如：看图选词、根据首字母填空")
    scene: str = Field(..., min_length=1, max_length=50, description="类型，如：选择题、填空题、判断题、口语题、应用题")
    subject: str = Field(..., min_length=1, max_length=50)
    grade: int
    description: Optional[str] = Field(None, max_length=500, description="题型描述")
    resource_type: Optional[str] = Field(None, max_length=50)
    prompt: Optional[str] = Field(None, max_length=2000, description="生成该题型的 AI 指令")

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
    type: str
    description: Optional[str] = None

    last_version_id: int
    version_id: int
    template_content: str
    negative_content: Optional[str] = None
    model_params: Optional[dict] = None
    changelog: Optional[str] = None
    is_published: int = 0

    create_time: int
    update_time: Optional[int] = None


class SavePromptSchema(BaseModel):
    """提示词表单"""

    name: str = Field(..., min_length=1, max_length=128, description="Prompt 名称")
    slug: str = Field(..., min_length=1, max_length=128, description="唯一短名")
    type: str = Field(..., min_length=1, max_length=64, description="类型：system/user")
    description: Optional[str] = Field(None, max_length=1000, description="描述")
    tags: list[str] = []
    template_content: str = Field(..., min_length=1, description="模版内容")
    negative_content: Optional[str] = Field(None, max_length=2000, description="用于图像生成类")
    model_params: dict = {}
    timeout: Optional[int] = None


class PublishPromptSchema(BaseModel):
    """提示词发布表单"""

    changelog: str


class TestPromptSchema(BaseModel):
    """提示词测试表单"""

    input_payload: dict = {}
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    model_params: dict = {}
    generation_type: Optional[str] = "text"

    @field_validator("generation_type")
    @classmethod
    def validate_generation_type(cls, v):
        allowed_types = ["text", "image", "video", "audio"]
        if v and v not in allowed_types:
            raise ValueError(f"生成类型只能选择 {', '.join(allowed_types)}")
        return v or "text"


class SearchPromptSchema(SearchSchema):
    name: Optional[str] = None
    slug: Optional[str] = None
    type: Optional[str] = None


class SearchPromptVersionSchema(SearchSchema):
    prompt_id: int


# ======================== 练习管理 ======================== #


class SavePracticeSchema(BaseModel):
    """保存练习"""

    name: str = Field(..., min_length=1, max_length=100, description="练习名称")
    slug: str = Field(..., min_length=1, max_length=100, description="练习标识")
    icon: Optional[str] = Field(None, max_length=255, description="图标URL")
    description: Optional[str] = Field(None, max_length=500, description="描述")
    type: str = Field(..., min_length=1, max_length=20, description="类型：system/custom")
    config: dict = {}  # 配置信息

    @field_validator("type")
    @classmethod
    def valid_type(cls, v):
        if v not in ["system", "custom"]:
            raise ValueError("类型只能是 system 或 custom")
        return v

    @field_validator("slug")
    @classmethod
    def valid_slug(cls, v):
        if not v or not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("标识只能包含字母、数字、下划线和连字符")
        return v


class SearchPracticeSchema(SearchSchema):
    """搜索练习"""

    name: Optional[str] = None
    slug: Optional[str] = None
    type: Optional[str] = None


# ======================== 练习参数配置 ======================== #


class PracticeParameterSchema(BaseModel):
    """练习参数配置 Schema"""

    key: str = Field(..., min_length=1, description="参数标识")
    type: str = Field(..., description="参数类型：system/input")
    description: str = Field(default="", description="参数描述")
    value: Any = Field(default=None, description="参数值（字符串格式）")
    required: bool = Field(default=False, description="是否必填")
    value_type: str = Field(..., description="值类型：string/number/object/array")

    @field_validator("type")
    @classmethod
    def valid_type(cls, v):
        if v not in ["system", "input"]:
            raise ValueError("参数类型只能是 system 或 input")
        return v

    @field_validator("value_type")
    @classmethod
    def valid_value_type(cls, v):
        if v not in ["string", "number", "object", "array"]:
            raise ValueError("值类型只能是 string、number、object 或 array")
        return v

    @field_validator("value")
    @classmethod
    def valid_value(cls, v, info):
        """验证 value 格式"""
        value_type = info.data.get("value_type")
        if not value_type:
            return v

        if value_type == "array" and not isinstance(v, list):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是列表")

        if value_type == "object" and not isinstance(v, dict):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是对象")

        if value_type == "number" and not isinstance(v, (int, float)):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是数字")

        if value_type == "string" and not isinstance(v, str):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是字符串")

        if value_type == "boolean" and not isinstance(v, bool):
            raise ValueError(f"当 value_type 为 {value_type} 时，value 必须是布尔值")

        return v


# ======================== 练习提示词管理 ======================== #


class SavePracticePromptSchema(BaseModel):
    """保存练习提示词关联"""

    subject: str
    grade: int
    practice_slug: str
    prompt_slug: str

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, v):
        if v and v not in SUBJECTS:
            raise ValueError(f"科目只能选择{'、'.join(SUBJECTS)}")
        return v

    @field_validator("grade")
    @classmethod
    def valid_grade(cls, v):
        if v and v not in range(1, 13):
            raise ValueError("非法年级")
        return v


class SearchPracticePromptSchema(SearchSchema):
    """搜索练习提示词关联"""

    subject: Optional[str] = None
    grade: Optional[int] = None
    prompt_slug: Optional[str] = None
    practice_slug: Optional[str] = None
