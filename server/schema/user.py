from typing import Optional
from pydantic import BaseModel, field_validator
from util import valid


class UserLogin(BaseModel):
    type: int
    account: str
    password: Optional[str] = None
    code: Optional[str] = None


class SendCode(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        return valid.phone(v)


class UserRegister(BaseModel):
    username: str
    password: str
    phone: str
    code: str

    @field_validator("username")
    @classmethod
    def valid_username(clas, v):
        return valid.username(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return valid.password(v)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        return valid.phone(v)


class Wechat(BaseModel):
    code: str
    openid: Optional[str] = None


class QuestionRequestSchema(BaseModel):
    """用户问题请求Schema"""
    # 筛选条件（至少选择一个）
    subject: Optional[str] = None
    course_unit_id: Optional[int] = None
    knowledge_id: Optional[int] = None
    textbook_id: Optional[int] = None
    grade: Optional[int] = None
    
    # 问题配置
    question_type: Optional[str] = None  # 问题类型筛选
    count: int = 10  # 需要的问题数量
    difficulty: Optional[str] = None  # 难度级别
    
    @field_validator("count")
    @classmethod
    def validate_count(cls, v):
        if v <= 0 or v > 50:
            raise ValueError("问题数量必须在1-50之间")
        return v


class QuestionBatchSchema(BaseModel):
    """批量问题响应Schema"""
    questions: list
    total: int
    from_database: int  # 来自数据库的问题数量
    generated: int      # AI生成的问题数量
    generation_task_id: Optional[str] = None  # 后台生成任务ID（如果有）


class QuestionGenerationRequestSchema(BaseModel):
    """AI问题生成请求Schema"""
    subject: str
    grade: int
    knowledge_content: str
    unit_content: Optional[str] = None
    question_types: list[str] = ["单选", "填空", "解答"]
    count: int = 5
    difficulty: str = "中等"
    
    @field_validator("count")
    @classmethod
    def validate_count(cls, v):
        if v <= 0 or v > 20:
            raise ValueError("生成问题数量必须在1-20之间")
        return v


class SubmissionSchema(BaseModel):
    """用户答题提交Schema"""
    question_id: str
    user_answer: str
    time_spent: int = 0  # 答题用时(秒)
    session_id: Optional[str] = None  # 测试会话ID


class TestSessionCreateSchema(BaseModel):
    """创建测试会话Schema"""
    session_name: str
    subject: Optional[str] = None
    grade: Optional[int] = None
    question_ids: list[str]  # 本次测试的问题ID列表
    
    @field_validator("question_ids")
    @classmethod
    def validate_question_ids(cls, v):
        if not v or len(v) == 0:
            raise ValueError("问题列表不能为空")
        if len(v) > 100:
            raise ValueError("单次测试问题数量不能超过100道")
        return v


class TestReportSchema(BaseModel):
    """测试报告Schema"""
    session_id: str
    session_name: str
    subject: Optional[str] = None
    grade: Optional[int] = None
    
    # 基本统计
    total_questions: int
    correct_count: int
    wrong_count: int
    accuracy_rate: float  # 正确率
    total_score: int
    max_score: int
    score_rate: float  # 得分率
    
    # 时间统计
    start_time: int
    end_time: int
    duration: int  # 总用时(秒)
    avg_time_per_question: float  # 平均每题用时
    
    # 详细分析
    question_analysis: list[dict]  # 每题分析
    knowledge_analysis: list[dict]  # 知识点分析
    difficulty_analysis: dict  # 难度分析
    type_analysis: dict  # 题型分析
    
    # AI分析和建议
    analysis: Optional[str] = None
    recommendations: Optional[str] = None
    
    create_time: int


class SubmissionBatchSchema(BaseModel):
    """批量提交Schema"""
    session_id: str
    submissions: list[SubmissionSchema]
    
    @field_validator("submissions")
    @classmethod
    def validate_submissions(cls, v):
        if not v or len(v) == 0:
            raise ValueError("提交列表不能为空")
        return v
