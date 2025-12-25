"""Audio Generation Module

Provider-based audio generation (TTS) workflow using LangGraph.
"""

import time
from typing import Optional
from loguru import logger

from generation.audio.schema import AudioGenerationState
from .graph import create_audio_generation_graph

app = create_audio_generation_graph()


async def invoke_audio_workflow(
    *,
    text: str,
    voice: Optional[str] = None,
    language: str = "Chinese",
    oss_path: Optional[str] = None,
) -> str:
    """执行音频生成流程（TTS）

    Args:
        text: 要转换为语音的文本
        voice: 语音名称，如果为 None 则使用默认语音
        language: 语言类型，默认 "Chinese"
        oss_path: OSS 存储路径，如果为 None 则不上传

    Returns:
        str: 生成的音频 URL 或 OSS 路径
    """

    start_time = time.time()

    initial_state = AudioGenerationState(
        text=text,
        voice=voice,
        language=language,
        oss_path=oss_path,
    )

    try:
        result = await app.ainvoke(initial_state)
        audio_url = result.get("audio_url", "")

        # 计算生成时长
        elapsed_time = time.time() - start_time

        logger.info(
            "音频生成完成 | text_length={text_length} | language={language} | "
            "耗时={elapsed_time:.2f}秒",
            text_length=len(text),
            language=language,
            elapsed_time=elapsed_time,
        )

        return audio_url

    except Exception as e:
        elapsed_time = time.time() - start_time

        logger.error(
            "音频生成失败 | text_length={text_length} | language={language} | "
            "耗时={elapsed_time:.2f}秒 | 错误={error}",
            text_length=len(text),
            language=language,
            elapsed_time=elapsed_time,
            error=str(e),
        )
        raise e


__all__ = ["invoke_audio_workflow"]
