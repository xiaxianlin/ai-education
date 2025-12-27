"""
题型和题目管理 API 路由
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from shared.core.database import Database
from shared.core.schema import (
    QuestionTemplateSchema,
    QuestionTypeSchema,
    QuestionSchema,
    SearchResultSchema,
)
from admin.question.schema import (
    QuestionTypeCreateSchema,
    QuestionTypeUpdateSchema,
    QuestionTypeSearchSchema,
    QuestionCreateSchema,
    QuestionUpdateSchema,
    QuestionSearchSchema,
    QuestionTemplateCreateSchema,
    QuestionTemplateUpdateSchema,
    QuestionTemplateSearchSchema,
)
from admin.question.services import question_type, question, template

question_router = APIRouter(prefix="/question")


# ======================== 题型管理 ======================== #


@question_router.post(
    "/type",
    tags=["题型管理"],
    summary="创建题型",
    description="创建一种新的题型",
    response_model=QuestionTypeSchema,
)
async def create_question_type(params: QuestionTypeCreateSchema, db: AsyncSession = Database):
    return await question_type.create_question_type(db, params)


@question_router.patch(
    "/type/{id}",
    tags=["题型管理"],
    summary="更新题型",
    description="更新指定的题型信息",
    response_model=QuestionTypeSchema,
)
async def update_question_type(id: int, params: QuestionTypeUpdateSchema, db: AsyncSession = Database):
    return await question_type.update_question_type(db, id, params)


@question_router.delete(
    "/type/{id}",
    tags=["题型管理"],
    summary="删除题型",
    description="删除指定的题型",
)
async def delete_question_type(id: int, db: AsyncSession = Database):
    return await question_type.delete_question_type(db, id)


@question_router.get(
    "/type/search",
    tags=["题型管理"],
    summary="搜索题型",
    description="根据条件搜索题型列表（分页）",
)
async def search_question_types(params: QuestionTypeSearchSchema = Depends(), db: AsyncSession = Database):
    types, total = await question_type.search_question_types(db, params)
    return SearchResultSchema(
        data=[QuestionTypeSchema.model_validate(t) for t in types],
        total=total,
    )


@question_router.get(
    "/type/{id}",
    tags=["题型管理"],
    summary="获取题型详情",
    description="获取指定题型的详细信息",
    response_model=QuestionTypeSchema,
)
async def get_question_type(id: int, db: AsyncSession = Database):
    return QuestionTypeSchema.model_validate(await question_type.get_question_type(db, id))


# ======================== 题目模板管理 ======================== #


@question_router.post(
    "/template",
    tags=["题目模板"],
    summary="创建题目模板",
    response_model=QuestionTemplateSchema,
)
async def create_template(
    data: QuestionTemplateCreateSchema,
    db: AsyncSession = Database,
):
    result = await template.create_template(db, data)
    return QuestionTemplateSchema.model_validate(result)


@question_router.patch(
    "/template/{template_id}",
    tags=["题目模板"],
    summary="更新题目模板",
    response_model=QuestionTemplateSchema,
)
async def update_template(
    template_id: int,
    data: QuestionTemplateUpdateSchema,
    db: AsyncSession = Database,
):
    result = await template.update_template(db, template_id, data)
    return QuestionTemplateSchema.model_validate(result)


@question_router.delete(
    "/template/{template_id}",
    tags=["题目模板"],
    summary="删除题目模板",
    description="删除指定的题目模板",
)
async def delete_template(
    template_id: int,
    db: AsyncSession = Database,
):
    await template.delete_template(db, template_id)


@question_router.get(
    "/template",
    tags=["题目模板"],
    summary="获取题目模板列表",
    description="获取题目模板列表（分页）",
)
async def list_templates(
    params: QuestionTemplateSearchSchema = Depends(),
    db: AsyncSession = Database,
):
    templates, total = await template.list_templates(db, params)
    return SearchResultSchema(
        data=[QuestionTemplateSchema.model_validate(t) for t in templates],
        total=total,
    )


@question_router.get(
    "/template/{template_id}",
    tags=["题目模板"],
    summary="获取题目模板详情",
    response_model=QuestionTemplateSchema,
)
async def get_template(
    template_id: int,
    db: AsyncSession = Database,
):
    result = await template.get_template(db, template_id)
    return QuestionTemplateSchema.model_validate(result)


@question_router.post(
    "/template/{template_id}/validate",
    tags=["题目模板"],
    summary="验证题目模板",
    description="验证指定的题目模板",
)
async def validate_template(
    template_id: int,
    db: AsyncSession = Database,
):
    result = await template.get_template(db, template_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"模板 {template_id} 不存在")

    issues = await template.validate_template(result)

    return {
        "valid": len(issues) == 0,
        "issues": issues,
    }


# ======================== 题目管理 ======================== #


@question_router.post(
    "/",
    tags=["题目管理"],
    summary="创建题目",
    description="创建一道新的题目",
    response_model=QuestionSchema,
)
async def create_question(params: QuestionCreateSchema, db: AsyncSession = Database):
    return await question.create_question(db, params)


@question_router.patch(
    "/{id}",
    tags=["题目管理"],
    summary="更新题目",
    description="更新指定的题目信息",
    response_model=QuestionSchema,
)
async def update_question(id: str, params: QuestionUpdateSchema, db: AsyncSession = Database):
    return await question.update_question(db, id, params)


@question_router.delete(
    "/{id}",
    tags=["题目管理"],
    summary="删除题目",
    description="删除指定的题目",
)
async def delete_question(id: str, db: AsyncSession = Database):
    await question.delete_question(db, id)


@question_router.get(
    "/search",
    tags=["题目管理"],
    summary="搜索题目",
    description="根据条件搜索题目列表（分页）",
    response_model=SearchResultSchema[QuestionSchema],
)
async def search_questions(params: QuestionSearchSchema = Depends(), db: AsyncSession = Database):
    questions, total = await question.search_questions(db, params)
    return SearchResultSchema(
        data=[QuestionSchema.model_validate(q) for q in questions],
        total=total,
    )


@question_router.get(
    "/{id}",
    tags=["题目管理"],
    summary="获取题目详情",
    description="获取指定题目的详细信息",
    response_model=QuestionSchema,
)
async def get_question(id: str, db: AsyncSession = Database):
    result = await question.get_question(db, id)
    if not result:
        raise HTTPException(status_code=404, detail=f"题目 {id} 不存在")
    return QuestionSchema.model_validate(result)
