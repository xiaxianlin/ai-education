"""
AI 服务提供者抽象基类
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import BaseOutputParser


class BaseProvider(ABC):
    """AI 服务提供者抽象基类"""

    @abstractmethod
    def get_openai_client(self) -> OpenAI:
        """
        返回 OpenAI 库实例

        Returns:
            OpenAI: OpenAI 客户端实例
        """
        pass

    @abstractmethod
    def get_langchain_client(self, **kwargs) -> ChatOpenAI:
        """
        返回 LangChain ChatOpenAI 实例

        Args:
            **kwargs: 额外的参数，如 model_name, temperature 等

        Returns:
            ChatOpenAI: LangChain 客户端实例
        """
        pass

    @abstractmethod
    def get_provider_client(self) -> Optional[Any]:
        """
        返回平台原生 SDK 实例，如果没有返回 None

        Returns:
            Optional[Any]: 平台原生 SDK 实例
        """
        pass

    @abstractmethod
    async def invoke_image_generate(
        self, prompt: str, width: Optional[int] = None, height: Optional[int] = None, **kwargs
    ) -> str:
        """
        图片生成

        Args:
            prompt: 图片生成提示词
            width: 图片宽度
            height: 图片高度
            **kwargs: 其他参数

        Returns:
            str: 图片 URL 或路径

        Raises:
            ProviderNotSupportedError: 如果不支持图片生成
            ProviderError: 调用失败
        """
        pass

    @abstractmethod
    async def invoke_video_generate(self, prompt: str, **kwargs) -> str:
        """
        视频生成

        Args:
            prompt: 视频生成提示词
            **kwargs: 其他参数

        Returns:
            str: 视频 URL 或路径

        Raises:
            ProviderNotSupportedError: 如果不支持视频生成
            ProviderError: 调用失败
        """
        pass

    @abstractmethod
    async def invoke_text_generate(self, prompt: str, **kwargs) -> str:
        """
        文本生成

        Args:
            prompt: 文本生成提示词
            **kwargs: 其他参数，如 max_tokens, temperature 等

        Returns:
            str: 生成的文本

        Raises:
            ProviderError: 调用失败
        """
        pass

    @abstractmethod
    async def invoke_chain(
        self, prompt: ChatPromptTemplate, inputs: Dict[str, Any], parser: Optional[BaseOutputParser] = None, **kwargs
    ) -> Any:
        """
        LangChain 链式调用

        Args:
            prompt: LangChain 提示词模板
            inputs: 输入参数
            parser: 输出解析器，可选
            **kwargs: 其他参数

        Returns:
            Any: 链式调用结果

        Raises:
            ProviderError: 调用失败
        """
        pass

    @abstractmethod
    async def invoke_tts(self, text: str, voice: Optional[str] = None, language: Optional[str] = None, **kwargs) -> str:
        """
        语音合成

        Args:
            text: 要转换的文本
            voice: 语音类型
            language: 语言类型
            **kwargs: 其他参数

        Returns:
            str: 音频 URL 或路径

        Raises:
            ProviderNotSupportedError: 如果不支持语音合成
            ProviderError: 调用失败
        """
        pass

    @abstractmethod
    async def invoke_asr(self, audio_data: bytes, **kwargs) -> str:
        """
        语音识别

        Args:
            audio_data: 音频数据
            **kwargs: 其他参数，如 format, language 等

        Returns:
            str: 识别的文本

        Raises:
            ProviderNotSupportedError: 如果不支持语音识别
            ProviderError: 调用失败
        """
        pass

    def get_name(self) -> str:
        """
        获取 Provider 名称

        Returns:
            str: Provider 名称
        """
        return self.__class__.__name__.replace("Provider", "").lower()
