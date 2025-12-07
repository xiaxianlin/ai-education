from typing import List, Dict
from pydantic import Field
from pydantic import BaseModel, Field


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
