"""
题型和题目管理 API 路由
"""

import json
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from shared.core.database import Database
from shared.core.schema import (
    QuestionSchema,
    QuestionTypeSchema,
    SearchResultSchema,
)
from sqlalchemy.ext.asyncio import AsyncSession

from admin.question.schema import (
    QuestionBatchDeleteSchema,
    QuestionBatchUpdateSchema,
    QuestionCreateSchema,
    QuestionGenerateSchema,
    QuestionSearchSchema,
    QuestionTypeCreateSchema,
    QuestionTypePromptUpdateSchema,
    QuestionTypeSearchSchema,
    QuestionTypeUpdateSchema,
    QuestionUpdateSchema,
)
from admin.question.services import question, question_type

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


@question_router.post(
    "/type/export",
    tags=["题型管理"],
    summary="导出题型",
    description="导出所有题型数据为 JSON 文件（全量数据）",
    response_class=Response,
)
async def export_question_types(db: AsyncSession = Database):
    """导出题型数据为 JSON 文件（全量数据）"""
    # 获取所有题型数据
    types = await question_type.list_all_question_types(db=db)

    # 转换为 Schema 列表，然后转换为字典
    type_schemas = [QuestionTypeSchema.model_validate(t) for t in types]
    type_dicts = [schema.model_dump() for schema in type_schemas]

    # 转换为 JSON 字符串（格式化）
    json_content = json.dumps(
        type_dicts,
        ensure_ascii=False,
        indent=2,
        default=str,  # 处理日期等特殊类型
    )

    # 生成文件名（包含时间戳）
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"question-types-{timestamp}.json"

    # 返回文件响应
    return Response(
        content=json_content.encode("utf-8"),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "application/json; charset=utf-8",
        },
    )


@question_router.post(
    "/type/import",
    tags=["题型管理"],
    summary="导入题型",
    description="导入题型数据（JSON 文件），先删除全部存量数据，然后保存新数据",
)
async def import_question_types(file: UploadFile = File(...), db: AsyncSession = Database):
    """导入题型数据"""
    # 验证文件类型
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="只支持 JSON 格式文件")

    try:
        # 读取文件内容
        content = await file.read()
        json_data = json.loads(content.decode("utf-8"))

        # 验证数据格式
        if not isinstance(json_data, list):
            raise HTTPException(status_code=400, detail="JSON 文件必须包含一个数组")

        # 转换为 Schema 列表
        type_schemas = []
        for item in json_data:
            try:
                schema = QuestionTypeCreateSchema.model_validate(item)
                type_schemas.append(schema)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"数据验证失败：{str(e)}，请检查 JSON 文件格式",
                )

        # 删除所有存量数据
        deleted_count = await question_type.delete_all_question_types(db)

        # 批量创建新数据
        created_types = await question_type.batch_create_question_types(db, type_schemas)

        return {
            "message": "导入成功",
            "deleted_count": deleted_count,
            "created_count": len(created_types),
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"JSON 解析失败：{str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败：{str(e)}")


@question_router.get(
    "/type/{id}",
    tags=["题型管理"],
    summary="获取题型详情",
    description="获取指定题型的详细信息",
    response_model=QuestionTypeSchema,
)
async def get_question_type(id: int, db: AsyncSession = Database):
    return QuestionTypeSchema.model_validate(await question_type.get_question_type(db, id))


@question_router.get(
    "/type/code/{code}",
    tags=["题型管理"],
    summary="根据编码获取题型",
    description="根据题型编码获取题型详情",
    response_model=QuestionTypeSchema,
)
async def get_question_type_by_code(code: str, db: AsyncSession = Database):
    result = await question_type.get_question_type_by_code(db, code)
    if not result:
        raise HTTPException(status_code=404, detail=f"题型不存在: code={code}")
    return QuestionTypeSchema.model_validate(result)


@question_router.post(
    "/type/{code}/generate",
    tags=["题型管理"],
    summary="生成题目",
    description="根据题型编码生成指定数量的题目",
    response_model=List[QuestionSchema],
)
async def generate_questions(code: str, params: QuestionGenerateSchema, db: AsyncSession = Database):
    """根据题型编码生成题目"""
    from shared.generation import invoke_question_generation_workflow

    questions = await invoke_question_generation_workflow(
        db=db,
        question_type_code=code,
        count=params.count,
    )

    return [QuestionSchema.model_validate(q) for q in questions]


@question_router.patch(
    "/type/{code}/prompt",
    tags=["题型管理"],
    summary="更新提示词",
    description="更新题型的 ai_prompt 字段",
    response_model=QuestionTypeSchema,
)
async def update_question_type_prompt(code: str, params: QuestionTypePromptUpdateSchema, db: AsyncSession = Database):
    """更新题型的提示词"""
    question_type_obj = await question_type.get_question_type_by_code(db, code)
    if not question_type_obj:
        raise HTTPException(status_code=404, detail=f"题型不存在: code={code}")

    update_params = QuestionTypeUpdateSchema(ai_prompt=params.ai_prompt)
    updated = await question_type.update_question_type(db, question_type_obj.id, update_params)
    return QuestionTypeSchema.model_validate(updated)


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
    description="批量更新题目的状态（启用/禁用）",
)
async def batch_update_questions(params: QuestionBatchUpdateSchema, db: AsyncSession = Database):
    """批量更新题目状态"""
    if params.is_active is None:
        raise HTTPException(status_code=400, detail="is_active 参数不能为空")

    updated_count = await question.batch_update_questions(db, params.ids, params.is_active)
    return {"message": "批量更新成功", "updated_count": updated_count}


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
    response_model=QuestionSchema,
)
async def generate_question_resources(id: str, db: AsyncSession = Database):
    """生成题目资源"""
    try:
        result = await question.generate_question_resources(db, id)
        return QuestionSchema.model_validate(result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"资源生成失败: {str(e)}")
