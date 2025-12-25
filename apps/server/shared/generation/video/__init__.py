"""Video Generation Module

Provider-based video generation workflow using LangGraph.
Note: Video generation may not be supported by all providers.
"""

import time
from typing import Optional
from loguru import logger

from generation.video.schema import VideoGenerationState
from .graph import create_video_generation_graph

app = create_video_generation_graph()


async def invoke_video_workflow(
    *,
    prompt: str,
    duration: int = 5,
    oss_path: Optional[str] = None,
) -> str:
    """执行视频生成流程

    Args:
        prompt: 视频生成提示词
        duration: 视频时长（秒），默认 5 秒
        oss_path: OSS 存储路径，如果为 None 则不上传

    Returns:
        str: 生成的视频 URL 或 OSS 路径

    Note:
        视频生成功能可能不被所有 provider 支持，
        如果 provider 不支持将抛出 NotImplementedError。
    """

    start_time = time.time()

    initial_state = VideoGenerationState(
        prompt=prompt,
        duration=duration,
        oss_path=oss_path,
    )

    try:
        result = await app.ainvoke(initial_state)
        video_url = result.get("video_url", "")

        # 计算生成时长
        elapsed_time = time.time() - start_time

        logger.info(
            "视频生成完成 | duration={duration}s | "
            "耗时={elapsed_time:.2f}秒",
            duration=duration,
            elapsed_time=elapsed_time,
        )

        return video_url

    except Exception as e:
        elapsed_time = time.time() - start_time

        logger.error(
            "视频生成失败 | duration={duration}s | "
            "耗时={elapsed_time:.2f}秒 | 错误={error}",
            duration=duration,
            elapsed_time=elapsed_time,
            error=str(e),
        )
        raise e


__all__ = ["invoke_video_workflow"]
