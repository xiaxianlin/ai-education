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


async def test_prompt(db: AsyncSession, version_id: int, params: TestPromptSchema) -> dict:
    """根据版本 ID 测试 Prompt"""
    version = await db.scalar(select(PromptVersion).where(PromptVersion.id == version_id))
    if not version:
        raise ValueError("版本不存在")

    # 渲染模板
    rendered_prompt = SharedPromptService.render_template(version.template_content, params.input_payload or {})

    # 合并模型参数：优先使用传入的参数，其次使用版本默认参数
    model_params = {**(version.model_params or {}), **(params.model_params or {})}
    model_provider = params.model_provider or "aliyun"
    model_name = params.model_name or model_params.get("model_name") or "qwen-plus"

    latency_ms = 0
    status_int = 1  # 1-测试中
    status_str = "testing"
    error = None
    response_snapshot = None
    ai_response = None

    try:
        # 直接使用 OpenAI 客户端获取完整响应信息
        start_time = time.time()

        provider = get_provider(model_provider)
        client = provider.get_openai_client()

        # 准备调用参数
        temperature = model_params.get("temperature", 0.7)
        max_tokens = model_params.get("max_tokens")

        # 调用 OpenAI 客户端，获取完整响应
        call_kwargs = {
            "model": model_name,
            "messages": [{"role": "user", "content": rendered_prompt}],
            "temperature": temperature,
        }
        if max_tokens:
            call_kwargs["max_tokens"] = max_tokens

        response = client.chat.completions.create(**call_kwargs)

        latency_ms = int((time.time() - start_time) * 1000)

        # 提取文本内容
        ai_response = response.choices[0].message.content

        # 构建完整的响应快照
        response_snapshot = {
            "content": ai_response,
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

        status_int = 2  # 2-测试成功
        status_str = "success"

        logger.info(
            f"Prompt 测试成功: version_id={version_id}, "
            f"model={model_name}, latency={latency_ms}ms, "
            f"tokens={response_snapshot['usage'].get('total_tokens')}"
        )

    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000) if "start_time" in locals() else 0
        status_int = 3  # 3-测试失败
        status_str = "failed"
        error = str(e)
        response_snapshot = {
            "error": error,
            "model_provider": model_provider,
            "model_name": model_name,
            "model_params": model_params,
            "latency_ms": latency_ms,
        }
        logger.error(f"Prompt 测试失败: version_id={version_id}, error={error}")

    # 保存测试记录
    record = PromptTestRecord(
        prompt_id=version.prompt_id,
        version_id=version.id,
        model_provider=model_provider,
        model_name=model_name,
        model_params=model_params,
        input_payload=params.input_payload or {},
        rendered_prompt=rendered_prompt,
        response=response_snapshot,
        status=status_int,
        error=error,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    # 返回测试结果
    return {
        "rendered_prompt": rendered_prompt,
        "response_snapshot": response_snapshot,
        "ai_response": ai_response,  # AI 响应内容，方便前端直接显示
        "latency_ms": latency_ms,
        "status": status_str,
        "error": error,
        "record_id": record.id,
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
    if params.model_name:
        query = query.where(PromptTestRecord.model_name.like(f"%{params.model_name}%"))
    if params.status is not None:
        query = query.where(PromptTestRecord.status == params.status)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(PromptTestRecord.id.desc())
        .offset((params.page - 1) * params.size)
        .limit(params.size)
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

