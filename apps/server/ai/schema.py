from enum import Enum
from typing import Any, List, Dict, NotRequired, Optional, TypedDict
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Question, Unit, Knowledge, Textbook


###  ---------------------------------- Qeution Schema ---------------------------------- ###


class GenerationType(str, Enum):
    """题目生成类型"""

    # 每日练习
    DAILY_PRACTICE = "daily_practice"
    # 单元练习
    UNIT_PRACTICE = "unit_practice"
    # 能力评估
    ASSESSTENT = "assessment"


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
    options: List[QuestionOption] = Field(
        description="题目选项列表，非选择题时可为空数组", default=[]
    )
    answer: str = Field(description="标准答案")
    difficulty: str = Field(description="题目难度：简单、普通、困难")
    knowledge: str = Field(description="知识点")


class QuestionGenerationResult(BaseModel):
    """题目生成结果模型"""

    questions: List[GeneratedQuestion] = []


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


class QuestionGenerateRequest(BaseModel):
    """题目生成请求"""

    type: str = Field(description="生成类型: daily_practice, unit_practice, assessment")
    count: int = Field(description="生成题目数量")
    textbook_id: int = Field(description="教材ID")
    unit_id: Optional[int] = Field(None, description="单元ID（单元练习时需要）")
    student_id: Optional[str] = Field(None, description="学生ID（每日练习时需要）")


class AudioAnswerAnalysisResponse(BaseModel):
    """音频答题分析响应"""

    text: str = Field(description="语音识别结果（转写文本）")
    match: bool = Field(description="是否匹配题目要求")
    analysis: str = Field(description="综合分析（包含原因和改进建议）")


class TextAnswerAnalysisResponse(BaseModel):
    """文本答题分析响应"""

    is_correct: bool = Field(description="答案是否正确")
    analysis: str = Field(description="分析内容，如果正确则给予鼓励，如果错误则说明原因和知识点 ")


###  ---------------------------------- Textbook Schema ---------------------------------- ###


class UnitContent(BaseModel):
    """单元内容模型"""

    unit_name: str = Field(description="单元名称")
    unit_content: str = Field(description="单元内容（文本和图片描述）")
    page_numbers: List[int] = Field(description="单元所在页码列表", default=[])
    images: List[str] = Field(description="单元相关图片的本地路径列表", default=[])


class UnitInfo(BaseModel):
    """单元信息模型（AI解析后）"""

    unit_name: str = Field(description="单元名称")
    unit_content: str = Field(description="单元内容摘要")
    topics: List[Dict[str, str]] = Field(
        description="知识点列表，每个知识点包含topic_name和topic_content"
    )


class UnitExtractionResult(BaseModel):
    """单元提取结果"""

    units: List[UnitInfo] = Field(description="单元信息列表")
