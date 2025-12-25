"""Audio Generation Graph

LangGraph workflow definition for audio generation.
"""

import requests
from typing import Any, Dict, NotRequired, TypedDict
from loguru import logger
from langgraph.graph import END, StateGraph
from shared.utils import oss
from shared.provider import BaseProvider, get_provider


class AudioGenerationState(TypedDict, total=False):
    """音频生成流程的状态"""

    # 要转换为语音的文本
    text: str
    # OSS 存储路径
    oss_path: str
    # 语言类型
    language: str
    # 语音名称
    voice: NotRequired[str]
    # AI 功能提供商
    provider: NotRequired[BaseProvider]
    # 生成的音频 URL（临时 URL）
    audio_url: NotRequired[str]


def entry_node(state: AudioGenerationState):
    """入口节点，负责基础校验"""

    if not state.get("text"):
        raise ValueError("文本内容 (text) 不能为空")

    if not state.get("language"):
        raise ValueError("语言类型 (language) 不能为空")

    if not state.get("oss_path"):
        raise ValueError("OSS 存储路径 (oss_path) 不能为空")

    logger.info(
        f"进入音频生成工作流: text_length={len(state.get('text'))}, "
        f"language={state.get('language')}"
    )

    return {"provider": get_provider()}


async def generate_audio_node(state: AudioGenerationState):
    """生成音频节点"""
    logger.info("开始生成音频")

    text = state.get("text", "")
    voice = state.get("voice")
    language = state.get("language")
    provider = state.get("provider")

    audio_url = provider.invoke_tts(text=text, voice=voice, language=language)

    logger.info(f"音频生成成功: {audio_url[:100]}...")
    return {"audio_url": audio_url}


async def upload_oss_node(state: AudioGenerationState):
    """上传到 OSS 节点"""
    oss_path = state.get("oss_path")
    audio_url = state.get("audio_url")

    logger.info(f"开始上传音频到 OSS: {oss_path}")

    response = requests.get(audio_url, stream=True)
    response.raise_for_status()
    oss.upload(oss_path, response.content)

    logger.info(f"音频上传成功")
    return {}


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


audio_question_graph = create_audio_generation_graph()


async def invoke_question_audio_workflow(
    *,
    text: str,
    language: str,
    oss_path: str,
) -> None:
    """执行音频生成流程"""
    state = AudioGenerationState(text=text, language=language, oss_path=oss_path)
    await audio_question_graph.ainvoke(state)
