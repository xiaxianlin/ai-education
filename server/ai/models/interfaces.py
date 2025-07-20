from abc import abstractmethod
from typing import List, Dict, Any, AsyncGenerator
from .base import BaseProvider


class LLMProvider(BaseProvider):
    """大语言模型供应商接口"""
    
    @abstractmethod
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """聊天对话"""
        pass
    
    @abstractmethod
    async def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        """流式聊天对话"""
        pass


class ASRProvider(BaseProvider):
    """语音识别供应商接口"""
    
    @abstractmethod
    async def transcribe(self, audio_data: bytes, **kwargs) -> str:
        """语音转文字"""
        pass


class TTSProvider(BaseProvider):
    """语音合成供应商接口"""
    
    @abstractmethod
    async def synthesize(self, text: str, **kwargs) -> bytes:
        """文字转语音"""
        pass


class VisionProvider(BaseProvider):
    """视觉模型供应商接口"""
    
    @abstractmethod
    async def analyze_image(self, image_data: bytes, prompt: str, **kwargs) -> str:
        """图像分析"""
        pass
    
    @abstractmethod
    async def ocr(self, image_data: bytes, **kwargs) -> str:
        """光学字符识别"""
        pass


class MultiModalProvider(BaseProvider):
    """多模态模型供应商接口"""
    
    @abstractmethod
    async def process(self, inputs: List[Dict[str, Any]], **kwargs) -> str:
        """多模态处理"""
        pass