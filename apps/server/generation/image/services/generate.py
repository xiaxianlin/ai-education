"""Image Generate Service

Business logic for image generation.
"""

import requests
from typing import Optional
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from shared.utils import oss
from shared.provider import get_provider
from shared.services.prompt import PromptService


class ImageGenerateService:
    """图片生成服务"""

    @classmethod
    async def optimize_prompt(
        cls,
        text: str,
        db: Optional[AsyncSession] = None,
    ) -> str:
        """使用 LLM 优化图片生成提示词

        Args:
            text: 原始提示词文本
            db: 数据库会话，用于动态加载提示词

        Returns:
            优化后的提示词
        """
        if not text or not text.strip():
            logger.warning("输入文本为空，返回默认提示词")
            return "卡通风格，简单背景，明亮色彩，适合小学生"

        # 清理输入文本
        prompt_content = text.strip()
        logger.debug(f"开始优化图片提示词，原始文本长度: {len(prompt_content)}")

        try:
            # 使用 PromptService 获取 prompt
            prompt = await PromptService.get_image_optimize_prompt(db=db)

            # 使用 provider 调用
            provider = get_provider()
            result = provider.invoke_chain(
                prompt=prompt,
                prompt_input={"question_content": prompt_content},
            )

            # 提取优化后的提示词
            if isinstance(result, str):
                optimized_prompt = result.strip()
            elif hasattr(result, "content"):
                optimized_prompt = result.content.strip()
            elif isinstance(result, dict) and "content" in result:
                optimized_prompt = result["content"].strip()
            else:
                logger.error(f"LLM 返回结果格式异常: {type(result)}, 内容: {result}")
                raise ValueError(f"LLM 返回结果格式错误: {type(result).__name__}")

            # 验证结果
            if not optimized_prompt:
                logger.error("LLM 返回的提示词为空")
                raise ValueError("LLM 返回的提示词为空，请重试")

            return optimized_prompt

        except Exception as e:
            logger.error(f"优化图片提示词失败: {e}")
            # 如果 LLM 调用失败，返回一个基础的提示词作为降级方案
            logger.warning("LLM 调用失败，使用降级方案")
            fallback_prompt = (
                f"卡通风格，简单背景，明亮色彩，适合小学生，{prompt_content[:50]}"
            )
            return fallback_prompt

    @classmethod
    async def generate(
        cls,
        prompt: str,
        width: int = 1328,
        height: int = 1328,
        model: str = "qwen-image-plus",
    ) -> str:
        """调用 provider 生成图片

        Args:
            prompt: 图片生成提示词
            width: 图片宽度
            height: 图片高度
            model: 模型名称

        Returns:
            生成的图片 URL（临时 URL）
        """
        logger.info(f"开始生成图片，尺寸: {width}x{height}, 提示词长度: {len(prompt)}")

        provider = get_provider()
        image_url = provider.invoke_image_generate(
            prompt=prompt,
            width=width,
            height=height,
            model=model,
            negative_prompt="",
            prompt_extend=True,
        )

        return image_url

    @classmethod
    async def upload(
        cls,
        image_url: str,
        oss_path: str,
    ) -> str:
        """下载图片并上传到 OSS

        Args:
            image_url: 图片 URL
            oss_path: OSS 存储路径

        Returns:
            OSS 路径
        """
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
        oss.upload(oss_path, response.content)

        logger.info(f"图片上传成功: {oss_path}")
        return oss_path
