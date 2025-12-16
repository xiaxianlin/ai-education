"""
AI Provider 模块

提供统一的 AI 服务接口，支持多种 AI 平台。
"""

from typing import Optional
from loguru import logger

from shared.core.settings import envs
from .base import BaseProvider
from .aliyun import AliyunProvider
from .exceptions import ProviderError, ProviderConfigError, ProviderNotSupportedError


# Provider 注册表
PROVIDERS = {
    "aliyun": AliyunProvider,
    "dashscope": AliyunProvider,
}


def get_provider(
    platform: Optional[str] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None
) -> BaseProvider:
    """
    根据配置获取对应的 Provider 实例
    
    Args:
        platform: AI 平台名称，如果不提供则从环境变量读取
        api_key: API 密钥，如果不提供则从环境变量读取
        base_url: API 基础 URL，如果不提供则从环境变量读取
        
    Returns:
        BaseProvider: Provider 实例
        
    Raises:
        ProviderConfigError: 配置错误
        ProviderNotSupportedError: 不支持的平台
    """
    # 使用传入参数或默认配置
    platform = platform or envs.AI_PLATFORM
    api_key = api_key or envs.AI_PLATFORM_KEY
    base_url = base_url or envs.AI_PLATFORM_URL
    
    if not platform:
        raise ProviderConfigError("AI_PLATFORM 配置缺失")
    
    if not api_key:
        raise ProviderConfigError("AI_PLATFORM_KEY 配置缺失")
    
    # 获取 Provider 类
    provider_class = PROVIDERS.get(platform.lower())
    if not provider_class:
        raise ProviderNotSupportedError(f"平台 '{platform}'", "provider")
    
    # 创建 Provider 实例
    provider = provider_class(
        api_key=api_key,
        base_url=base_url
    )
    
    logger.info(f"成功创建 AI Provider: {provider.get_name()}")
    return provider


def register_provider(name: str, provider_class: type):
    """
    注册新的 Provider
    
    Args:
        name: Provider 名称
        provider_class: Provider 类，必须继承自 BaseProvider
    """
    if not issubclass(provider_class, BaseProvider):
        raise ValueError("Provider 类必须继承自 BaseProvider")
    
    PROVIDERS[name.lower()] = provider_class
    logger.info(f"成功注册 Provider: {name}")


def get_available_providers() -> list[str]:
    """
    获取所有可用的 Provider 名称
    
    Returns:
        list[str]: Provider 名称列表
    """
    return list(PROVIDERS.keys())


__all__ = [
    "BaseProvider",
    "AliyunProvider", 
    "get_provider",
    "register_provider",
    "get_available_providers",
    "ProviderError",
    "ProviderNotSupportedError", 
    "ProviderConfigError",
]
