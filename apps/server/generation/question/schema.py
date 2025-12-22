from enum import Enum
from typing import Any, List, Dict, NotRequired, Optional, TypedDict
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Question, Unit, Knowledge, Textbook, Practice


class GenerationType(str, Enum):
    """题目生成类型枚举"""

    DAILY_PRACTICE = "daily_practice"
    UNIT_PRACTICE = "unit_practice"
    ASSESSMENT = "assessment"


class QuestionOption(BaseModel):
    """题目选项模型"""

    label: str = Field(description="选项标签，如 A/B/C/D")
    text: str = Field(description="选项内容")


class GeneratedQuestion(BaseModel):
    """生成的题目模型"""

    question_type: str = Field(description="题型（主类型）")
    question_subtype: str = Field(description="题目子类型", default="")
    question: str = Field(description="题干内容")
    resource_content: str = Field(description="资源内容（录音文本等，仅录音题需要）", default="")
    options: List[QuestionOption] = Field(description="题目选项列表，非选择题时可为空数组", default=[])
    answer: str = Field(description="标准答案")
    difficulty: str = Field(description="题目难度：简单、普通、困难")
    knowledge: str = Field(description="知识点")


class QuestionGenerationResult(BaseModel):
    """题目生成结果模型 - LLM 返回的 JSON 结构"""

    questions: List[GeneratedQuestion] = Field(description="生成的题目列表")


class UnitInfo(BaseModel):
    """单元信息模型"""

    unit_name: str = Field(description="单元名称")
    unit_content: str = Field(description="单元内容摘要")
    topics: List[Dict[str, str]] = Field(
        description="知识点列表，每个知识点包含 topic_name 和 topic_content", default=[]
    )


class UnitExtractionResult(BaseModel):
    """单元提取结果模型 - LLM 返回的 JSON 结构"""

    units: List[UnitInfo] = Field(description="提取的单元列表")


class QuestionGenerateRequest(BaseModel):
    """题目生成请求"""

    student_id: Optional[str] = Field(None, description="学生ID（日常练习时需要）")
    slug: str = Field(description="练习唯一标识")


class QuestionGenerationState(TypedDict, total=False):
    """问题生成流程的状态"""

    # 数据库会话
    db: AsyncSession
    # 练习标识（用于查询 Practice）
    slug: str
    # 练习对象
    practice: Practice
    # 练习配置（包含 generate_count 等）
    practice_config: dict[str, Any]
    # 需要生成的题目数量（从 practice_config 获取，为了兼容服务类保留）
    count: int
    # 教材对象
    textbook: Textbook
    # 学生 ID，日常练习需要
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
