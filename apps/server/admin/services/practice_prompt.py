from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from admin.schema import (
    SavePracticePromptSchema,
    SearchPracticePromptSchema,
    PracticePromptSchema,
)
from shared.core.database import PracticePrompt, Prompt
from shared.core.schema import SearchResultSchema


async def list_practice_prompts(
    db: AsyncSession, params: SearchPracticePromptSchema
) -> SearchResultSchema[PracticePromptSchema]:
    """列表查询练习提示词关联"""

    query = select(PracticePrompt).options(joinedload(PracticePrompt.prompt))

    if params.practice_type:
        query = query.where(PracticePrompt.practice_type == params.practice_type)
    if params.subject:
        query = query.where(PracticePrompt.subject == params.subject)
    if params.grade:
        query = query.where(PracticePrompt.grade == params.grade)
    if params.prompt_id:
        query = query.where(PracticePrompt.prompt_id == params.prompt_id)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(PracticePrompt.id.desc())
        .offset((params.page - 1) * params.size)
        .limit(params.size)
    )

    items = []
    for item in result.all():
        items.append(
            PracticePromptSchema(
                id=item.id,
                practice_type=item.practice_type,
                subject=item.subject,
                grade=item.grade,
                prompt_id=item.prompt_id,
                prompt_name=item.prompt.name if item.prompt else None,
                prompt_slug=item.prompt.slug if item.prompt else None,
                create_time=item.create_time,
                update_time=item.update_time,
            )
        )

    return SearchResultSchema(total=total or 0, data=items)


async def get_practice_prompt(
    db: AsyncSession, id: int
) -> PracticePromptSchema:
    """获取练习提示词关联详情"""
    practice_prompt = await db.scalar(
        select(PracticePrompt)
        .options(joinedload(PracticePrompt.prompt))
        .where(PracticePrompt.id == id)
    )
    if not practice_prompt:
        raise ValueError("关联不存在")

    return PracticePromptSchema(
        id=practice_prompt.id,
        practice_type=practice_prompt.practice_type,
        subject=practice_prompt.subject,
        grade=practice_prompt.grade,
        prompt_id=practice_prompt.prompt_id,
        prompt_name=practice_prompt.prompt.name if practice_prompt.prompt else None,
        prompt_slug=practice_prompt.prompt.slug if practice_prompt.prompt else None,
        create_time=practice_prompt.create_time,
        update_time=practice_prompt.update_time,
    )


async def create_practice_prompt(
    db: AsyncSession, params: SavePracticePromptSchema
) -> int:
    """创建练习提示词关联"""
    # 检查提示词是否存在
    prompt = await db.scalar(select(Prompt).where(Prompt.id == params.prompt_id))
    if not prompt:
        raise ValueError("提示词不存在")

    # 检查是否已存在相同的关联
    existed = await db.scalar(
        select(PracticePrompt).where(
            PracticePrompt.practice_type == params.practice_type,
            PracticePrompt.subject == params.subject,
            PracticePrompt.grade == params.grade,
        )
    )
    if existed:
        raise ValueError("该练习类型、科目、年级的关联已存在")

    practice_prompt = PracticePrompt(
        practice_type=params.practice_type,
        subject=params.subject,
        grade=params.grade,
        prompt_id=params.prompt_id,
    )
    db.add(practice_prompt)
    await db.commit()
    await db.refresh(practice_prompt)
    return practice_prompt.id


async def update_practice_prompt(
    db: AsyncSession, id: int, params: SavePracticePromptSchema
) -> dict:
    """更新练习提示词关联"""
    practice_prompt = await db.scalar(
        select(PracticePrompt).where(PracticePrompt.id == id)
    )
    if not practice_prompt:
        raise ValueError("关联不存在")

    # 检查提示词是否存在
    if params.prompt_id:
        prompt = await db.scalar(select(Prompt).where(Prompt.id == params.prompt_id))
        if not prompt:
            raise ValueError("提示词不存在")

    # 检查是否与其他记录冲突
    practice_type = params.practice_type or practice_prompt.practice_type
    subject = params.subject if params.subject is not None else practice_prompt.subject
    grade = params.grade if params.grade is not None else practice_prompt.grade

    existed = await db.scalar(
        select(PracticePrompt).where(
            PracticePrompt.practice_type == practice_type,
            PracticePrompt.subject == subject,
            PracticePrompt.grade == grade,
            PracticePrompt.id != id,
        )
    )
    if existed:
        raise ValueError("该练习类型、科目、年级的关联已存在")

    # 更新字段
    practice_prompt.practice_type = practice_type
    practice_prompt.subject = subject
    practice_prompt.grade = grade
    if params.prompt_id:
        practice_prompt.prompt_id = params.prompt_id

    await db.commit()
    return {"id": id}


async def delete_practice_prompt(db: AsyncSession, id: int) -> dict:
    """删除练习提示词关联"""
    practice_prompt = await db.scalar(
        select(PracticePrompt).where(PracticePrompt.id == id)
    )
    if not practice_prompt:
        raise ValueError("关联不存在")

    await db.execute(delete(PracticePrompt).where(PracticePrompt.id == id))
    await db.commit()
    return {"id": id}

