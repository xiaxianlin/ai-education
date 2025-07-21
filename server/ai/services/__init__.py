from typing import List, Dict, Any, AsyncGenerator, Optional
from ai.models.factory import ModelFactory


class AIService:
    """AI服务统一调用类"""

    def __init__(self):
        self._llm_provider = None
        self._asr_provider = None
        self._tts_provider = None
        self._vision_provider = None
        self._multi_provider = None

    @property
    def llm_provider(self):
        if self._llm_provider is None:
            self._llm_provider = ModelFactory.get_llm_provider()
        return self._llm_provider

    @property
    def asr_provider(self):
        if self._asr_provider is None:
            self._asr_provider = ModelFactory.get_asr_provider()
        return self._asr_provider

    @property
    def tts_provider(self):
        if self._tts_provider is None:
            self._tts_provider = ModelFactory.get_tts_provider()
        return self._tts_provider

    @property
    def vision_provider(self):
        if self._vision_provider is None:
            self._vision_provider = ModelFactory.get_vision_provider()
        return self._vision_provider

    @property
    def multi_provider(self):
        if self._multi_provider is None:
            self._multi_provider = ModelFactory.get_multi_provider()
        return self._multi_provider

    # LLM 相关方法
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """聊天对话"""
        return await self.llm_provider.chat(messages, **kwargs)

    async def stream_chat(
        self, messages: List[Dict[str, str]], **kwargs
    ) -> AsyncGenerator[str, None]:
        """流式聊天对话"""
        async for chunk in self.llm_provider.stream_chat(messages, **kwargs):
            yield chunk

    # ASR 相关方法
    async def transcribe_audio(self, audio_data: bytes, **kwargs) -> str:
        """语音转文字"""
        return await self.asr_provider.transcribe(audio_data, **kwargs)

    # TTS 相关方法
    async def synthesize_speech(self, text: str, **kwargs) -> bytes:
        """文字转语音"""
        return await self.tts_provider.synthesize(text, **kwargs)

    # Vision 相关方法
    async def analyze_image(self, image_data: bytes, prompt: str, **kwargs) -> str:
        """图像分析"""
        return await self.vision_provider.analyze_image(image_data, prompt, **kwargs)

    async def ocr_image(self, image_data: bytes, **kwargs) -> str:
        """光学字符识别"""
        return await self.vision_provider.ocr(image_data, **kwargs)

    # MultiModal 相关方法
    async def process_multimodal(self, inputs: List[Dict[str, Any]], **kwargs) -> str:
        """多模态处理"""
        return await self.multi_provider.process(inputs, **kwargs)

    # 便捷方法
    async def ask_question(self, question: str, context: Optional[str] = None, **kwargs) -> str:
        """提问"""
        messages = []
        if context:
            messages.append({"role": "system", "content": context})
        messages.append({"role": "user", "content": question})
        return await self.chat(messages, **kwargs)

    async def translate_text(self, text: str, target_language: str = "中文", **kwargs) -> str:
        """文本翻译"""
        prompt = f"请将以下文本翻译成{target_language}：\n{text}"
        return await self.ask_question(prompt, **kwargs)

    async def summarize_text(self, text: str, **kwargs) -> str:
        """文本摘要"""
        prompt = f"请总结以下文本的主要内容：\n{text}"
        return await self.ask_question(prompt, **kwargs)

    async def analyze_image_with_question(self, image_data: bytes, question: str, **kwargs) -> str:
        """根据问题分析图像"""
        return await self.analyze_image(image_data, question, **kwargs)

    # 重置provider（用于动态切换供应商）
    def reset_providers(self):
        """重置所有provider，下次使用时会重新创建"""
        self._llm_provider = None
        self._asr_provider = None
        self._tts_provider = None
        self._vision_provider = None
        self._multi_provider = None

    def reset_llm_provider(self):
        """重置LLM provider"""
        self._llm_provider = None

    def reset_asr_provider(self):
        """重置ASR provider"""
        self._asr_provider = None

    def reset_tts_provider(self):
        """重置TTS provider"""
        self._tts_provider = None

    def reset_vision_provider(self):
        """重置Vision provider"""
        self._vision_provider = None

    def reset_multi_provider(self):
        """重置MultiModal provider"""
        self._multi_provider = None


# 全局AI服务实例
ai_service = AIService()

from .pdf_processor import PDFProcessor

__all__ = [
    "ai_service",
    "AIService",
    "PDFProcessor",
]
