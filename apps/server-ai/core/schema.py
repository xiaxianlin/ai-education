from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class QuestionGenerateRequest(BaseModel):
    """题目生成请求"""

    type: str = Field(description="生成类型: daily_practice, unit_practice, assessment")
    count: int = Field(description="生成题目数量")
    textbook_id: int = Field(description="教材ID")
    unit_id: Optional[int] = Field(None, description="单元ID（单元练习时需要）")
    student_id: Optional[str] = Field(None, description="学生ID（每日练习时需要）")


class QuestionSchema(BaseModel):
    """题目 Schema"""

    id: int
    type: str
    subtype: Optional[str] = None
    subject: str
    grade: int
    content: str
    options: Optional[str] = None
    answer: Optional[str] = None
    resource: Optional[str] = None
    difficulty: Optional[str] = None
    resource_type: Optional[str] = None
    resource_content: Optional[str] = None
    textbook_id: int
    unit_id: Optional[int] = None
    knowledge: Optional[str] = None

    model_config = {"from_attributes": True}


class AudioAnswerAnalysisRequest(BaseModel):
    """音频答题分析请求"""

    audio_url: str = Field(description="音频URL")
    audio_type: str = Field(description="音频类型")


class AudioAnswerAnalysisResponse(BaseModel):
    """音频答题分析响应"""

    text: str = Field(description="语音识别结果（转写文本）")
    match: bool = Field(description="是否匹配题目要求")
    analysis: str = Field(description="综合分析（包含原因和改进建议）")


class TextAnswerAnalysisRequest(BaseModel):
    """文本答题分析请求"""

    text_answer: str = Field(description="学生答案")


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


class TextbookUploadRequest(BaseModel):
    """教材上传请求"""

    file_name: str = Field(description="教材文件名")
    file_path: str = Field(description="教材文件路径")
    old_file_id: Optional[str] = Field(None, description="旧文件ID（如果有的话）")
