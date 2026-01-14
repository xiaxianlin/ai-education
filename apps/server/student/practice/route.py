# -*- coding: utf-8 -*-
"""
练习路由

支持题型系统的练习功能：
- 提交答案（支持复合题）
- 获取单元练习列表
- 创建练习会话
- 开始/完成练习
- 获取练习详情
- 获取练习记录（支持分页）
"""

from fastapi import APIRouter, HTTPException, Query, Request
from loguru import logger
from shared.core.database import Database
from shared.core.schema import PracticeAnswerSchema
from shared.practice import answer as answer_service
from shared.practice import practice as practice_service
from shared.practice import practice_generate
from shared.practice.schema import SubmitAnswerSchema
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    AnswerSchema,
    CreatePracticeRequest,
    PracticeStatisticsResponseSchema,
)
from .services import statistics

practice_router = APIRouter(prefix="/practice")


# ============ 路由 ============


@practice_router.get(
    "/",
    tags=["练习"],
    summary="获取练习",
    description="获取当前学生的练习（根据练习类型判断）",
)
async def get_practice(
    request: Request,
    practice_type: str = Query(..., description="练习类型: ability_practice/unit_practice"),
    ability_code: str | None = Query(None, description="能力代码（能力练习必填）"),
    unit_id: int | None = Query(None, description="单元ID（单元练习必填）"),
    db: AsyncSession = Database,
):
    """获取练习（返回最新的未完成练习）

    根据 practice_type 判断：
    - ability_practice: 需要 ability_code
    - unit_practice: 需要 unit_id
    """
    student = request.state.student

    if practice_type == "ability_practice":
        if not ability_code:
            raise HTTPException(status_code=400, detail="能力练习需要提供 ability_code")
        practice = await practice_service.get_ability_practice_by_code(db, student.id, ability_code)
    elif practice_type == "unit_practice":
        if not unit_id:
            raise HTTPException(status_code=400, detail="单元练习需要提供 unit_id")
        practice = await practice_service.get_unit_practice_by_id(db, student.id, unit_id)
    else:
        raise HTTPException(status_code=400, detail=f"无效的练习类型: {practice_type}")

    return practice  # 返回单个 PracticeSchema 或 null


@practice_router.post(
    "/create",
    tags=["练习"],
    summary="创建练习会话",
    description="创建新的练习会话",
)
async def create_practice(
    params: CreatePracticeRequest,
    request: Request,
    db: AsyncSession = Database,
):
    """创建练习会话"""
    student = request.state.student

    session_id = await practice_generate.create_practice(
        db=db,
        practice_type=params.type,
        student_id=student.id,
        ability_code=params.ability_code,
        unit_id=params.unit_id,
        immediately=False,
    )

    return session_id


@practice_router.get(
    "/progress/{session_id}",
    tags=["练习"],
    summary="获取练习生成进度",
    description="获取练习会话的生成进度信息",
)
async def get_practice_progress(session_id: str):
    """获取练习生成进度"""
    from shared.services.progress import progress_service

    progress = await progress_service.get_progress(session_id)
    if progress is None:
        return {"progress": 0, "step": "pending", "message": "等待生成"}
    return progress


@practice_router.get(
    "/statistics",
    tags=["练习"],
    summary="获取练习统计数据",
    description="获取当前学生的练习统计数据，包括全部时间和最近30天的统计",
    response_model=PracticeStatisticsResponseSchema,
)
async def get_practice_statistics(
    request: Request,
    db: AsyncSession = Database,
):
    """获取练习统计数据"""
    student = request.state.student
    result = await statistics.get_practice_statistics(db, student.id)
    return result


@practice_router.get(
    "/records",
    tags=["练习"],
    summary="获取练习记录",
    description="获取当前学生的练习记录列表（按年级和学科筛选，支持分页）",
)
async def get_practice_records(
    request: Request,
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Database,
):
    """获取练习记录（支持分页）

    只返回当前学生年级和学科的练习记录，不做类型筛选
    """
    student = request.state.student

    result = await practice_service.get_practices(
        db,
        student.id,
        grade=student.grade,
        subject=student.subject,
        page=page,
        page_size=page_size,
    )
    return result


@practice_router.get(
    "/{session_id}",
    tags=["练习"],
    summary="获取练习详情",
    description="获取练习会话的详细信息",
)
async def get_practice_detail(
    session_id: str,
    request: Request,
    db: AsyncSession = Database,
):
    """获取练习详情"""
    student = request.state.student
    return await practice_service.get_practice_data(db, student.id, session_id)


@practice_router.post(
    "/{session_id}/begin",
    tags=["练习"],
    summary="开始练习",
    description="标记练习会话为进行中状态",
)
async def begin_practice(
    session_id: str,
    request: Request,
    db: AsyncSession = Database,
):
    """开始练习"""
    student = request.state.student
    await practice_service.begin_practice(db, student.id, session_id)
    return {"message": "练习已开始"}


@practice_router.post(
    "/{session_id}/complete",
    tags=["练习"],
    summary="完成练习",
    description="完成练习会话并生成报告",
)
async def complete_practice(
    session_id: str,
    request: Request,
    db: AsyncSession = Database,
):
    """完成练习"""
    student = request.state.student
    report_id = await practice_service.complete_practice(db, student.id, session_id)
    return {"report_id": report_id}


@practice_router.post(
    "/answer",
    tags=["练习"],
    summary="提交答案",
    description="提交答案，支持复合题。错题时返回结构化的正确答案和分析。",
    response_model=PracticeAnswerSchema,
)
async def submit_answer(
    params: AnswerSchema,
    request: Request,
    db: AsyncSession = Database,
):
    """提交答案

    评判逻辑由 shared/practice/evaluator.py 统一处理，支持：
    - exact: 精确匹配（选择题、判断题）
    - fuzzy: 模糊匹配（填空题、简答题）
    - rubric: 评分标准（主观题）
    - ai: AI 评分（口语题、开放题）

    返回的 PracticeAnswerSchema 包含：
    - correct_answer: 结构化正确答案（dict）
    - analysis: 错题反馈（dict），包含 explanation 和 AI 分析
    """
    student = request.state.student

    # 使用答题服务提交答案
    logger.info(f"提交答案: {params}")
    try:
        submit_params = SubmitAnswerSchema(
            session_id=params.session_id,
            question_id=params.question_id,
            answer=params.answer,
            time_spent=params.time_spent,
            audio_url=params.audio_url,
        )
        result = await answer_service.submit_answer(db, student.id, submit_params)
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
