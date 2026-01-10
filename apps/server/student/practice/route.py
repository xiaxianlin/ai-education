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
from shared.core.database import Database, Question
from shared.core.schema import PracticeAnswerSchema
from shared.practice import answer as answer_service
from shared.practice import practice as practice_service
from shared.practice import practice_generate
from shared.practice.schema import SubmitAnswerSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    AnswerResultSchema,
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
    ability_code: str | None = Query(None, description="原子能力代码（能力练习必填）"),
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
    "/records/{practice_id}",
    tags=["练习"],
    summary="获取练习记录",
    description="获取指定练习类型的记录列表（支持分页）",
)
async def get_practice_records(
    practice_id: int,
    request: Request,
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Database,
):
    """获取练习记录（支持分页）"""
    student = request.state.student

    # practice_id 对应练习类型：1=ability_practice, 2=unit_practice
    practice_type_map = {
        1: "ability_practice",
        2: "unit_practice",
    }

    practice_type = practice_type_map.get(practice_id)
    if not practice_type:
        raise HTTPException(status_code=400, detail=f"无效的练习类型ID: {practice_id}")

    result = await practice_service.get_practices(
        db, student.id, practice_type, page=page, page_size=page_size
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
    description="提交答案，支持复合题",
    response_model=PracticeAnswerSchema,
)
async def submit_answer(
    params: AnswerSchema,
    request: Request,
    db: AsyncSession = Database,
):
    """提交答案"""
    student = request.state.student

    # 使用答题服务保存答题记录
    try:
        submit_params = SubmitAnswerSchema(
            session_id=params.session_id,
            question_id=params.question_id,
            answer=str(params.answer),
            time_spent=params.time_spent or 0,
        )
        result = await answer_service.submit_answer(db, student.id, submit_params)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def evaluate_answer(question: Question, params: AnswerSchema) -> AnswerResultSchema:
    """
    评判答案

    支持：
    - 精确匹配 (exact)
    - 模糊匹配 (fuzzy)
    - 复合题 (composite)
    """
    answer_config = question.answer or {}
    answer_type = answer_config.get("type", "exact")

    if answer_type == "composite":
        # 复合题评判
        return evaluate_composite_answer(question, params)
    elif answer_type == "exact":
        return evaluate_exact_answer(question, params)
    elif answer_type == "fuzzy":
        return evaluate_fuzzy_answer(question, params)
    else:
        # AI 评分等其他类型暂时返回待评判
        return AnswerResultSchema(
            is_correct=False,
            score=0,
            full_score=answer_config.get("scoring", {}).get("full_score", 10),
            feedback="此题型暂不支持自动评判",
        )


def evaluate_exact_answer(question: Question, params: AnswerSchema) -> AnswerResultSchema:
    """精确匹配评判"""
    answer_config = question.answer or {}
    correct_answers = answer_config.get("correct_answers", [])
    scoring = answer_config.get("scoring", {})
    full_score = scoring.get("full_score", 10)

    user_answer = str(params.answer).strip()
    is_correct = user_answer in [str(a).strip() for a in correct_answers]

    return AnswerResultSchema(
        is_correct=is_correct,
        score=full_score if is_correct else 0,
        full_score=full_score,
        feedback="回答正确！" if is_correct else "回答错误，请再试一次。",
        correct_answer=correct_answers[0] if correct_answers and not is_correct else None,
    )


def evaluate_fuzzy_answer(question: Question, params: AnswerSchema) -> AnswerResultSchema:
    """模糊匹配评判"""
    answer_config = question.answer or {}
    correct_answers = answer_config.get("correct_answers", [])
    accept_values = answer_config.get("accept_values", [])
    scoring = answer_config.get("scoring", {})
    full_score = scoring.get("full_score", 10)

    user_answer = str(params.answer).strip().lower()
    all_acceptable = [str(a).strip().lower() for a in correct_answers + accept_values]

    is_correct = user_answer in all_acceptable

    return AnswerResultSchema(
        is_correct=is_correct,
        score=full_score if is_correct else 0,
        full_score=full_score,
        feedback="回答正确！" if is_correct else "回答错误，请再试一次。",
        correct_answer=correct_answers[0] if correct_answers and not is_correct else None,
    )


def evaluate_composite_answer(question: Question, params: AnswerSchema) -> AnswerResultSchema:
    """复合题评判"""
    stem = question.stem or {}
    sub_questions = stem.get("sub_questions", [])
    answer_config = question.answer or {}
    scoring = answer_config.get("scoring", {})
    partial_strategy = scoring.get("partial_strategy", "sum")

    if not sub_questions or not params.sub_answers:
        return AnswerResultSchema(
            is_correct=False,
            score=0,
            full_score=scoring.get("full_score", 10),
            feedback="请完成所有小题",
        )

    # 构建子答案映射
    sub_answer_map = {sa.sub_question_id: sa.answer for sa in params.sub_answers}

    total_score = 0
    full_score = 0
    sub_results = []
    all_correct = True

    for sub_q in sub_questions:
        sub_id = sub_q.get("id")
        sub_answer_config = sub_q.get("answer", {})
        sub_full_score = sub_answer_config.get("scoring", {}).get("full_score", 10)
        full_score += sub_full_score

        user_sub_answer = sub_answer_map.get(sub_id)
        correct_answers = sub_answer_config.get("correct_answers", [])

        if user_sub_answer is None:
            is_sub_correct = False
            sub_score = 0
        else:
            is_sub_correct = str(user_sub_answer).strip() in [
                str(a).strip() for a in correct_answers
            ]
            sub_score = sub_full_score if is_sub_correct else 0

        total_score += sub_score
        all_correct = all_correct and is_sub_correct

        sub_results.append(
            {
                "sub_question_id": sub_id,
                "is_correct": is_sub_correct,
                "score": sub_score,
                "full_score": sub_full_score,
            }
        )

    # 根据策略计算最终得分
    if partial_strategy == "all_or_nothing":
        final_score = full_score if all_correct else 0
    else:  # sum
        final_score = total_score

    return AnswerResultSchema(
        is_correct=all_correct,
        score=final_score,
        full_score=full_score,
        feedback=(
            "全部正确！"
            if all_correct
            else f"正确 {sum(1 for r in sub_results if r['is_correct'])}/{len(sub_results)} 题"
        ),
        sub_results=sub_results,
    )
