from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from ai.services.aliyun import AliyunAIService

ai_router = APIRouter(prefix="/ai")


class ASRRequest(BaseModel):
    """语音识别请求"""
    file_url: str = Field(description="音频文件 URL")
    language: str = Field(default="zh", description="语言代码，默认为中文(zh)")


class TTSRequest(BaseModel):
    """文本转语音请求"""
    text: str = Field(description="要转换的文本内容")
    voice: str = Field(default="Cherry", description="语音类型，默认为 Cherry")
    language: str = Field(default="English", description="语言类型，默认为 English")


class GenerateImageRequest(BaseModel):
    """图片生成请求"""
    text: str = Field(description="问题内容或图片生成提示词")
    width: Optional[int] = Field(default=None, description="图片宽度，默认不指定")
    height: Optional[int] = Field(default=None, description="图片高度，默认不指定")
    optimize_prompt: bool = Field(default=True, description="是否使用 LLM 优化提示词，默认为 True")


@ai_router.post("/asr")
async def asr(request: ASRRequest):
    """
    语音识别接口
    
    将音频文件转换为文本
    """
    result = AliyunAIService.asr(request.file_url, request.language)
    return {"text": result}


@ai_router.post("/tts")
async def tts(request: TTSRequest):
    """
    文本转语音接口
    
    将文本转换为语音文件
    """
    audio_url = AliyunAIService.tts(request.text, request.voice, request.language)
    return {"audio_url": audio_url}


@ai_router.post("/generate_image")
async def generate_image(request: GenerateImageRequest):
    """
    图片生成接口
    
    根据问题内容或文本提示词生成图片。
    如果 optimize_prompt 为 True，会使用 LLM 将问题内容优化为适合图片生成的提示词。
    """
    image_url = AliyunAIService.generate_image(
        request.text, request.width, request.height, request.optimize_prompt
    )
    return {"image_url": image_url}

