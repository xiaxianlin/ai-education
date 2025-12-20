"""Video Generation Graph

LangGraph workflow definition for video generation.
"""

from typing import Any, Dict
from loguru import logger
from langgraph.graph import END, StateGraph

from generation.video.schema import VideoGenerationState
from generation.video.services.generate import VideoGenerateService


def entry_node(state: VideoGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验"""
    logger.info(
        f"进入视频生成工作流: prompt_length={len(state.get('prompt', ''))}, "
        f"duration={state.get('duration', 5)}s"
    )

    if not state.get("prompt"):
        raise ValueError("提示词 (prompt) 不能为空")

    return {}


async def generate_video_node(state: VideoGenerationState) -> Dict[str, Any]:
    """生成视频节点"""
    logger.info("开始生成视频")

    prompt = state.get("prompt", "")
    duration = state.get("duration", 5)

    video_url = await VideoGenerateService.generate(
        prompt=prompt,
        duration=duration,
    )

    logger.info(f"视频生成成功: {video_url[:100]}...")
    return {"video_url": video_url}


async def upload_oss_node(state: VideoGenerationState) -> Dict[str, Any]:
    """上传到 OSS 节点"""
    oss_path = state.get("oss_path")
    video_url = state.get("video_url")

    if not oss_path:
        logger.info("未指定 OSS 路径，跳过上传")
        return {}

    if not video_url:
        logger.warning("视频 URL 为空，无法上传")
        return {}

    logger.info(f"开始上传视频到 OSS: {oss_path}")
    final_path = await VideoGenerateService.upload(
        video_url=video_url,
        oss_path=oss_path,
    )
    logger.info(f"视频上传成功: {final_path}")
    return {"final_path": final_path, "video_url": final_path}


def create_video_generation_graph() -> StateGraph:
    """创建视频生成流程图"""
    workflow = StateGraph(VideoGenerationState)

    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("generate_video", generate_video_node)
    workflow.add_node("upload_oss", upload_oss_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加边
    workflow.add_edge("entry", "generate_video")
    workflow.add_edge("generate_video", "upload_oss")
    workflow.add_edge("upload_oss", END)

    return workflow.compile()
