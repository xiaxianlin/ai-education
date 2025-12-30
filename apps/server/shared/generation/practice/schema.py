from typing import Any, List, NotRequired, TypedDict

from pydantic import BaseModel, Field
from shared.core.database import Knowledge, PracticeSession, Textbook, Unit
from shared.core.database import Question
from sqlalchemy.ext.asyncio import AsyncSession


class QuestionOption(BaseModel):
    """题目选项模型"""

    label: str = Field(description="选项标签，如 A/B/C/D")
    text: str = Field(description="选项内容")


class GeneratedQuestion(BaseModel):
    """生成的题目模型"""

    question_type: str = Field(description="大题型")
    question_subtype: str = Field(description="小题型")
    question: str = Field(description="题干内容")
    options: List[QuestionOption] = Field(
        description="题目选项列表，非选择题时可为空数组", default=[]
    )
    resource_type: str = Field(description="资源类型：image/audio", default="")
    resource_content: str = Field(description="生成资源需要的描述和文案", default="")
    answer: str = Field(description="标准答案", default="")
    difficulty: str = Field(description="题目难度：简单、普通、困难")
    knowledge: list[str] = Field(description="知识点里边", default=[])


class QuestionGenerationResult(BaseModel):
    """题目生成结果模型 - LLM 返回的 JSON 结构"""

    questions: List[GeneratedQuestion] = Field(description="生成的题目列表")


class QuestionGenerationState(TypedDict, total=False):
    """问题生成流程的状态"""

    # ================= 外部传入状态 ================== #
    # 数据库会话
    db: AsyncSession
    # 练习会话
    session: PracticeSession
    # 教材模型
    textbook: Textbook
    # 单元列表
    units: list[Unit]
    # 题型列表
    question_types: dict[str, list[str]]
    # 知识点列表
    knowledges: NotRequired[list[Knowledge]]

    # ================= 内部构建状态 ================== #
    # 生成的提示词 (ChatPromptTemplate)
    prompt: NotRequired[Any]
    # prompt 输入参数（用于格式化 prompt）
    prompt_input: NotRequired[dict[str, Any]]
    # JSON 输出解析器
    prompt_parser: NotRequired[Any]
    # 召回的题目列表
    recall_questions: NotRequired[List[Question]]
    # 生成的题目列表
    generated_questions: NotRequired[List[Question]]
    # 题目对象列表
    questions: NotRequired[List[Question]]
