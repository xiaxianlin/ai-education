from fastapi import APIRouter, Depends, Query, Request
from shared.core.database import Database
from shared.core.schema import StudentSchema
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    SaveStudentSchema,
    SearchStudentSchema,
    SaveStudentTextbookConfigSchema,
    SetStudentTextbookConfigsSchema,
)
from .services import practice, student, textbook, textbook_config

student_router = APIRouter(prefix="/student", dependencies=[Depends(student.check_student)])

# ======================== 学生管理 ======================== #


@student_router.post(
    "",
    tags=["学生管理"],
    summary="创建学生信息",
    description="创建一名新的学生账号",
)
async def create_student(params: SaveStudentSchema, db: AsyncSession = Database):
    return await student.add_student(db, params)


@student_router.put(
    "/{id}",
    tags=["学生管理"],
    summary="更新学生信息",
    description="更新指定学生的基本信息",
)
async def update_student(params: SaveStudentSchema, request: Request, db: AsyncSession = Database):
    await student.update_student(db, request.state.student, params)


@student_router.delete(
    "/{id}",
    tags=["学生管理"],
    summary="删除学生信息",
    description="删除指定的学生账号",
)
async def delete_student(request: Request, db: AsyncSession = Database):
    await student.delete_student(db, request.state.student)


@student_router.post(
    "/{id}/reset_password",
    tags=["学生管理"],
    summary="重置学生密码",
    description="将指定学生的密码重置为默认值",
)
async def reset_student_password(request: Request, db: AsyncSession = Database):
    return await student.reset_student_password(db, request.state.student)


@student_router.get(
    "/search",
    tags=["学生管理"],
    summary="搜索学生信息",
    description="根据条件查询学生列表",
)
async def search_student(params: SearchStudentSchema = Depends(), db: AsyncSession = Database):
    return await student.search_student(db, params)


@student_router.get(
    "/{id}",
    tags=["学生管理"],
    summary="获取学生详情",
    description="获取指定学生的详细资料",
)
async def get_student_detail(request: Request):
    student = request.state.student
    return StudentSchema.model_validate(student)


# ======================== 学生教材配置管理 ======================== #


@student_router.post(
    "/{id}/textbook-config",
    tags=["学生教材配置管理"],
    summary="创建学生教材配置",
    description="为指定学生创建一条教材配置",
)
async def create_student_textbook_config(
    request: Request, params: SaveStudentTextbookConfigSchema, db: AsyncSession = Database
):
    return await textbook_config.create_student_textbook_config(
        db, request.state.student, params.model_dump()
    )


@student_router.put(
    "/{id}/textbook-config/{config_id}",
    tags=["学生教材配置管理"],
    summary="更新学生教材配置",
    description="更新指定学生的教材配置",
)
async def update_student_textbook_config(
    request: Request,
    config_id: int,
    params: SaveStudentTextbookConfigSchema,
    db: AsyncSession = Database,
):
    return await textbook_config.update_student_textbook_config(
        db, request.state.student, config_id, params.model_dump()
    )


@student_router.delete(
    "/{id}/textbook-config/{config_id}",
    tags=["学生教材配置管理"],
    summary="删除学生教材配置",
    description="删除指定学生的教材配置",
)
async def delete_student_textbook_config(
    request: Request, config_id: int, db: AsyncSession = Database
):
    success = await textbook_config.delete_student_textbook_config(
        db, request.state.student, config_id
    )
    return {"success": success}


@student_router.get(
    "/{id}/textbook-configs",
    tags=["学生教材配置管理"],
    summary="查询学生教材配置列表",
    description="获取指定学生的所有教材配置（支持分页和按学科/年级筛选）",
)
async def get_student_textbook_configs(
    request: Request,
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    subject: str | None = Query(None, description="按学科筛选"),
    grade: int | None = Query(None, description="按年级筛选"),
    db: AsyncSession = Database,
):
    return await textbook_config.search_student_textbook_configs(
        db, request.state.student, page=page, page_size=page_size, subject=subject, grade=grade
    )


@student_router.post(
    "/{id}/textbook-configs",
    tags=["学生教材配置管理"],
    summary="批量设置学生教材配置",
    description="一次性设置学生的教材配置（覆盖旧数据）",
)
async def set_student_textbook_configs(
    request: Request, params: SetStudentTextbookConfigsSchema, db: AsyncSession = Database
):
    textbook_ids = [config.textbook_id for config in params.configs]
    await textbook.set_student_textbook_configs(db, request.state.student, textbook_ids)
    return {"message": "配置设置成功"}


# ======================== 学生练习管理 ======================== #


@student_router.get(
    "/{id}/practices",
    tags=["学生练习管理"],
    summary="查询学生练习历史",
    description="获取指定学生的所有练习记录（支持分页）",
)
async def get_student_practices(
    request: Request,
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Database,
):
    return await practice.get_student_practice_sessions(
        db, request.state.student, page=page, page_size=page_size
    )


@student_router.get(
    "/{id}/practice/{session_id}",
    tags=["学生练习管理"],
    summary="查询学生练习详情",
    description="获取指定学生的练习详情（session_id 为 UUID v4 格式）",
)
async def get_student_practice_data(request: Request, session_id: str, db: AsyncSession = Database):
    return await practice.get_student_practice_session_data(db, request.state.student, session_id)


# ======================== 学生能力掌握度 ======================== #


@student_router.get(
    "/{id}/mastery",
    tags=["学生能力掌握度"],
    summary="查询学生能力掌握度",
    description="获取指定学生的能力掌握度列表，可按科目筛选",
)
async def get_student_mastery(
    request: Request,
    subject: str | None = Query(None, description="科目筛选"),
    db: AsyncSession = Database,
):
    from shared.core.database import AbilityAtomic, StudentAbilityMastery
    from shared.core.schema import StudentAbilityMasterySchema
    from sqlalchemy import select

    student = request.state.student

    # 查询掌握度，关联能力信息
    query = (
        select(
            StudentAbilityMastery,
            AbilityAtomic.name.label("ability_name"),
            AbilityAtomic.domain_code.label("ability_domain"),
            AbilityAtomic.subject,
            AbilityAtomic.grade,
        )
        .outerjoin(
            AbilityAtomic,
            StudentAbilityMastery.ability_code == AbilityAtomic.code,
        )
        .where(StudentAbilityMastery.student_id == student.id)
    )

    if subject:
        query = query.where(AbilityAtomic.subject == subject)

    query = query.order_by(StudentAbilityMastery.mastery_score.asc())

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            **StudentAbilityMasterySchema.model_validate(row[0]).model_dump(),
            "ability_name": row.ability_name,
            "ability_domain": row.ability_domain,
            "subject": row.subject,
            "grade": row.grade,
        }
        for row in rows
    ]


@student_router.get(
    "/{id}/mastery/summary",
    tags=["学生能力掌握度"],
    summary="查询学生能力掌握度概览",
    description="获取指定学生的能力掌握度统计概览",
)
async def get_student_mastery_summary(
    request: Request,
    db: AsyncSession = Database,
):
    from shared.core.database import AbilityAtomic, StudentAbilityMastery
    from sqlalchemy import func, select

    student = request.state.student

    # 1. 统计总体数据
    total_query = select(
        func.count(StudentAbilityMastery.id).label("total"),
        func.avg(StudentAbilityMastery.mastery_score).label("avg_score"),
    ).where(StudentAbilityMastery.student_id == student.id)
    total_result = await db.execute(total_query)
    total_row = total_result.first()

    total_abilities = total_row.total if total_row else 0
    avg_score = round(float(total_row.avg_score or 0), 2) if total_row else 0

    # 2. 统计等级分布
    level_query = (
        select(
            StudentAbilityMastery.mastery_level,
            func.count(StudentAbilityMastery.id).label("count"),
        )
        .where(StudentAbilityMastery.student_id == student.id)
        .group_by(StudentAbilityMastery.mastery_level)
    )
    level_result = await db.execute(level_query)
    level_distribution = {row.mastery_level: row.count for row in level_result.all()}

    # 3. 按能力域统计
    domain_query = (
        select(
            AbilityAtomic.domain_code,
            func.count(StudentAbilityMastery.id).label("ability_count"),
            func.avg(StudentAbilityMastery.mastery_score).label("avg_mastery_score"),
        )
        .join(
            AbilityAtomic,
            StudentAbilityMastery.ability_code == AbilityAtomic.code,
        )
        .where(StudentAbilityMastery.student_id == student.id)
        .group_by(AbilityAtomic.domain_code)
    )
    domain_result = await db.execute(domain_query)

    domain_stats = [
        {
            "domain_code": row.domain_code,
            "ability_count": row.ability_count,
            "avg_mastery_score": round(float(row.avg_mastery_score or 0), 2),
        }
        for row in domain_result.all()
    ]

    return {
        "total_abilities": total_abilities,
        "avg_mastery_score": avg_score,
        "level_distribution": level_distribution,
        "domain_stats": domain_stats,
    }
