"""练习路由（今日练习 + 单元练习）"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from common.database import Database
from student.routes.profile import get_current_student
from student.services.unit_practice import UnitPracticeService
from student.services.daily_practice import DailyPracticeService
from admin.schema import (
    CreateUnitPracticeSchema,
    SubmitUnitPracticeAnswerSchema,
    CompleteUnitPracticeSchema,
    CreateDailyPracticeSchema,
    SubmitDailyPracticeAnswerSchema,
    CompleteDailyPracticeSchema,
)

practice_router = APIRouter(prefix="/practice")


# ==================== 今日练习 API ====================

@practice_router.post("/daily")
async def create_daily_practice(
    params: CreateDailyPracticeSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    创建今日练习会话
    
    请求参数：
    - count: 题目数量（默认10）
    - practice_type: 练习类型（默认daily）
    
    智能推荐算法：
    - 30% 错题复习
    - 40% 巩固练习
    - 20% 挑战题目
    - 10% 新知识点
    """
    session = await DailyPracticeService.create_daily_practice(
        db, student.id, params.count, params.practice_type
    )
    return session


@practice_router.get("/daily/{session_id}")
async def get_daily_practice_session(
    session_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取今日练习会话详情
    
    返回：
    - 会话信息
    - 题目列表
    """
    session_data = await DailyPracticeService.get_practice_session(
        db, session_id, student.id
    )
    if not session_data:
        raise ValueError("练习会话不存在")
    return session_data


@practice_router.post("/daily/answer")
async def submit_daily_practice_answer(
    params: SubmitDailyPracticeAnswerSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    提交今日练习答案
    
    请求参数：
    - session_id: 会话ID
    - question_id: 题目ID
    - answer: 答案
    - time_spent: 耗时（秒）
    
    返回：
    - is_correct: 是否正确
    - correct_answer: 正确答案
    - explanation: 解析
    """
    result = await DailyPracticeService.submit_answer(
        db,
        student.id,
        params.session_id,
        params.question_id,
        params.answer,
        params.time_spent,
    )
    return result


@practice_router.post("/daily/complete")
async def complete_daily_practice(
    params: CompleteDailyPracticeSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    完成今日练习
    
    请求参数：
    - session_id: 会话ID
    
    返回：
    - 练习报告，包括总分、知识点掌握情况、题目分布等
    """
    report = await DailyPracticeService.complete_practice(
        db, student.id, params.session_id
    )
    return report


@practice_router.get("/daily/history")
async def get_daily_practice_history(
    limit: Optional[int] = 30,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取今日练习历史
    
    参数：
    - limit: 返回记录数，默认30
    """
    history = await DailyPracticeService.get_practice_history(db, student.id, limit)
    return history


# ==================== 单元练习 API ====================


@practice_router.post("/unit")
async def create_unit_practice(
    params: CreateUnitPracticeSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    创建单元练习会话
    
    请求参数：
    - unit_id: 单元ID
    - difficulty: 难度 (easy/medium/hard/adaptive)
    - count: 题目数量
    """
    session = await UnitPracticeService.create_practice_session(
        db, student.id, params.unit_id, params.difficulty, params.count
    )
    return session


@practice_router.get("/unit/{session_id}")
async def get_unit_practice_session(
    session_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取单元练习会话详情
    
    返回：
    - 会话信息
    - 题目列表
    - 单元信息
    """
    session_data = await UnitPracticeService.get_practice_session(
        db, session_id, student.id
    )
    if not session_data:
        raise ValueError("练习会话不存在")
    return session_data


@practice_router.post("/unit/answer")
async def submit_unit_practice_answer(
    params: SubmitUnitPracticeAnswerSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    提交单道题目的答案
    
    请求参数：
    - session_id: 会话ID
    - question_id: 题目ID
    - answer: 答案
    - time_spent: 耗时（秒）
    
    返回：
    - is_correct: 是否正确
    - correct_answer: 正确答案
    - explanation: 解析
    """
    result = await UnitPracticeService.submit_answer(
        db,
        student.id,
        params.session_id,
        params.question_id,
        params.answer,
        params.time_spent,
    )
    return result


@practice_router.post("/unit/complete")
async def complete_unit_practice(
    params: CompleteUnitPracticeSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    完成单元练习
    
    请求参数：
    - session_id: 会话ID
    
    返回：
    - 练习报告，包括总分、知识点掌握情况等
    """
    report = await UnitPracticeService.complete_practice(
        db, student.id, params.session_id
    )
    return report


@practice_router.get("/unit/{unit_id}/progress")
async def get_unit_progress(
    unit_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取单元学习进度
    
    返回：
    - 总体完成度
    - 各知识点掌握情况
    - 练习历史
    """
    progress = await UnitPracticeService.get_unit_progress(db, student.id, unit_id)
    return progress


@practice_router.get("/history")
async def get_practice_history(
    limit: Optional[int] = 20,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取学生的单元练习历史
    
    参数：
    - limit: 返回记录数，默认20
    """
    history = await UnitPracticeService.get_practice_history(db, student.id, limit)
    return history

