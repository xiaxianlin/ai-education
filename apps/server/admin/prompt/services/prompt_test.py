"""Prompt 测试服务 - Admin端"""

import time

from loguru import logger
from shared.core.database import Prompt
from shared.provider import get_provider
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import TestPromptSchema


async def _test_text_generation(prompt: Prompt, rendered_prompt: str, params: TestPromptSchema) -> dict:
    """文本生成测试（单一职责）"""
    start_time = time.time()

    model_params = {**(prompt.model_params or {}), **(params.model_params or {})}
    model_provider = params.model_provider or "aliyun"
    model_name = params.model_name or model_params.get("model_name") or "qwen-plus"

    provider = get_provider(model_provider)
    client = provider.get_openai_client()

    temperature = model_params.get("temperature", 0.7)
    max_tokens = model_params.get("max_tokens")

    call_kwargs = {
        "model": model_name,
        "messages": [{"role": "user", "content": rendered_prompt}],
        "temperature": temperature,
    }
    if max_tokens:
        call_kwargs["max_tokens"] = max_tokens

    response = client.chat.completions.create(**call_kwargs)
    latency_ms = int((time.time() - start_time) * 1000)

    content = response.choices[0].message.content

    logger.info(
        f"文本生成成功: model={model_name}, latency={latency_ms}ms, "
        f"tokens={response.usage.total_tokens if response.usage else 0}"
    )

    return {
        "content": content,
        "model": response.model,
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens if response.usage else None,
            "completion_tokens": response.usage.completion_tokens if response.usage else None,
            "total_tokens": response.usage.total_tokens if response.usage else None,
        },
        "finish_reason": response.choices[0].finish_reason,
        "model_provider": model_provider,
        "model_name": model_name,
        "model_params": model_params,
        "latency_ms": latency_ms,
        "response_id": response.id if hasattr(response, "id") else None,
    }


async def _test_image_generation(prompt: Prompt, rendered_prompt: str, params: TestPromptSchema) -> dict:
    """图片生成测试（单一职责）"""
    start_time = time.time()

    model_params = {**(prompt.model_params or {}), **(params.model_params or {})}
    model_provider = params.model_provider or "aliyun"
    model_name = model_params.get("model_name") or "qwen-image-plus"

    provider = get_provider(model_provider)

    width = model_params.get("width", 1328)
    height = model_params.get("height", 1328)
    negative_prompt = prompt.negative_content or ""

    image_url = provider.invoke_image_generate(
        prompt=rendered_prompt,
        width=width,
        height=height,
        model=model_name,
        negative_prompt=negative_prompt,
    )

    latency_ms = int((time.time() - start_time) * 1000)

    logger.info(f"图片生成成功: model={model_name}, latency={latency_ms}ms, image_url={image_url}")

    return {
        "image_url": image_url,
        "model": model_name,
        "width": width,
        "height": height,
        "model_provider": model_provider,
        "model_params": model_params,
        "latency_ms": latency_ms,
    }


async def _test_audio_generation(prompt: Prompt, rendered_prompt: str, params: TestPromptSchema) -> dict:
    """语音生成测试（单一职责）"""
    start_time = time.time()

    model_params = {**(prompt.model_params or {}), **(params.model_params or {})}
    model_provider = params.model_provider or "aliyun"
    model_name = model_params.get("model_name") or "qwen3-tts-flash"

    provider = get_provider(model_provider)

    voice = model_params.get("voice", "Elias")
    language = model_params.get("language", "English")

    audio_url = provider.invoke_tts(
        text=rendered_prompt,
        voice=voice,
        language=language,
        model=model_name,
    )

    latency_ms = int((time.time() - start_time) * 1000)

    logger.info(f"语音生成成功: model={model_name}, latency={latency_ms}ms, audio_url={audio_url}")

    return {
        "audio_url": audio_url,
        "model": model_name,
        "voice": voice,
        "language": language,
        "model_provider": model_provider,
        "model_params": model_params,
        "latency_ms": latency_ms,
    }


async def _test_video_generation(prompt: Prompt, rendered_prompt: str, params: TestPromptSchema) -> dict:
    """视频生成测试（单一职责）"""
    # 阿里云暂不支持视频生成
    raise NotImplementedError("视频生成功能暂不支持")


async def test_prompt(db: AsyncSession, id: int, params: TestPromptSchema) -> dict:
    """根据 Prompt ID 测试 Prompt（主控制器）"""
    prompt = await db.scalar(select(Prompt).where(Prompt.id == id))
    if not prompt:
        raise ValueError("Prompt 不存在")

    # 渲染模板（使用 Python 的 format 方法）
    try:
        rendered_prompt = prompt.template_content.format(**(params.input_payload or {}))
    except KeyError as e:
        raise ValueError(f"缺少变量: {e.args[0]}")

    generation_type = params.generation_type or "text"

    try:
        if generation_type == "text":
            result = await _test_text_generation(prompt, rendered_prompt, params)
        elif generation_type == "image":
            result = await _test_image_generation(prompt, rendered_prompt, params)
        elif generation_type == "audio":
            result = await _test_audio_generation(prompt, rendered_prompt, params)
        elif generation_type == "video":
            result = await _test_video_generation(prompt, rendered_prompt, params)
        else:
            raise ValueError(f"不支持的生成类型: {generation_type}")

        logger.info(f"Prompt 测试成功: id={id}, type={generation_type}")
        return result
    except Exception as error:
        logger.error(f"Prompt 测试失败: id={id}, type={generation_type}, error={error}")
        raise ValueError(f"Prompt 测试失败: id={id}, type={generation_type}, error={error}")
