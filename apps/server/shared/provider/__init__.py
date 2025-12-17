"""AI Provider 模块

提供统一的 AI 模型调用接口，支持多个 AI 平台。
"""

from typing import Optional

from shared.core.settings import envs
from .base import BaseProvider
from .aliyun import AliyunProvider


def get_provider(platform: Optional[str] = None) -> BaseProvider:
    """根据配置获取对应的 Provider 实例

    Args:
        platform: 平台标识，如果为 None 则从配置中读取
            - "aliyun" 或 "dashscope": 阿里云百炼AI

    Returns:
        BaseProvider: Provider 实例

    Raises:
        ValueError: 如果平台不支持

    Examples:
        >>> provider = get_provider()
        >>> image_url = provider.invoke_image_generate("a cat")
        >>> audio_url = provider.invoke_tts("Hello world")
    """
    if platform is None:
        platform = envs.AI_PLATFORM

    platform = platform.lower() if platform else ""

    if platform in ("aliyun", "dashscope"):
        return AliyunProvider()
    else:
        raise ValueError(f"Unsupported AI platform: {platform}. " f"Supported platforms: aliyun, dashscope")


__all__ = ["BaseProvider", "AliyunProvider", "get_provider"]
