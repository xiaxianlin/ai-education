"""
Provider 模块异常类
"""


class ProviderError(Exception):
    """Provider 调用异常"""
    pass


class ProviderNotSupportedError(NotImplementedError):
    """不支持的功能异常"""
    
    def __init__(self, feature: str, provider: str):
        self.feature = feature
        self.provider = provider
        message = f"Provider '{provider}' 不支持功能: {feature}"
        super().__init__(message)


class ProviderConfigError(ValueError):
    """Provider 配置错误"""
    pass
