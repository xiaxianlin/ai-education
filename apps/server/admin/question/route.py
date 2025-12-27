"""
题型和题目管理 API 路由
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from shared.core.database import Database
from admin.question.schema import (
    QuestionTypeCreateSchema,
    QuestionTypeUpdateSchema,
    QuestionTypeSearchSchema,
    QuestionTypeResponseSchema,
    QuestionCreateSchema,
    QuestionUpdateSchema,
    QuestionSearchSchema,
    QuestionResponseSchema,
    QuestionTemplateCreateSchema,
    QuestionTemplateUpdateSchema,
    QuestionTemplateResponseSchema,
)
from admin.question.services import question_type, question, template

question_router = APIRouter(prefix="/question")


# ======================== 题型管理 ======================== #


@question_router.post(
    "/type",
    tags=["题型管理"],
    summary="创建题型",
    description="创建一种新的题型",
    response_model=QuestionTypeResponseSchema,
)
async def create_question_type(params: QuestionTypeCreateSchema, db: AsyncSession = Database):
    try:
        return await question_type.create_question_type(db, params)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@question_router.patch(
    "/type/{id}",
    tags=["题型管理"],
    summary="更新题型",
    description="更新指定的题型信息",
    response_model=QuestionTypeResponseSchema,
)
async def update_question_type(
    id: int, params: QuestionTypeUpdateSchema, db: AsyncSession = Database
):
    try:
        return await question_type.update_question_type(db, id, params)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@question_router.delete(
    "/type/{id}",
    tags=["题型管理"],
    summary="删除题型",
    description="删除指定的题型",
)
async def delete_question_type(id: int, db: AsyncSession = Database):
    try:
        await question_type.delete_question_type(db, id)
        return {"message": "删除成功"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@question_router.get(
    "/type/search",
    tags=["题型管理"],
    summary="搜索题型",
    description="根据条件搜索题型列表",
)
async def search_question_types(
    params: QuestionTypeSearchSchema = Depends(), db: AsyncSession = Database
):
    types = await question_type.search_question_types(db, params)
    return {"items": types, "total": len(types)}


@question_router.get(
    "/type/all",
    tags=["题型管理"],
    summary="获取所有题型",
    description="获取所有启用的题型",
)
async def list_all_question_types(db: AsyncSession = Database):
    types = await question_type.list_all_question_types(db)
    return {"items": types, "total": len(types)}


@question_router.get(
    "/type/{id}",
    tags=["题型管理"],
    summary="获取题型详情",
    description="获取指定题型的详细信息",
    response_model=QuestionTypeResponseSchema,
)
async def get_question_type(id: int, db: AsyncSession = Database):
    qt = await question_type.get_question_type(db, id)
    if not qt:
        raise HTTPException(status_code=404, detail=f"题型 {id} 不存在")
    return qt


# ======================== 题目模板管理 ======================== #


@question_router.post(
    "/template",
    tags=["题目模板"],
    summary="创建题目模板",
    response_model=QuestionTemplateResponseSchema,
)
async def create_template(
    data: QuestionTemplateCreateSchema,
    db: AsyncSession = Database,
):
    try:
        result = await template.create_template(db, data)
        return QuestionTemplateResponseSchema.model_validate(result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@question_router.patch(
    "/template/{template_id}",
    tags=["题目模板"],
    summary="更新题目模板",
    response_model=QuestionTemplateResponseSchema,
)
async def update_template(
    template_id: int,
    data: QuestionTemplateUpdateSchema,
    db: AsyncSession = Database,
):
    try:
        result = await template.update_template(db, template_id, data)
        return QuestionTemplateResponseSchema.model_validate(result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@question_router.delete(
    "/template/{template_id}",
    tags=["题目模板"],
    summary="删除题目模板",
)
async def delete_template(
    template_id: int,
    db: AsyncSession = Database,
):
    try:
        await template.delete_template(db, template_id)
        return {"message": "删除成功"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@question_router.get(
    "/template",
    tags=["题目模板"],
    summary="获取题目模板列表",
    response_model=List[QuestionTemplateResponseSchema],
)
async def list_templates(
    question_type_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Database,
):
    templates = await template.list_templates(db, question_type_id, is_active)
    return [QuestionTemplateResponseSchema.model_validate(t) for t in templates]


@question_router.get(
    "/template/{template_id}",
    tags=["题目模板"],
    summary="获取题目模板详情",
    response_model=QuestionTemplateResponseSchema,
)
async def get_template(
    template_id: int,
    db: AsyncSession = Database,
):
    result = await template.get_template(db, template_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"模板 {template_id} 不存在")
    return QuestionTemplateResponseSchema.model_validate(result)


@question_router.post(
    "/template/{template_id}/validate",
    tags=["题目模板"],
    summary="验证题目模板",
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
    response_model=QuestionResponseSchema,
)
async def create_question(params: QuestionCreateSchema, db: AsyncSession = Database):
    try:
        return await question.create_question(db, params)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@question_router.patch(
    "/{id}",
    tags=["题目管理"],
    summary="更新题目",
    description="更新指定的题目信息",
    response_model=QuestionResponseSchema,
)
async def update_question(id: str, params: QuestionUpdateSchema, db: AsyncSession = Database):
    try:
        return await question.update_question(db, id, params)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@question_router.delete(
    "/{id}",
    tags=["题目管理"],
    summary="删除题目",
    description="删除指定的题目",
)
async def delete_question(id: str, db: AsyncSession = Database):
    try:
        await question.delete_question(db, id)
        return {"message": "删除成功"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@question_router.get(
    "/search",
    tags=["题目管理"],
    summary="搜索题目",
    description="根据条件搜索题目列表（分页）",
)
async def search_questions(params: QuestionSearchSchema = Depends(), db: AsyncSession = Database):
    questions, total = await question.search_questions(db, params)
    return {
        "items": questions,
        "total": total,
        "page": params.page,
        "page_size": params.page_size,
    }


@question_router.get(
    "/{id}",
    tags=["题目管理"],
    summary="获取题目详情",
    description="获取指定题目的详细信息",
    response_model=QuestionResponseSchema,
)
async def get_question(id: str, db: AsyncSession = Database):
    q = await question.get_question(db, id)
    if not q:
        raise HTTPException(status_code=404, detail=f"题目 {id} 不存在")
    return q
