"""
题型和题目管理 API 路由
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from shared.core.database import Database
from shared.core.schema import (
    QuestionSchema,
    QuestionTypeSchema,
    SearchResultSchema,
)
from sqlalchemy.ext.asyncio import AsyncSession

from admin.question.schema import (
    AbilityPracticeSearchSchema,
    QuestionBatchDeleteSchema,
    QuestionBatchUpdateSchema,
    QuestionCreateSchema,
    QuestionGenerateSchema,
    QuestionSearchSchema,
    QuestionTypeConfigsUpdateSchema,
    QuestionTypePromptUpdateSchema,
    QuestionTypeSaveSchema,
    QuestionUpdateSchema,
)
from admin.question.services import question, question_type
from admin.question.services.question_type import (
    get_question_type_by_code as get_question_type_by_code_service,
)
from admin.question.services.question_type import (
    read_prompt_file,
    write_prompt_file,
)
from admin.question.services.question_type import (
    update_question_type_configs as update_question_type_configs_service,
)

question_router = APIRouter(prefix="/question")


# ======================== 题型管理 ======================== #


@question_router.post(
    "/type",
    tags=["题型管理"],
    summary="保存题型",
    description="保存题型信息",
)
async def save_question_type(params: QuestionTypeSaveSchema, db: AsyncSession = Database):
    if params.id:
        await question_type.update_question_type(db, params.id, params)
    else:
        await question_type.create_question_type(db, params)


@question_router.delete(
    "/type/{id}",
    tags=["题型管理"],
    summary="删除题型",
    description="删除指定的题型",
)
async def delete_question_type(id: int, db: AsyncSession = Database):
    await question_type.delete_question_type(db, id)


@question_router.get(
    "/type/units",
    tags=["题型管理"],
    summary="搜索单元练习题型",
    description="搜索单元练习类型的题型列表（分页）",
)
async def search_unit_practice_types(db: AsyncSession = Database):
    """搜索单元练习题型，固定 category 为 unit_practice"""
    return await question_type.search_unit_practice_types(db)


@question_router.get(
    "/type/abilities",
    tags=["题型管理"],
    summary="搜索能力练习题型",
    description="搜索能力练习类型的题型列表",
)
async def search_ability_practice_types(params: AbilityPracticeSearchSchema = Depends(), db: AsyncSession = Database):
    """搜索能力练习题型，subject 和 grade 是必要条件"""
    return await question_type.search_ability_practice_types(db, params)


@question_router.get(
    "/type/{code}",
    tags=["题型管理"],
    summary="获取题型详情",
    description="根据 code 获取题型详情（包含 configs）",
    response_model=QuestionTypeSchema,
)
async def get_question_type_by_code(code: str, db: AsyncSession = Database):
    """根据 code 获取题型详情"""
    question_type = await get_question_type_by_code_service(db, code)
    return QuestionTypeSchema.model_validate(question_type)


@question_router.get(
    "/type/{code}/prompt",
    tags=["题型管理"],
    summary="获取题型 prompt",
    description="读取题型的 prompt 文件内容",
)
async def get_question_type_prompt(code: str):
    """获取题型的 prompt 文件内容"""
    return {"prompt": read_prompt_file(code)}


@question_router.patch(
    "/type/{code}/prompt",
    tags=["题型管理"],
    summary="更新题型 prompt",
    description="更新题型的 prompt 文件内容",
)
async def update_question_type_prompt(code: str, params: QuestionTypePromptUpdateSchema):
    """更新题型的 prompt 文件"""
    write_prompt_file(code, params.prompt)
    return {"message": "prompt 更新成功"}


@question_router.patch(
    "/type/{code}/configs",
    tags=["题型管理"],
    summary="更新题型 configs",
    description="更新题型的 configs 配置",
    response_model=QuestionTypeSchema,
)
async def update_question_type_configs(code: str, params: QuestionTypeConfigsUpdateSchema, db: AsyncSession = Database):
    """更新题型的 configs 配置"""
    question_type = await update_question_type_configs_service(db, code, params.configs)
    return QuestionTypeSchema.model_validate(question_type)


@question_router.post(
    "/type/{code}/generate",
    tags=["题型管理"],
    summary="生成题目",
    description="根据题型编码生成指定数量的题目",
    response_model=List[QuestionSchema],
)
async def generate_questions(code: str, params: QuestionGenerateSchema):
    """根据题型编码生成题目"""
    from shared.generation import invoke_question_generation_workflow

    questions = await invoke_question_generation_workflow(
        question_type_code=code,
        count=params.count,
    )

    return [QuestionSchema.model_validate(q) for q in questions]


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


@question_router.post(
    "/batch_delete",
    tags=["题目管理"],
    summary="批量删除题目",
    description="批量删除指定的题目",
)
async def batch_delete_questions(params: QuestionBatchDeleteSchema, db: AsyncSession = Database):
    deleted_count = await question.delete_questions_batch(db, params.ids)
    return {"message": "批量删除成功", "deleted_count": deleted_count}


@question_router.patch(
    "/batch_update",
    tags=["题目管理"],
    summary="批量更新题目",
    description="批量更新题目的状态（已废弃：is_active 字段已删除）",
)
async def batch_update_questions(params: QuestionBatchUpdateSchema, db: AsyncSession = Database):
    """批量更新题目状态

    TODO: 此功能已废弃，原 is_active 字段已删除。
    如需批量更新功能，需要重新设计（可能使用软删除或状态字段）。
    """
    raise HTTPException(
        status_code=501, detail="批量更新题目功能已废弃，原 is_active 字段已删除。如需此功能，需要重新设计。"
    )


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


@question_router.post(
    "/{id}/generate_resources",
    tags=["题目管理"],
    summary="生成题目资源",
    description="根据题目的 resources 字段定义，生成所有需要的资源（图片、音频等）",
)
async def generate_question_resources(id: str, db: AsyncSession = Database):
    """生成题目资源"""
    await question.generate_question_resources(db, id)
