"""Video Generate Service

Business logic for video generation.
"""

import requests
from loguru import logger

from shared.utils import oss
from shared.provider import get_provider


class VideoGenerateService:
    """视频生成服务"""

    @classmethod
    async def generate(
        cls,
        prompt: str,
        duration: int = 5,
    ) -> str:
        """调用 provider 生成视频

        Args:
            prompt: 视频生成提示词
            duration: 视频时长（秒）

        Returns:
            生成的视频 URL（临时 URL）

        Note:
            如果 provider 不支持视频生成，将抛出 NotImplementedError。
        """
        if not prompt or not prompt.strip():
            raise ValueError("提示词内容不能为空")

        logger.info(f"开始生成视频，提示词长度: {len(prompt)}, 时长: {duration}s")

        provider = get_provider()
        video_url = provider.invoke_video_generate(
            prompt=prompt,
            duration=duration,
        )

        return video_url

    @classmethod
    async def upload(
        cls,
        video_url: str,
        oss_path: str,
    ) -> str:
        """下载视频并上传到 OSS

        Args:
            video_url: 视频 URL
            oss_path: OSS 存储路径

        Returns:
            OSS 路径
        """
        response = requests.get(video_url, stream=True)
        response.raise_for_status()
        oss.upload(oss_path, response.content)

        logger.info(f"视频上传成功: {oss_path}")
        return oss_path
