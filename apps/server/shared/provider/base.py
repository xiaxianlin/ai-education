"""Base Provider 基类定义

定义统一的 AI 模型调用接口，所有平台 Provider 需要继承此类并实现具体方法。
"""

from abc import ABC, abstractmethod
from typing import Any, Optional

from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import BasePromptTemplate
from langchain_core.output_parsers import BaseOutputParser


class BaseProvider(ABC):
    """AI Provider 基类

    定义统一的 AI 模型调用接口，子类需要实现所有方法。
    如果某个平台不支持某个功能，应该抛出 NotImplementedError。
    """

    @abstractmethod
    def get_openai_client(self) -> OpenAI:
        """获取 OpenAI 客户端实例

        Returns:
            OpenAI: OpenAI 客户端实例，配置了 api_key 和 base_url
        """
        raise NotImplementedError("Subclass must implement get_openai_client()")

    @abstractmethod
    def get_langchain_client(
        self, model_name: str = None, temperature: float = 0.7
    ) -> ChatOpenAI:
        """获取 LangChain ChatOpenAI 客户端实例

        Args:
            model_name: 模型名称，如果为 None 则使用默认模型
            temperature: 温度参数，控制输出的随机性

        Returns:
            ChatOpenAI: LangChain ChatOpenAI 客户端实例
        """
        raise NotImplementedError("Subclass must implement get_langchain_client()")

    @abstractmethod
    def get_provider_client(self) -> Optional[Any]:
        """获取平台 SDK 客户端实例

        返回平台特定的 SDK 客户端类或实例。
        如果平台没有特定的 SDK 客户端，返回 None。

        Returns:
            平台 SDK 客户端实例或类，如果没有则返回 None
        """
        raise NotImplementedError("Subclass must implement get_provider_client()")

    @abstractmethod
    def invoke_image_generate(
        self, prompt: str, width: int = 1024, height: int = 1024, **kwargs
    ) -> str:
        """图片生成

        Args:
            prompt: 图片生成提示词
            width: 图片宽度，默认 1024
            height: 图片高度，默认 1024
            **kwargs: 其他平台特定参数

        Returns:
            str: 生成的图片 URL

        Raises:
            NotImplementedError: 如果平台不支持图片生成
            ValueError: 如果图片生成失败
        """
        raise NotImplementedError("Subclass must implement invoke_image_generate()")

    @abstractmethod
    def invoke_video_generate(self, prompt: str, **kwargs) -> str:
        """视频生成

        Args:
            prompt: 视频生成提示词
            **kwargs: 其他平台特定参数

        Returns:
            str: 生成的视频 URL

        Raises:
            NotImplementedError: 如果平台不支持视频生成
            ValueError: 如果视频生成失败
        """
        raise NotImplementedError("Subclass must implement invoke_video_generate()")

    @abstractmethod
    def invoke_text_generate(self, prompt: str, **kwargs) -> str:
        """文本生成

        Args:
            prompt: 文本生成提示词
            **kwargs: 其他平台特定参数

        Returns:
            str: 生成的文本内容

        Raises:
            NotImplementedError: 如果平台不支持文本生成
            ValueError: 如果文本生成失败
        """
        raise NotImplementedError("Subclass must implement invoke_text_generate()")

    @abstractmethod
    async def invoke_chain(
        self,
        prompt: BasePromptTemplate,
        parser: Optional[BaseOutputParser] = None,
        prompt_input: Optional[dict] = None,
    ) -> Any:
        """LangChain 链式调用

        Args:
            prompt: LangChain PromptTemplate 实例
            parser: 输出解析器，如果为 None 则不使用解析器
            prompt_input: Prompt 的输入参数

        Returns:
            解析后的结果（如果提供了 parser）或原始 LLM 响应

        Raises:
            NotImplementedError: 如果平台不支持链式调用
            ValueError: 如果链式调用失败
        """
        raise NotImplementedError("Subclass must implement invoke_chain()")

    @abstractmethod
    def invoke_tts(
        self,
        text: str,
        voice: str = None,
        language: str = "Chinese",
        **kwargs,
    ) -> str:
        """语音生成（TTS）

        Args:
            text: 要转换为语音的文本
            voice: 语音名称，如果为 None 则使用默认语音
            language: 语言类型，默认 "Chinese"
            **kwargs: 其他平台特定参数

        Returns:
            str: 生成的音频 URL

        Raises:
            NotImplementedError: 如果平台不支持 TTS
            ValueError: 如果 TTS 生成失败
        """
        raise NotImplementedError("Subclass must implement invoke_tts()")

    @abstractmethod
    def invoke_asr(self, audio_url: str, **kwargs) -> str:
        """语音识别（ASR）

        Args:
            audio_url: 音频文件的 URL
            **kwargs: 其他平台特定参数

        Returns:
            str: 识别出的文本内容

        Raises:
            NotImplementedError: 如果平台不支持 ASR
            ValueError: 如果 ASR 识别失败
        """
        raise NotImplementedError("Subclass must implement invoke_asr()")

