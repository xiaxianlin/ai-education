"""
题目模板管理服务
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import QuestionTemplate, QuestionType
from admin.question.schema import (
    QuestionTemplateCreateSchema,
    QuestionTemplateUpdateSchema,
)


async def create_template(db: AsyncSession, data: QuestionTemplateCreateSchema) -> QuestionTemplate:
    """创建题目模板"""
    # 验证题型存在
    question_type = await db.get(QuestionType, data.question_type_id)
    if not question_type:
        raise ValueError(f"题型 {data.question_type_id} 不存在")

    template = QuestionTemplate(**data.model_dump())
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


async def update_template(
    db: AsyncSession, template_id: int, data: QuestionTemplateUpdateSchema
) -> QuestionTemplate:
    """更新题目模板"""
    template = await db.get(QuestionTemplate, template_id)
    if not template:
        raise ValueError(f"模板 {template_id} 不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)

    await db.commit()
    await db.refresh(template)
    return template


async def delete_template(db: AsyncSession, template_id: int):
    """删除题目模板"""
    template = await db.get(QuestionTemplate, template_id)
    if not template:
        raise ValueError(f"模板 {template_id} 不存在")

    await db.delete(template)
    await db.commit()


async def get_template(db: AsyncSession, template_id: int) -> Optional[QuestionTemplate]:
    """获取题目模板详情"""
    return await db.get(QuestionTemplate, template_id)


async def list_templates(
    db: AsyncSession,
    question_type_id: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> List[QuestionTemplate]:
    """获取题目模板列表"""
    query = select(QuestionTemplate)

    if question_type_id is not None:
        query = query.where(QuestionTemplate.question_type_id == question_type_id)

    if is_active is not None:
        query = query.where(QuestionTemplate.is_active == is_active)

    query = query.order_by(QuestionTemplate.create_time.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def validate_template(template: QuestionTemplate) -> List[str]:
    """验证模板配置"""
    issues = []

    # 检查必填字段
    if not template.name:
        issues.append("模板名称不能为空")

    if not template.question_type_id:
        issues.append("必须关联题型")

    # 检查变量定义
    if template.variables:
        for var_name, var_config in template.variables.items():
            if not isinstance(var_config, dict):
                issues.append(f"变量 {var_name} 配置格式错误")
            elif "type" not in var_config:
                issues.append(f"变量 {var_name} 缺少类型定义")

    # 检查 Prompt
    if not template.system_prompt and not template.user_prompt_template:
        issues.append("至少需要配置 system_prompt 或 user_prompt_template")

    return issues
