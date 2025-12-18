"""Prompt 测试服务 - Admin端"""

import time
from typing import Optional
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from admin.schema import TestPromptSchema, SearchPromptTestRecordSchema
from shared.core.database import PromptVersion, PromptTestRecord
from shared.core.schema import PromptTestRecordSchema, SearchResultSchema
from shared.services.prompt import SharedPromptService
from shared.provider import get_provider


async def _test_text_generation(version: PromptVersion, rendered_prompt: str, params: TestPromptSchema) -> dict:
    """文本生成测试（单一职责）"""
    start_time = time.time()

    model_params = {**(version.model_params or {}), **(params.model_params or {})}
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
        "model_provider": model_provider,
        "model_name": model_name,
        "model_params": model_params,
        "latency_ms": latency_ms,
        "response_snapshot": {
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
        },
    }


async def _test_image_generation(version: PromptVersion, rendered_prompt: str, params: TestPromptSchema) -> dict:
    """图片生成测试（单一职责）"""
    start_time = time.time()

    model_params = {**(version.model_params or {}), **(params.model_params or {})}
    model_provider = params.model_provider or "aliyun"
    model_name = model_params.get("model_name") or "qwen-image-plus"

    provider = get_provider(model_provider)

    width = model_params.get("width", 1328)
    height = model_params.get("height", 1328)
    negative_prompt = version.negative_content or ""

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
        "content": image_url,
        "model_provider": model_provider,
        "model_name": model_name,
        "model_params": model_params,
        "latency_ms": latency_ms,
        "response_snapshot": {
            "image_url": image_url,
            "model": model_name,
            "width": width,
            "height": height,
            "model_provider": model_provider,
            "model_params": model_params,
            "latency_ms": latency_ms,
        },
    }


async def _test_audio_generation(version: PromptVersion, rendered_prompt: str, params: TestPromptSchema) -> dict:
    """语音生成测试（单一职责）"""
    start_time = time.time()

    model_params = {**(version.model_params or {}), **(params.model_params or {})}
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
        "content": audio_url,
        "model_provider": model_provider,
        "model_name": model_name,
        "model_params": model_params,
        "latency_ms": latency_ms,
        "response_snapshot": {
            "audio_url": audio_url,
            "model": model_name,
            "voice": voice,
            "language": language,
            "model_provider": model_provider,
            "model_params": model_params,
            "latency_ms": latency_ms,
        },
    }


async def _test_video_generation(version: PromptVersion, rendered_prompt: str, params: TestPromptSchema) -> dict:
    """视频生成测试（单一职责）"""
    # 阿里云暂不支持视频生成
    raise NotImplementedError("视频生成功能暂不支持")


async def test_prompt(db: AsyncSession, version_id: int, params: TestPromptSchema) -> dict:
    """根据版本 ID 测试 Prompt（主控制器）"""
    version = await db.scalar(select(PromptVersion).where(PromptVersion.id == version_id))
    if not version:
        raise ValueError("版本不存在")

    # 渲染模板
    rendered_prompt = SharedPromptService.render_template(version.template_content, params.input_payload or {})

    # 根据生成类型调用不同的处理函数
    generation_type = params.generation_type or "text"

    # 初始化结果变量
    result = None
    status_int = 1  # 1-测试中
    status_str = "testing"
    error = None

    try:
        if generation_type == "text":
            result = await _test_text_generation(version, rendered_prompt, params)
        elif generation_type == "image":
            result = await _test_image_generation(version, rendered_prompt, params)
        elif generation_type == "audio":
            result = await _test_audio_generation(version, rendered_prompt, params)
        elif generation_type == "video":
            result = await _test_video_generation(version, rendered_prompt, params)
        else:
            raise ValueError(f"不支持的生成类型: {generation_type}")

        status_int = 2  # 成功
        status_str = "success"

        logger.info(f"Prompt 测试成功: version_id={version_id}, type={generation_type}")

    except Exception as e:
        status_int = 3  # 失败
        status_str = "failed"
        error = str(e)

        # 构建失败时的结果
        model_params = {**(version.model_params or {}), **(params.model_params or {})}
        model_provider = params.model_provider or "aliyun"
        model_name = params.model_name or model_params.get("model_name", "")

        result = {
            "error": error,
            "model_provider": model_provider,
            "model_name": model_name,
            "model_params": model_params,
            "latency_ms": 0,
            "response_snapshot": {
                "error": error,
                "model_provider": model_provider,
                "model_name": model_name,
                "model_params": model_params,
                "latency_ms": 0,
            },
        }
        logger.error(f"Prompt 测试失败: version_id={version_id}, type={generation_type}, error={error}")

    # 保存测试记录
    record = PromptTestRecord(
        prompt_id=version.prompt_id,
        version_id=version.id,
        generation_type=generation_type,
        model_provider=result.get("model_provider"),
        model_name=result.get("model_name"),
        model_params=result.get("model_params", {}),
        input_payload=params.input_payload or {},
        rendered_prompt=rendered_prompt,
        response=result.get("response_snapshot"),
        status=status_int,
        error=error,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    # 返回测试结果
    return {
        "rendered_prompt": rendered_prompt,
        "response_snapshot": result.get("response_snapshot"),
        "ai_response": result.get("content"),  # AI 响应内容，方便前端直接显示
        "latency_ms": result.get("latency_ms", 0),
        "status": status_str,
        "error": error,
        "record_id": record.id,
        "generation_type": generation_type,
    }


async def list_test_records(
    db: AsyncSession, params: SearchPromptTestRecordSchema
) -> SearchResultSchema[PromptTestRecordSchema]:
    """列表查询 Prompt 测试记录"""

    query = select(PromptTestRecord)

    if params.prompt_id:
        query = query.where(PromptTestRecord.prompt_id == params.prompt_id)
    if params.version_id:
        query = query.where(PromptTestRecord.version_id == params.version_id)
    if params.generation_type:
        query = query.where(PromptTestRecord.generation_type == params.generation_type)
    if params.model_name:
        query = query.where(PromptTestRecord.model_name.like(f"%{params.model_name}%"))
    if params.status is not None:
        query = query.where(PromptTestRecord.status == params.status)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(PromptTestRecord.id.desc()).offset((params.page - 1) * params.size).limit(params.size)
    )

    # 转换为 Schema
    records = []
    for r in result.all():
        # 从 response 中提取 latency_ms
        latency_ms = None
        if r.response and isinstance(r.response, dict):
            latency_ms = r.response.get("latency_ms")

        # 状态映射
        status_map = {0: "pending", 1: "testing", 2: "success", 3: "failed"}
        status_str = status_map.get(r.status, "unknown")

        records.append(
            PromptTestRecordSchema(
                id=r.id,
                prompt_id=r.prompt_id,
                version_id=r.version_id,
                generation_type=r.generation_type or "text",
                model_provider=r.model_provider,
                model_name=r.model_name,
                input_payload=r.input_payload or {},
                rendered_prompt=r.rendered_prompt or "",
                response_snapshot=r.response,
                latency_ms=latency_ms,
                status=status_str,
                error=r.error,
                create_time=r.create_time,
            )
        )

    return SearchResultSchema(
        total=total or 0,
        data=records,
    )


async def delete_test_record(db: AsyncSession, record_id: int) -> None:
    """删除 Prompt 测试记录"""
    await db.execute(delete(PromptTestRecord).where(PromptTestRecord.id == record_id))
    await db.commit()


async def metrics(db: AsyncSession, pid: int, version_id: Optional[int] = None) -> dict:
    """获取 Prompt 指标"""
    query = select(PromptTestRecord).where(PromptTestRecord.prompt_id == pid)
    if version_id:
        query = query.where(PromptTestRecord.version_id == version_id)

    records = (await db.scalars(query)).all()
    total = len(records)
    if total == 0:
        return {"calls": 0, "success_rate": 0.0, "p95_latency_ms": None}

    # status: 0-待测试 1-测试中 2-测试成功 3-测试失败
    success = len([r for r in records if r.status == 2])

    # 计算延迟（这里需要从 response 中提取，暂时返回 None）
    latencies = []
    for r in records:
        if r.response and isinstance(r.response, dict):
            # 如果 response 中有 latency_ms 字段
            if "latency_ms" in r.response:
                latencies.append(r.response["latency_ms"])

    p95 = None
    if latencies:
        latencies.sort()
        p95_index = max(int(0.95 * len(latencies)) - 1, 0)
        p95 = latencies[p95_index] if latencies else None

    return {
        "calls": total,
        "success_rate": round(success / total, 3) if total > 0 else 0.0,
        "p95_latency_ms": p95,
    }
