"""
Provider 异常类
"""


class ProviderError(Exception):
    """Provider 通用异常"""
    pass


class ProviderConfigError(ProviderError):
    """Provider 配置异常"""
    pass


class ProviderNotSupportedError(ProviderError):
    """Provider 功能不支持异常"""
    
    def __init__(self, feature: str, platform: str):
        self.feature = feature
        self.platform = platform
        super().__init__(f"{platform} 平台不支持 {feature} 功能")
