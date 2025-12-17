import time
from typing import Optional
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, noload
from loguru import logger

from admin.schema import (
    SavePromptSchema,
    TestPromptSchema,
    PromptDetailSchema,
)
from shared.core.database import Prompt, PromptVersion, PromptTestRecord
from shared.core.schema import (
    PromptSchema,
    PromptVersionSchema,
    SearchResultSchema,
)
from shared.services.prompt import SharedPromptService
from shared.provider import get_provider
from admin.schema import SearchPromptSchema, SearchPromptVersionSchema


async def list_prompts(db: AsyncSession, params: SearchPromptSchema) -> SearchResultSchema[PromptSchema]:
    """列表查询 Prompt"""

    query = select(Prompt).options(joinedload(Prompt.version))

    if params.name:
        like = f"%{params.name}%"
        query = query.where(Prompt.name.like(like))
    if params.type:
        query = query.where(Prompt.type == params.type)
    if params.slug:
        query = query.where(Prompt.slug == params.slug)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(Prompt.id.desc()).offset((params.page - 1) * params.size).limit(params.size)
    )

    return SearchResultSchema(
        total=total or 0,
        data=[PromptSchema.model_validate(p) for p in result.all()],
    )


async def list_versions(db: AsyncSession, params: SearchPromptVersionSchema) -> SearchResultSchema[PromptVersionSchema]:
    """列表查询 Prompt 版本"""

    query = (
        select(PromptVersion).options(noload(PromptVersion.prompt)).where(PromptVersion.prompt_id == params.prompt_id)
    )

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    result = await db.scalars(
        query.order_by(PromptVersion.id.desc()).offset((params.page - 1) * params.size).limit(params.size)
    )

    return SearchResultSchema(
        total=total or 0,
        data=[PromptVersionSchema.model_validate(v) for v in result.all()],
    )


async def get_prompt(db: AsyncSession, version_id: int) -> PromptDetailSchema:
    """获取 Prompt 详情"""

    version = await db.scalar(
        select(PromptVersion).options(joinedload(PromptVersion.prompt)).where(PromptVersion.id == version_id)
    )
    if not version or not version.prompt:
        raise ValueError("Prompt 不存在")

    prompt = version.prompt

    return PromptDetailSchema(
        id=prompt.id,
        name=prompt.name,
        slug=prompt.slug,
        type=prompt.type,
        description=prompt.description,
        last_version_id=prompt.current_version_id,
        version_id=version.id,
        template_content=version.template_content,
        negative_content=version.negative_content,
        model_params=version.model_params,
        changelog=version.changelog,
        is_published=version.is_published,
        create_time=version.create_time,
        update_time=version.update_time,
    )


async def create_prompt(db: AsyncSession, params: SavePromptSchema) -> int:
    """创建 Prompt"""
    existed = await db.scalar(select(Prompt).where(Prompt.slug == params.slug))
    if existed:
        raise ValueError("slug 已存在")

    prompt = Prompt(
        name=params.name,
        slug=params.slug,
        type=params.type,
        description=params.description,
        current_version_id=0,
    )
    db.add(prompt)
    await db.flush()

    # 创建第一个版本
    version = PromptVersion(
        prompt_id=prompt.id,
        template_content=params.template_content,
        negative_content=params.negative_content,
        model_params=params.model_params or {},
        is_published=0,
    )
    db.add(version)
    await db.flush()

    # 设置为当前版本（但不发布）
    prompt.current_version_id = version.id

    await db.commit()
    await db.refresh(prompt)
    return prompt.id


async def update_prompt(db: AsyncSession, version_id: int, params: SavePromptSchema) -> dict:
    """
    根据 id 和 version_id 更新 Prompt
    - 未发布的版本能直接编辑
    - 最后一个已发布的版本可以编辑，编辑后生成新的版本
    """

    # 获取版本和关联的Prompt
    version = await db.scalar(
        select(PromptVersion).options(joinedload(PromptVersion.prompt)).where(PromptVersion.id == version_id)
    )
    if not version or not version.prompt:
        raise ValueError("提示词或版本不存在")

    if version.is_published == 1 and version.prompt.current_version_id != version.id:
        raise ValueError("只能编辑最后一个已发布的版本，请选择最新的已发布版本进行编辑")

    prompt = version.prompt

    # 更新 Prompt 基本信息（这些字段对所有版本都是共享的）
    if params.name is not None:
        prompt.name = params.name
    if params.type is not None:
        prompt.type = params.type
    if params.description is not None:
        prompt.description = params.description

    # 根据版本的发布状态选择不同的编辑策略
    if version.is_published == 0:
        # 未发布版本：直接编辑
        if params.template_content is not None:
            version.template_content = params.template_content
        if params.negative_content is not None:
            version.negative_content = params.negative_content
        if params.model_params is not None:
            version.model_params = params.model_params

        await db.commit()

    else:
        new_version = PromptVersion(
            prompt_id=prompt.id,
            template_content=params.template_content,
            negative_content=params.negative_content,
            model_params=params.model_params or {},
            is_published=0,
        )
        db.add(new_version)
        await db.flush()

        # 更新Prompt的当前版本ID
        prompt.current_version_id = new_version.id

        await db.commit()


async def delete_prompt(db: AsyncSession, id: int) -> PromptSchema:
    """删除 Prompt"""
    try:
        await db.execute(delete(PromptTestRecord).where(PromptTestRecord.prompt_id == id))
        await db.execute(delete(PromptVersion).where(PromptVersion.prompt_id == id))
        await db.execute(delete(Prompt).where(Prompt.id == id))
        await db.commit()
    except Exception:
        db.rollback()
        raise ValueError("删除失败")


async def publish_prompt(db: AsyncSession, version_id: int, changelog: str) -> PromptSchema:
    """根据版本 ID 发布 Prompt"""
    version = await db.scalar(select(PromptVersion).where(PromptVersion.id == version_id))
    if not version:
        raise ValueError("版本不存在")

    version.is_published = 1
    version.changelog = changelog

    await db.commit()


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
