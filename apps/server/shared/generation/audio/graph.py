"""Audio Generation Graph

LangGraph workflow definition for audio generation.
"""

from typing import Any, Dict
from loguru import logger
from langgraph.graph import END, StateGraph

from generation.audio.schema import AudioGenerationState
from generation.audio.services.generate import AudioGenerateService


def entry_node(state: AudioGenerationState) -> Dict[str, Any]:
    """入口节点，负责基础校验"""
    logger.info(
        f"进入音频生成工作流: text_length={len(state.get('text', ''))}, "
        f"language={state.get('language', 'Chinese')}"
    )

    if not state.get("text"):
        raise ValueError("文本内容 (text) 不能为空")

    return {}


async def generate_audio_node(state: AudioGenerationState) -> Dict[str, Any]:
    """生成音频节点"""
    logger.info("开始生成音频")

    text = state.get("text", "")
    voice = state.get("voice")
    language = state.get("language", "Chinese")

    audio_url = await AudioGenerateService.generate_tts(
        text=text,
        voice=voice,
        language=language,
    )

    logger.info(f"音频生成成功: {audio_url[:100]}...")
    return {"audio_url": audio_url}


async def upload_oss_node(state: AudioGenerationState) -> Dict[str, Any]:
    """上传到 OSS 节点"""
    oss_path = state.get("oss_path")
    audio_url = state.get("audio_url")

    if not oss_path:
        logger.info("未指定 OSS 路径，跳过上传")
        return {}

    if not audio_url:
        logger.warning("音频 URL 为空，无法上传")
        return {}

    logger.info(f"开始上传音频到 OSS: {oss_path}")
    final_path = await AudioGenerateService.upload(
        audio_url=audio_url,
        oss_path=oss_path,
    )
    logger.info(f"音频上传成功: {final_path}")
    return {"final_path": final_path, "audio_url": final_path}


def create_audio_generation_graph() -> StateGraph:
    """创建音频生成流程图"""
    workflow = StateGraph(AudioGenerationState)

    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("generate_audio", generate_audio_node)
    workflow.add_node("upload_oss", upload_oss_node)

    # 设置入口点
    workflow.set_entry_point("entry")

    # 添加边
    workflow.add_edge("entry", "generate_audio")
    workflow.add_edge("generate_audio", "upload_oss")
    workflow.add_edge("upload_oss", END)

    return workflow.compile()
