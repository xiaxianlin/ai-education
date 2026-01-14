"""
能力管理路由
"""

import json
from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from shared.core.database import Database
from shared.core.schema import AbilitySchema
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    BatchDeleteAbilitySchema,
    CreateAbilitySchema,
    SearchAbilitySchema,
    UpdateAbilitySchema,
)
from .services import ability

ability_router = APIRouter(prefix="/ability", tags=["能力管理"])


@ability_router.get(
    "/by-subject/{subject}",
    summary="根据科目获取能力数据",
    description="根据科目获取能力，按年级分组",
)
async def get_abilities_by_subject(
    subject: str, db: AsyncSession = Database
) -> Dict[str, List[AbilitySchema]]:
    """根据科目获取能力，按年级分组"""
    # 查询该科目下的所有能力
    abilities = await ability.search_ability(db, SearchAbilitySchema(subject=subject))

    # 按年级分组
    result: Dict[str, List[AbilitySchema]] = {}
    for ability_item in abilities:
        grade_key = f"grade_{ability_item.grade}"
        if grade_key not in result:
            result[grade_key] = []
        result[grade_key].append(ability_item)

    return result


# ======================== 能力管理 ======================== #


@ability_router.post(
    "/",
    summary="创建能力",
    description="在系统中创建新的能力",
)
async def create_ability_route(
    params: CreateAbilitySchema, db: AsyncSession = Database
):
    return await ability.create_ability(db, params)


@ability_router.patch(
    "/{id}",
    summary="更新能力",
    description="更新指定能力的信息",
)
async def update_ability_route(
    id: int, params: UpdateAbilitySchema, db: AsyncSession = Database
):
    await ability.update_ability(db, id, params)


@ability_router.delete(
    "/{id}",
    summary="删除能力",
    description="删除指定的能力",
)
async def delete_ability_route(id: int, db: AsyncSession = Database):
    await ability.delete_ability(db, id)


@ability_router.post(
    "/batch_delete",
    summary="批量删除能力",
    description="批量删除指定的能力",
)
async def batch_delete_abilities_route(
    params: BatchDeleteAbilitySchema, db: AsyncSession = Database
):
    deleted_count = await ability.batch_delete_abilities(db, params.ids)
    return {"message": "批量删除成功", "deleted_count": deleted_count}


@ability_router.get(
    "/search",
    summary="搜索能力",
    description="根据条件查询能力列表（支持科目、年级筛选）",
)
async def search_ability_route(
    params: SearchAbilitySchema = Depends(), db: AsyncSession = Database
):
    return await ability.search_ability(db, params)


@ability_router.get(
    "/{id}",
    summary="获取能力详情",
    description="获取指定能力的详细信息",
)
async def get_ability_route(id: int, db: AsyncSession = Database):
    return await ability.get_ability(db, id)


@ability_router.post(
    "/export",
    summary="导出能力",
    description="导出指定学科和年级的能力数据为 JSON 文件",
    response_class=Response,
)
async def export_abilities(
    subject: str = Query(..., description="科目"),
    grade: int = Query(..., description="年级", ge=1, le=6),
    db: AsyncSession = Database,
):
    """导出能力数据为 JSON 文件"""
    # 获取指定年级的能力数据
    abilities = await ability.export_abilities_by_grade(db, subject, grade)

    # 转换为字典列表（只包含创建所需的字段，不包含 id、时间戳等）
    ability_dicts = []
    for ability_schema in abilities:
        ability_dict = {
            "subject": ability_schema.subject,
            "grade": ability_schema.grade,
            "code": ability_schema.code,
            "name": ability_schema.name,
            "description": ability_schema.description,
            "difficulty": ability_schema.difficulty,
        }
        ability_dicts.append(ability_dict)

    # 转换为 JSON 字符串（格式化）
    json_content = json.dumps(
        ability_dicts,
        ensure_ascii=False,
        indent=2,
        default=str,  # 处理日期等特殊类型
    )

    # 生成文件名（包含时间戳）
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ability-{subject}-grade{grade}-{timestamp}.json"

    # 返回文件响应
    return Response(
        content=json_content.encode("utf-8"),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "application/json; charset=utf-8",
        },
    )


@ability_router.post(
    "/import",
    summary="导入能力",
    description="导入能力数据（JSON 文件），先删除指定学科+年级的全部存量数据，然后保存新数据",
)
async def import_abilities(
    file: UploadFile = File(...),
    subject: str = Query(..., description="科目"),
    grade: int = Query(..., description="年级", ge=1, le=6),
    db: AsyncSession = Database,
):
    """导入能力数据"""
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

        # 转换为 Schema 列表并验证数据
        ability_schemas = []
        for item in json_data:
            try:
                # 验证数据项
                schema = CreateAbilitySchema.model_validate(item)

                # 确保所有项的 subject、grade 与请求参数一致
                if schema.subject != subject:
                    raise HTTPException(
                        status_code=400,
                        detail=f"数据项中的 subject ({schema.subject}) 与请求参数 ({subject}) 不一致",
                    )
                if schema.grade != grade:
                    raise HTTPException(
                        status_code=400,
                        detail=f"数据项中的 grade ({schema.grade}) 与请求参数 ({grade}) 不一致",
                    )

                ability_schemas.append(schema)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"数据验证失败：{str(e)}，请检查 JSON 文件格式",
                )

        # 删除指定学科+年级的所有存量数据
        deleted_count = await ability.delete_abilities_by_grade(db, subject, grade)

        # 批量创建新数据
        created_abilities = await ability.batch_create_abilities(db, ability_schemas)

        return {
            "message": "导入成功",
            "deleted_count": deleted_count,
            "created_count": len(created_abilities),
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"JSON 解析失败：{str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败：{str(e)}")
