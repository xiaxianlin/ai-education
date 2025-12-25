"""Image Generation Module

Provider-based image generation workflow using LangGraph.
"""

import time
import requests
from typing import Optional
from loguru import logger

from shared.utils import oss
from shared.provider import get_provider
from shared.services.prompt import PromptService
from generation.image.schema import ImageGenerationState
from .graph import create_image_generation_graph

app = create_image_generation_graph()


async def invoke_image_workflow(
    *,
    prompt: str,
    width: int = 1328,
    height: int = 1328,
    optimize_prompt: bool = True,
    oss_path: Optional[str] = None,
    db=None,
) -> str:
    """执行图片生成流程

    Args:
        prompt: 图片生成提示词
        width: 图片宽度，默认 1328
        height: 图片高度，默认 1328
        optimize_prompt: 是否使用 LLM 优化提示词，默认 True
        oss_path: OSS 存储路径，如果为 None 则不上传
        db: 数据库会话，用于动态加载提示词（优化提示词时需要）

    Returns:
        str: 生成的图片 URL 或 OSS 路径
    """

    start_time = time.time()

    initial_state = ImageGenerationState(
        prompt=prompt,
        width=width,
        height=height,
        optimize_prompt=optimize_prompt,
        oss_path=oss_path,
        db=db,
    )

    try:
        result = await app.ainvoke(initial_state)
        image_url = result.get("image_url", "")

        # 计算生成时长
        elapsed_time = time.time() - start_time

        logger.info(
            "图片生成完成 | width={width} | height={height} | "
            "optimize_prompt={optimize_prompt} | 耗时={elapsed_time:.2f}秒",
            width=width,
            height=height,
            optimize_prompt=optimize_prompt,
            elapsed_time=elapsed_time,
        )

        return image_url

    except Exception as e:
        elapsed_time = time.time() - start_time

        logger.error(
            "图片生成失败 | width={width} | height={height} | "
            "耗时={elapsed_time:.2f}秒 | 错误={error}",
            width=width,
            height=height,
            elapsed_time=elapsed_time,
            error=str(e),
        )
        raise e


__all__ = ["invoke_image_workflow"]
