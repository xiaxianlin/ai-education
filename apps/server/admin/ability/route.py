"""
能力管理路由
"""

import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from shared.core.database import Database
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    BatchUpdateAtomicSortOrderSchema,
    BatchUpdateDomainSortOrderSchema,
    CreateAbilityAtomicSchema,
    CreateAbilityDomainSchema,
    SearchAbilityAtomicSchema,
    SearchAbilityDomainSchema,
    UpdateAbilityAtomicSchema,
    UpdateAbilityDomainSchema,
)
from .services import atomic, domain

ability_router = APIRouter(prefix="/ability", tags=["能力管理"])

# ======================== 能力域管理 ======================== #


@ability_router.post(
    "/domain",
    summary="创建能力域",
    description="在系统中创建新的能力域",
)
async def create_domain(
    params: CreateAbilityDomainSchema, db: AsyncSession = Database
):
    return await domain.create_domain(db, params)


@ability_router.patch(
    "/domain/batch-sort",
    summary="批量更新能力域排序",
    description="批量更新能力域的排序顺序",
)
async def batch_update_domain_sort(
    params: BatchUpdateDomainSortOrderSchema, db: AsyncSession = Database
):
    updated_count = await domain.batch_update_domain_sort_order(db, params.items)
    return {"message": "排序更新成功", "updated_count": updated_count}


@ability_router.patch(
    "/domain/{id}",
    summary="更新能力域",
    description="更新指定能力域的信息",
)
async def update_domain(
    id: int, params: UpdateAbilityDomainSchema, db: AsyncSession = Database
):
    await domain.update_domain(db, id, params)


@ability_router.delete(
    "/domain/{id}",
    summary="删除能力域",
    description="删除指定的能力域",
)
async def delete_domain(id: int, db: AsyncSession = Database):
    await domain.delete_domain(db, id)


@ability_router.get(
    "/domain/search",
    summary="搜索能力域",
    description="根据条件查询能力域列表（按科目）",
)
async def search_domain(
    params: SearchAbilityDomainSchema = Depends(), db: AsyncSession = Database
):
    return await domain.search_domain(db, params)


@ability_router.get(
    "/domain/{id}",
    summary="获取能力域详情",
    description="获取指定能力域的详细信息",
)
async def get_domain(id: int, db: AsyncSession = Database):
    return await domain.get_domain(db, id)


@ability_router.post(
    "/domain/export",
    summary="导出能力域",
    description="导出指定科目的能力域数据为 JSON 文件",
    response_class=Response,
)
async def export_domains(
    subject: str = Query(..., description="科目"),
    db: AsyncSession = Database,
):
    """导出能力域数据为 JSON 文件"""
    # 获取指定科目的能力域数据
    domains = await domain.export_domains_by_subject(db, subject)

    # 转换为字典列表（只包含创建所需的字段，不包含 id、时间戳等）
    domain_dicts = []
    for domain_schema in domains:
        domain_dict = {
            "subject": domain_schema.subject,
            "code": domain_schema.code,
            "name": domain_schema.name,
            "description": domain_schema.description,
            "sort_order": domain_schema.sort_order,
            "is_active": domain_schema.is_active,
        }
        domain_dicts.append(domain_dict)

    # 转换为 JSON 字符串（格式化）
    json_content = json.dumps(
        domain_dicts,
        ensure_ascii=False,
        indent=2,
        default=str,  # 处理日期等特殊类型
    )

    # 生成文件名（包含时间戳）
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ability-domains-{subject}-{timestamp}.json"

    # 返回文件响应
    return Response(
        content=json_content.encode("utf-8"),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "application/json; charset=utf-8",
        },
    )


@ability_router.get(
    "/by-subject/{subject}",
    summary="根据科目获取能力数据",
    description="根据科目获取能力域及其下的原子能力（二级结构）",
)
async def get_abilities_by_subject(
    subject: str, db: AsyncSession = Database
):
    return await domain.get_domains_with_atomics_by_subject(db, subject)


# ======================== 原子能力管理 ======================== #


@ability_router.post(
    "/atomic",
    summary="创建原子能力",
    description="在系统中创建新的原子能力",
)
async def create_atomic(
    params: CreateAbilityAtomicSchema, db: AsyncSession = Database
):
    return await atomic.create_ability_atomic(db, params)


@ability_router.patch(
    "/atomic/batch-sort",
    summary="批量更新原子能力排序",
    description="批量更新原子能力的排序顺序",
)
async def batch_update_atomic_sort(
    params: BatchUpdateAtomicSortOrderSchema, db: AsyncSession = Database
):
    updated_count = await atomic.batch_update_atomic_sort_order(db, params.items)
    return {"message": "排序更新成功", "updated_count": updated_count}


@ability_router.patch(
    "/atomic/{id}",
    summary="更新原子能力",
    description="更新指定原子能力的信息",
)
async def update_atomic(
    id: int, params: UpdateAbilityAtomicSchema, db: AsyncSession = Database
):
    await atomic.update_ability_atomic(db, id, params)


@ability_router.delete(
    "/atomic/{id}",
    summary="删除原子能力",
    description="删除指定的原子能力",
)
async def delete_atomic(id: int, db: AsyncSession = Database):
    await atomic.delete_ability_atomic(db, id)


@ability_router.get(
    "/atomic/search",
    summary="搜索原子能力",
    description="根据条件查询原子能力列表（支持科目、年级、能力域筛选）",
)
async def search_atomic(
    params: SearchAbilityAtomicSchema = Depends(), db: AsyncSession = Database
):
    return await atomic.search_ability_atomic(db, params)


@ability_router.get(
    "/atomic/{id}",
    summary="获取原子能力详情",
    description="获取指定原子能力的详细信息",
)
async def get_atomic(id: int, db: AsyncSession = Database):
    return await atomic.get_ability_atomic(db, id)


@ability_router.get(
    "/atomic/by-domain/{domain_code}",
    summary="按能力域查询原子能力",
    description="获取指定能力域下的所有原子能力",
)
async def get_atomics_by_domain(
    domain_code: str,
    subject: Optional[str] = None,
    db: AsyncSession = Database,
):
    return await atomic.get_ability_atomics_by_domain(db, domain_code, subject)


@ability_router.post(
    "/atomic/export",
    summary="导出原子能力",
    description="导出指定能力域和年级的原子能力数据为 JSON 文件",
    response_class=Response,
)
async def export_atomics(
    domain_code: str = Query(..., description="能力域代码"),
    subject: str = Query(..., description="科目"),
    grade: int = Query(..., description="年级", ge=1, le=6),
    db: AsyncSession = Database,
):
    """导出原子能力数据为 JSON 文件"""
    # 获取指定年级的原子能力数据
    atomics = await atomic.export_ability_atomics_by_grade(db, subject, grade, domain_code)

    # 转换为字典列表（只包含创建所需的字段，不包含 id、时间戳等）
    atomic_dicts = []
    for atomic_schema in atomics:
        atomic_dict = {
            "subject": atomic_schema.subject,
            "grade": atomic_schema.grade,
            "domain_code": atomic_schema.domain_code,
            "code": atomic_schema.code,
            "name": atomic_schema.name,
            "description": atomic_schema.description,
            "difficulty": atomic_schema.difficulty,
            "sort_order": atomic_schema.sort_order,
        }
        atomic_dicts.append(atomic_dict)

    # 转换为 JSON 字符串（格式化）
    json_content = json.dumps(
        atomic_dicts,
        ensure_ascii=False,
        indent=2,
        default=str,  # 处理日期等特殊类型
    )

    # 生成文件名（包含时间戳）
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"ability-atomics-{domain_code}-grade{grade}-{timestamp}.json"

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
    "/atomic/import",
    summary="导入原子能力",
    description="导入原子能力数据（JSON 文件），先删除指定能力域+年级的全部存量数据，然后保存新数据",
)
async def import_atomics(
    file: UploadFile = File(...),
    domain_code: str = Query(..., description="能力域代码"),
    subject: str = Query(..., description="科目"),
    grade: int = Query(..., description="年级", ge=1, le=6),
    db: AsyncSession = Database,
):
    """导入原子能力数据"""
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
        atomic_schemas = []
        for item in json_data:
            try:
                # 验证数据项
                schema = CreateAbilityAtomicSchema.model_validate(item)

                # 确保所有项的 subject、grade、domain_code 与请求参数一致
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
                if schema.domain_code != domain_code:
                    raise HTTPException(
                        status_code=400,
                        detail=f"数据项中的 domain_code ({schema.domain_code}) 与请求参数 ({domain_code}) 不一致",
                    )

                atomic_schemas.append(schema)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"数据验证失败：{str(e)}，请检查 JSON 文件格式",
                )

        # 删除指定能力域+年级的所有存量数据
        deleted_count = await atomic.delete_atomics_by_grade(db, subject, grade, domain_code)

        # 批量创建新数据
        created_atomics = await atomic.batch_create_ability_atomics(db, atomic_schemas)

        return {
            "message": "导入成功",
            "deleted_count": deleted_count,
            "created_count": len(created_atomics),
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"JSON 解析失败：{str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败：{str(e)}")
