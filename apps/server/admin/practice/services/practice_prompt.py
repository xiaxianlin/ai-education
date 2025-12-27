from __future__ import annotations

from shared.core.database import Practice, PracticePrompt, Prompt
from shared.core.schema import PracticePromptSchema, SearchResultSchema
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ..schema import SavePracticePromptSchema, SearchPracticePromptSchema


async def list_practice_prompts(db: AsyncSession, params: SearchPracticePromptSchema):
    """列表查询练习提示词配置"""

    query = select(PracticePrompt).options(
        joinedload(PracticePrompt.practice),
        joinedload(PracticePrompt.prompt),
    )

    if params.subject:
        query = query.where(PracticePrompt.subject == params.subject)
    if params.scene_type:
        query = query.where(PracticePrompt.scene_type == params.scene_type)
    if params.specialty_type:
        query = query.where(PracticePrompt.specialty_type == params.specialty_type)
    if params.practice_id:
        query = query.where(PracticePrompt.practice_id == params.practice_id)
    if params.practice_slug:
        query = query.where(PracticePrompt.practice_slug == params.practice_slug)
    if params.prompt_id:
        query = query.where(PracticePrompt.prompt_id == params.prompt_id)
    if params.prompt_slug:
        like = f"%{params.prompt_slug}%"
        query = query.where(PracticePrompt.prompt_slug.like(like))
    if params.is_active is not None:
        query = query.where(PracticePrompt.is_active == params.is_active)

    # 总数查询
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # 分页查询
    result = await db.scalars(
        query.order_by(PracticePrompt.sort_order.asc(), PracticePrompt.id.desc())
        .offset((params.page - 1) * params.size)
        .limit(params.size)
    )

    return SearchResultSchema(
        total=total or 0,
        data=[PracticePromptSchema.model_validate(item) for item in result.all()],
    )


async def get_practice_prompt(db: AsyncSession, id: int):
    """获取练习提示词配置详情"""
    practice_prompt = await db.scalar(
        select(PracticePrompt)
        .options(
            joinedload(PracticePrompt.practice),
            joinedload(PracticePrompt.prompt),
        )
        .where(PracticePrompt.id == id)
    )
    if not practice_prompt:
        raise ValueError("配置不存在")

    return PracticePromptSchema.model_validate(practice_prompt)


async def create_practice_prompt(db: AsyncSession, params: SavePracticePromptSchema) -> int:
    """创建练习提示词配置"""

    # 验证关联的练习是否存在（如果提供了）
    practice_id = params.practice_id
    if params.practice_slug and not practice_id:
        practice = await db.scalar(select(Practice).where(Practice.slug == params.practice_slug))
        if practice:
            practice_id = practice.id

    # 验证关联的提示词是否存在（如果提供了）
    prompt_id = params.prompt_id
    if params.prompt_slug and not prompt_id:
        prompt = await db.scalar(select(Prompt).where(Prompt.slug == params.prompt_slug))
        if prompt:
            prompt_id = prompt.id

    # 检查是否已存在相同的配置
    if params.code:
        existed = await db.scalar(select(PracticePrompt).where(PracticePrompt.code == params.code))
        if existed:
            raise ValueError("配置编码已存在")

    practice_prompt = PracticePrompt(
        name=params.name,
        code=params.code,
        description=params.description,
        scene_type=params.scene_type,
        specialty_type=params.specialty_type,
        subject=params.subject,
        stages=params.stages,
        grades=params.grades,
        semesters=params.semesters,
        practice_id=practice_id,
        practice_slug=params.practice_slug,
        prompt_id=prompt_id,
        prompt_slug=params.prompt_slug,
        question_type_configs=params.question_type_configs,
        difficulty_config=params.difficulty_config,
        question_count_config=params.question_count_config,
        template_variables=params.template_variables,
        sort_order=params.sort_order,
        is_active=params.is_active,
    )
    db.add(practice_prompt)
    await db.commit()
    await db.refresh(practice_prompt)
    return practice_prompt.id


async def update_practice_prompt(db: AsyncSession, id: int, params: SavePracticePromptSchema):
    """更新练习提示词配置"""
    practice_prompt = await db.scalar(select(PracticePrompt).where(PracticePrompt.id == id))
    if not practice_prompt:
        raise ValueError("配置不存在")

    # 检查编码是否与其他记录冲突
    if params.code:
        existed = await db.scalar(
            select(PracticePrompt).where(
                PracticePrompt.code == params.code, PracticePrompt.id != id
            )
        )
        if existed:
            raise ValueError("配置编码已存在")

    # 验证关联的练习 ID
    practice_id = params.practice_id
    if params.practice_slug and not practice_id:
        practice = await db.scalar(select(Practice).where(Practice.slug == params.practice_slug))
        if practice:
            practice_id = practice.id

    # 验证关联的提示词 ID
    prompt_id = params.prompt_id
    if params.prompt_slug and not prompt_id:
        prompt = await db.scalar(select(Prompt).where(Prompt.slug == params.prompt_slug))
        if prompt:
            prompt_id = prompt.id

    # 更新字段
    practice_prompt.name = params.name
    practice_prompt.code = params.code
    practice_prompt.description = params.description
    practice_prompt.scene_type = params.scene_type
    practice_prompt.specialty_type = params.specialty_type
    practice_prompt.subject = params.subject
    practice_prompt.stages = params.stages
    practice_prompt.grades = params.grades
    practice_prompt.semesters = params.semesters
    practice_prompt.practice_id = practice_id
    practice_prompt.practice_slug = params.practice_slug
    practice_prompt.prompt_id = prompt_id
    practice_prompt.prompt_slug = params.prompt_slug
    practice_prompt.question_type_configs = params.question_type_configs
    practice_prompt.difficulty_config = params.difficulty_config
    practice_prompt.question_count_config = params.question_count_config
    practice_prompt.template_variables = params.template_variables
    practice_prompt.sort_order = params.sort_order
    practice_prompt.is_active = params.is_active

    await db.commit()


async def delete_practice_prompt(db: AsyncSession, id: int) -> dict:
    """删除练习提示词配置"""
    practice_prompt = await db.scalar(select(PracticePrompt).where(PracticePrompt.id == id))
    if not practice_prompt:
        raise ValueError("配置不存在")

    await db.execute(delete(PracticePrompt).where(PracticePrompt.id == id))
    await db.commit()


async def get_practice_prompts_by_practice(db: AsyncSession, practice_id: int):
    """根据练习ID获取所有关联的提示词配置"""
    result = await db.scalars(
        select(PracticePrompt)
        .options(joinedload(PracticePrompt.prompt))
        .where(PracticePrompt.practice_id == practice_id, PracticePrompt.is_active == True)
        .order_by(PracticePrompt.sort_order.asc())
    )
    return [PracticePromptSchema.model_validate(item) for item in result.all()]


async def match_practice_prompt(
    db: AsyncSession, subject: str, grade: int, scene_type: str, specialty_type: str | None = None
):
    """匹配合适的练习提示词配置（学生端使用）"""
    query = (
        select(PracticePrompt)
        .options(joinedload(PracticePrompt.prompt))
        .where(
            PracticePrompt.subject == subject,
            PracticePrompt.scene_type == scene_type,
            PracticePrompt.is_active == True,
        )
    )

    # 年级匹配：grade 在 grades 列表中
    # 注意：JSON 数组的包含查询可能需要根据数据库类型调整
    # 这里使用通用方式，实际可能需要使用 JSON 函数

    if specialty_type:
        query = query.where(PracticePrompt.specialty_type == specialty_type)

    result = await db.scalars(query.order_by(PracticePrompt.sort_order.asc()))
    prompts = result.all()

    # Python 层筛选年级
    matched = [p for p in prompts if grade in (p.grades or [])]

    return [PracticePromptSchema.model_validate(item) for item in matched]
