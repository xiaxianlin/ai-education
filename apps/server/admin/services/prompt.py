from typing import Optional, Dict, Any, List

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from admin.schema import (
    CreatePromptSchema,
    UpdatePromptSchema,
    CreatePromptVersionSchema,
    TestPromptSchema,
)
from shared.core.database import Prompt, PromptVersion, PromptTestRecord
from shared.core.schema import PromptSchema, PromptVersionSchema


from shared.services.prompt import SharedPromptService


async def list_prompts(
    db: AsyncSession,
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    tag: Optional[str] = None,
) -> List[PromptSchema]:
    query = select(Prompt)
    if keyword:
        like = f"%{keyword}%"
        query = query.where(Prompt.name.like(like))
    if category:
        query = query.where(Prompt.category == category)
    if status:
        query = query.where(Prompt.status == status)
    if tag:
        # 简单包含判断（JSON 数组包含字符串）
        query = query.where(func.json_contains(Prompt.tags, f'["{tag}"]'))

    prompts = (await db.scalars(query.order_by(Prompt.id.desc()))).all()
    return [PromptSchema.model_validate(p) for p in prompts]


async def get_prompt(db: AsyncSession, pid: int) -> PromptSchema:
    prompt = await db.scalar(select(Prompt).where(Prompt.id == pid))
    if not prompt:
        raise ValueError("Prompt 不存在")
    if prompt.current_version_id:
        current = await db.scalar(
            select(PromptVersion).where(PromptVersion.id == prompt.current_version_id)
        )
        prompt.current_version = current  # type: ignore[attr-defined]
    return PromptSchema.model_validate(prompt)


async def create_prompt(db: AsyncSession, params: CreatePromptSchema) -> PromptSchema:
    existed = await db.scalar(select(Prompt).where(Prompt.slug == params.slug))
    if existed:
        raise ValueError("slug 已存在")

    prompt = Prompt(
        name=params.name,
        slug=params.slug,
        category=params.category,
        description=params.description,
        tags=params.tags,
        status="draft",
    )
    db.add(prompt)
    await db.flush()

    version = PromptVersion(
        prompt_id=prompt.id,
        version_no=1,
        template=params.template,
        system_prompt=params.system_prompt,
        negative_prompt=params.negative_prompt,
        input_schema=params.input_schema,
        sampling_params=params.sampling_params,
        timeout_ms=params.timeout_ms,
        changelog=params.changelog,
        is_published=0,
    )
    db.add(version)
    await db.commit()
    await db.refresh(prompt)
    prompt.current_version = version  # type: ignore[attr-defined]
    return PromptSchema.model_validate(prompt)


async def update_prompt(db: AsyncSession, pid: int, params: UpdatePromptSchema) -> PromptSchema:
    prompt = await db.scalar(select(Prompt).where(Prompt.id == pid))
    if not prompt:
        raise ValueError("Prompt 不存在")
    if params.name is not None:
        prompt.name = params.name
    if params.category is not None:
        prompt.category = params.category
    if params.description is not None:
        prompt.description = params.description
    if params.tags is not None:
        prompt.tags = params.tags

    await db.commit()
    await db.refresh(prompt)
    return PromptSchema.model_validate(prompt)


async def create_version(
    db: AsyncSession, pid: int, params: CreatePromptVersionSchema
) -> PromptVersionSchema:
    prompt = await db.scalar(select(Prompt).where(Prompt.id == pid))
    if not prompt:
        raise ValueError("Prompt 不存在")

    max_version = await db.scalar(
        select(func.max(PromptVersion.version_no)).where(PromptVersion.prompt_id == pid)
    )
    next_no = (max_version or 0) + 1

    version = PromptVersion(
        prompt_id=pid,
        version_no=next_no,
        template=params.template,
        system_prompt=params.system_prompt,
        negative_prompt=params.negative_prompt,
        input_schema=params.input_schema,
        sampling_params=params.sampling_params,
        timeout_ms=params.timeout_ms,
        changelog=params.changelog,
        is_published=0,
    )
    db.add(version)
    await db.commit()
    await db.refresh(version)
    return PromptVersionSchema.model_validate(version)


async def list_versions(db: AsyncSession, pid: int) -> List[PromptVersionSchema]:
    versions = (
        await db.scalars(
            select(PromptVersion)
            .where(PromptVersion.prompt_id == pid)
            .order_by(PromptVersion.version_no.desc())
        )
    ).all()
    return [PromptVersionSchema.model_validate(v) for v in versions]


async def publish_version(db: AsyncSession, pid: int, vid: int) -> PromptSchema:
    prompt = await db.scalar(select(Prompt).where(Prompt.id == pid))
    if not prompt:
        raise ValueError("Prompt 不存在")
    version = await db.scalar(
        select(PromptVersion).where(PromptVersion.id == vid, PromptVersion.prompt_id == pid)
    )
    if not version:
        raise ValueError("版本不存在")

    # 将其他版本置为未发布
    await db.execute(
        update(PromptVersion).where(PromptVersion.prompt_id == pid).values(is_published=0)
    )

    version.is_published = 1
    prompt.status = "published"
    prompt.current_version_id = vid

    await db.commit()
    await db.refresh(prompt)
    prompt.current_version = version  # type: ignore[attr-defined]
    return PromptSchema.model_validate(prompt)


async def archive_version(db: AsyncSession, pid: int, vid: int) -> PromptVersionSchema:
    version = await db.scalar(
        select(PromptVersion).where(PromptVersion.id == vid, PromptVersion.prompt_id == pid)
    )
    if not version:
        raise ValueError("版本不存在")
    version.is_published = 0

    prompt = await db.scalar(select(Prompt).where(Prompt.id == pid))
    if prompt and prompt.current_version_id == vid:
        prompt.current_version_id = None
        prompt.status = "archived"

    await db.commit()
    await db.refresh(version)
    return PromptVersionSchema.model_validate(version)


async def test_version(db: AsyncSession, pid: int, vid: int, params: TestPromptSchema) -> dict:
    version = await db.scalar(
        select(PromptVersion).where(PromptVersion.id == vid, PromptVersion.prompt_id == pid)
    )
    if not version:
        raise ValueError("版本不存在")

    variables = params.variables or {}
    SharedPromptService.validate_required(version.input_schema or {}, variables)
    rendered_prompt = SharedPromptService.render_template(version.template, variables)

    # TODO: 调用真实模型服务，这里先回显
    response_snapshot = {
        "echo": rendered_prompt,
        "model_provider": params.model_provider,
        "model_name": params.model_name,
    }

    record = PromptTestRecord(
        prompt_id=pid,
        version_id=vid,
        model_provider=params.model_provider,
        model_name=params.model_name,
        input_payload=variables,
        rendered_prompt=rendered_prompt,
        response_snapshot=response_snapshot,
        latency_ms=0,
        status="success",
        error=None,
    )
    db.add(record)
    await db.commit()
    return {
        "rendered_prompt": rendered_prompt,
        "response": response_snapshot,
        "latency_ms": record.latency_ms,
        "status": record.status,
        "error": record.error,
    }


async def metrics(db: AsyncSession, pid: int, version_id: Optional[int] = None) -> dict:
    query = select(PromptTestRecord).where(PromptTestRecord.prompt_id == pid)
    if version_id:
        query = query.where(PromptTestRecord.version_id == version_id)

    records = (await db.scalars(query)).all()
    total = len(records)
    if total == 0:
        return {"calls": 0, "success_rate": 0.0, "p95_latency_ms": None}

    success = len([r for r in records if r.status == "success"])
    latencies = sorted([r.latency_ms or 0 for r in records])
    p95_index = max(int(0.95 * len(latencies)) - 1, 0)
    p95 = latencies[p95_index] if latencies else None

    return {
        "calls": total,
        "success_rate": round(success / total, 3),
        "p95_latency_ms": p95,
    }
