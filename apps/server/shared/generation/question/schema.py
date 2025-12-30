from typing import Any, List, NotRequired, Optional, TypedDict

from pydantic import BaseModel, Field
from shared.core.database import Question, QuestionType
from sqlalchemy.ext.asyncio import AsyncSession


class GeneratedQuestion(BaseModel):
    """生成的题目模型 - 直接对应 Question 模型"""

    stem: dict = Field(description="题干")
    options: Optional[List[dict]] = Field(description="选项列表", default=None)
    blanks: Optional[List[dict]] = Field(description="填空位置配置", default=None)
    resources: Optional[List[dict]] = Field(description="资源列表", default=None)
    answer: dict = Field(description="答案配置")
    explanation: Optional[str] = Field(description="解析", default=None)
    difficulty: str = Field(description="题目难度：easy/medium/hard")
    cognitive_level: Optional[str] = Field(description="认知层次", default=None)
    knowledge_points: Optional[List[str]] = Field(description="知识点列表", default=None)
    ability_tags: Optional[List[str]] = Field(description="能力标签", default=None)


class QuestionGenerationResult(BaseModel):
    """题目生成结果模型 - LLM 返回的 JSON 结构"""

    questions: List[GeneratedQuestion] = Field(description="生成的题目列表")


class QuestionGenerationState(TypedDict, total=False):
    """题目生成流程的状态"""

    # ================= 外部传入状态 ================== #
    # 数据库会话
    db: AsyncSession
    # 题目类型编码
    question_type_code: str
    # 需要生成的数量
    count: int
    # 题目类型对象
    question_type: NotRequired[QuestionType]
    # 科目（从 QuestionType 获取）
    subject: NotRequired[str]
    # 年级（从 QuestionType 获取，取第一个）
    grade: NotRequired[int]

    # ================= 内部构建状态 ================== #
    # 生成的提示词 (ChatPromptTemplate)
    prompt: NotRequired[Any]
    # prompt 输入参数（用于格式化 prompt）
    prompt_input: NotRequired[dict[str, Any]]
    # JSON 输出解析器
    prompt_parser: NotRequired[Any]
    # 本次生成的题目列表
    generated_questions: NotRequired[List[Question]]
    # 去重后的题目列表（累积）
    unique_questions: NotRequired[List[Question]]
    # 循环次数
    loop_count: NotRequired[int]
