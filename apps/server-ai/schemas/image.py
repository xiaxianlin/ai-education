"""图片生成 API Schema"""
from pydantic import BaseModel, Field


class ImageGenerateRequest(BaseModel):
    """图片生成请求"""
    text: str = Field(description="图片生成提示词或题目内容")
    width: int = Field(default=1328, description="图片宽度")
    height: int = Field(default=1328, description="图片高度")
    optimize_prompt: bool = Field(default=True, description="是否优化提示词")


class ImageGenerateResponse(BaseModel):
    """图片生成响应"""
    image_url: str = Field(description="生成的图片 URL")

