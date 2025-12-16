from typing import Optional
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, noload

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

    query = select(PromptVersion).options(noload(PromptVersion.prompt))
    if params.prompt_id:
        query = query.where(PromptVersion.prompt_id == params.prompt_id)

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
    prompt = version.prompt
    if not version or not prompt:
        raise ValueError("Prompt 不存在")

    return PromptDetailSchema(
        id=prompt.id,
        name=prompt.name,
        slug=prompt.slug,
        type=prompt.type,
        description=prompt.description,
        version_id=version.id,
        template_content=version.template_content,
        negative_content=version.negative_content,
        model_params=version.model_params or {},
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


async def update_prompt(db: AsyncSession, version_id: int, params: SavePromptSchema):
    """根据 id 和 version_id 更新 Prompt"""

    version = await db.scalar(
        select(PromptVersion).options(joinedload(PromptVersion.prompt)).where(PromptVersion.id == version_id)
    )
    prompt = version.prompt
    if not version or not prompt:
        raise ValueError("提示词或版本不存在")

    # 更新 Prompt 基本信息
    if params.name is not None:
        prompt.name = params.name
    if params.type is not None:
        prompt.type = params.type
    if params.description is not None:
        prompt.description = params.description

    # 更新指定版本的信息
    if params.template_content is not None:
        version.template_content = params.template_content
    if params.negative_content is not None:
        version.negative_content = params.negative_content
    if params.model_params is not None:
        version.model_params = params.model_params

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

    # 校验必填变量
    SharedPromptService.validate_required(version.input_params or {}, params.input_payload or {})

    # 渲染模板
    rendered_prompt = SharedPromptService.render_template(version.template_content, params.input_payload or {})

    # TODO: 调用真实模型服务，这里先模拟
    latency_ms = 100  # 模拟延迟
    status_int = 2  # 2-测试成功
    status_str = "success"
    error = None

    try:
        # 这里应该调用实际的 AI 模型服务
        # response_snapshot = await call_ai_model(...)
        response_snapshot = {
            "echo": rendered_prompt,
            "model_provider": params.model_provider,
            "model_name": params.model_name,
            "latency_ms": latency_ms,  # 将延迟时间也存储在 response 中
        }
    except Exception as e:
        status_int = 3  # 3-测试失败
        status_str = "failed"
        error = str(e)
        response_snapshot = None

    # 保存测试记录
    record = PromptTestRecord(
        prompt_id=version.prompt_id,
        version_id=version.id,
        model_provider=params.model_provider or "",
        model_name=params.model_name or "",
        model_params=params.model_params or {},
        input_payload=params.input_payload or {},
        rendered_prompt=rendered_prompt,
        response=response_snapshot,
        status=status_int,
        error=error,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    # 返回测试结果（使用 Schema 格式）
    return {
        "rendered_prompt": rendered_prompt,
        "response_snapshot": response_snapshot,
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
