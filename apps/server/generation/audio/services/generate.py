"""Audio Generate Service

Business logic for audio generation (TTS).
"""

import requests
from typing import Optional
from loguru import logger

from shared.utils import oss
from shared.provider import get_provider


class AudioGenerateService:
    """音频生成服务"""

    @classmethod
    async def generate_tts(
        cls,
        text: str,
        voice: Optional[str] = None,
        language: str = "Chinese",
        model: str = "qwen3-tts-flash",
    ) -> str:
        """调用 provider 生成语音（TTS）

        Args:
            text: 要转换为语音的文本
            voice: 语音名称，如果为 None 则使用默认语音
            language: 语言类型
            model: 模型名称

        Returns:
            生成的音频 URL（临时 URL）
        """
        if not text or not text.strip():
            raise ValueError("文本内容不能为空")

        logger.info(f"开始文本转语音，文本长度: {len(text)}, 语言: {language}")
        logger.debug(f"文本内容: {text[:200]}...")

        provider = get_provider()
        audio_url = provider.invoke_tts(
            text=text,
            voice=voice or provider.default_tts_voice,
            language=language,
            model=model,
        )

        return audio_url

    @classmethod
    async def upload(
        cls,
        audio_url: str,
        oss_path: str,
    ) -> str:
        """下载音频并上传到 OSS

        Args:
            audio_url: 音频 URL
            oss_path: OSS 存储路径

        Returns:
            OSS 路径
        """
        response = requests.get(audio_url, stream=True)
        response.raise_for_status()
        oss.upload(oss_path, response.content)

        logger.info(f"音频上传成功: {oss_path}")
        return oss_path
