from core import settings
from ._base import OSS
from .ali import AliOSS


class OSSFactory:
    def get_service(platform: str = settings.OSS_PLATFORM) -> OSS:
        if platform == "ali":
            return AliOSS()

        raise ValueError("未找到 OSS 配置")
