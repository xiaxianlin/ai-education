"""问题生成相关的类型定义"""

from enum import Enum
from typing import Any, List, NotRequired, TypedDict

from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Question, Unit, Knowledge, Textbook


class QuestionOption(BaseModel):
    label: str = Field(description="选项标签，如 A/B/C/D")
    text: str = Field(description="选项内容")


class GeneratedQuestion(BaseModel):
    question_type: str = Field(description="题型（主类型）")
    question_subtype: str = Field(description="题目子类型", default="")
    question: str = Field(description="题干内容")
    resource_content: str = Field(description="资源内容（录音文本等，仅录音题需要）", default="")
    options: List[QuestionOption] = Field(
        description="题目选项列表，非选择题时可为空数组", default=[]
    )
    answer: str = Field(description="标准答案")
    difficulty: str = Field(description="题目难度：简单、普通、困难")
    knowledge: str = Field(description="知识点")


class QuestionGenerationResult(BaseModel):
    questions: List[GeneratedQuestion] = []


class GenerationType(str, Enum):
    """题目生成类型"""

    # 单元生成
    UNIT = "unit"
    # 教材生成
    TEXTBOOK = "textbook"
    # 每日练习
    DAILY_PRACTICE = "daily_practice"
    # 单元练习
    UNIT_PRACTICE = "unit_practice"
    # 能力评估
    ASSESSTENT = "assessment"


class QuestionGenerationState(TypedDict, total=False):
    """问题生成流程的状态"""

    # 数据库会话
    db: AsyncSession
    # 问题生成类型
    type: GenerationType
    # 需要生成的题目数量
    count: int
    # 教材对象
    textbook: Textbook
    # 学生 ID，每日练习需要
    student_id: str
    # 单元模型
    unit: NotRequired[Unit]
    # 单元模型列表
    units: NotRequired[list[Unit]]
    # 知识点模型列表
    knowledges: NotRequired[list[Knowledge]]
    # 召回的题目列表
    recall_questions: NotRequired[List[Question]]
    # 生成的提示词 (ChatPromptTemplate)
    prompt: NotRequired[Any]
    # prompt 输入参数（用于格式化 prompt）
    prompt_input: NotRequired[dict[str, Any]]
    # JSON 输出解析器
    parser: NotRequired[Any]
    # LLM 生成的题目列表
    generated_questions: NotRequired[List[GeneratedQuestion]]
    # 题目对象列表
    questions: NotRequired[List[Question]]

    image_questions: NotRequired[List[Question]]
    audio_questions: NotRequired[List[Question]]
    text_questions: NotRequired[List[Question]]
