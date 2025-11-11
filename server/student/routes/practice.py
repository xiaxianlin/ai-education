"""练习路由（今日练习 + 单元练习 + 能力评测）"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from core.database import Database
from student.routes.profile import get_current_student
from student.services.unit_practice import UnitPracticeService
from student.services.daily_practice import DailyPracticeService
from student.services.assessment import AssessmentService
from admin.schema import (
    CreateUnitPracticeSchema,
    SubmitUnitPracticeAnswerSchema,
    CompleteUnitPracticeSchema,
    CreateDailyPracticeSchema,
    SubmitDailyPracticeAnswerSchema,
    CompleteDailyPracticeSchema,
    CreateAssessmentSchema,
    SubmitAssessmentAnswerSchema,
    CompleteAssessmentSchema,
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


@practice_router.get("/daily/check")
async def check_today_practice(
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    检查或创建今日练习（30道题）
    
    返回：
    - session: 如果已生成，返回会话信息
    - task_id: 如果正在生成，返回任务ID
    - status: 状态（ready/generating/completed）
    - progress: 进度（0-100）
    """
    result = await DailyPracticeService.check_or_create_today_practice(db, student.id)
    return result


@practice_router.get("/daily/progress/{task_id}")
async def get_daily_practice_progress(
    task_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取今日练习生成进度
    
    参数：
    - task_id: 任务ID
    
    返回：
    - status: 任务状态
    - progress: 进度（0-100）
    - session: 如果完成，返回会话信息
    """
    result = await DailyPracticeService.get_generation_progress(db, student.id, task_id)
    return result


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


# ==================== 能力评测 API ====================

@practice_router.post("/assessment")
async def create_assessment(
    params: CreateAssessmentSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    创建能力评测
    
    请求参数：
    - assessment_type: 评测类型 (unit/comprehensive/topic)
    - target_id: 目标ID（可选，单元ID或知识点ID）
    - max_questions: 最大题目数（默认20）
    - min_questions: 最小题目数（默认10）
    
    自适应算法：
    - 根据答题情况动态调整题目难度
    - 快速定位能力边界
    - 提高测试精度
    """
    test = await AssessmentService.create_assessment(
        db,
        student.id,
        params.assessment_type,
        params.target_id,
        params.max_questions,
        params.min_questions,
    )
    return test


@practice_router.get("/assessment/{assessment_id}/next")
async def get_next_assessment_question(
    assessment_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取下一道评测题目（自适应）
    
    返回：
    - question: 题目信息
    - progress: 进度信息
    - current_ability: 当前能力估计
    - confidence: 置信度
    
    如果返回null，表示评测已达到终止条件
    """
    next_question = await AssessmentService.get_next_question(
        db, assessment_id, student.id
    )
    return next_question


@practice_router.post("/assessment/answer")
async def submit_assessment_answer(
    params: SubmitAssessmentAnswerSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    提交评测答案
    
    请求参数：
    - assessment_id: 评测ID
    - question_id: 题目ID
    - answer: 答案
    - time_spent: 耗时（秒）
    
    返回：
    - is_correct: 是否正确
    - correct_answer: 正确答案
    - current_ability: 更新后的能力值
    - confidence: 更新后的置信度
    - answered_count: 已答题目数
    """
    result = await AssessmentService.submit_answer(
        db,
        student.id,
        params.assessment_id,
        params.question_id,
        params.answer,
        params.time_spent,
    )
    return result


@practice_router.post("/assessment/complete")
async def complete_assessment(
    params: CompleteAssessmentSchema,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    完成能力评测
    
    请求参数：
    - assessment_id: 评测ID
    
    返回：
    - assessment_id: 评测ID
    - overall_score: 总分（0-100）
    - ability_level: 能力等级（beginner/intermediate/advanced）
    - answered_count: 答题数
    - total_time: 总用时
    - report: 详细报告
        - knowledge_mastery: 知识点掌握情况
        - ability_breakdown: 能力分解（按难度）
        - learning_speed: 学习速度
        - consistency: 稳定性
        - strengths: 优势
        - weaknesses: 薄弱点
        - recommendations: 学习建议
    """
    report = await AssessmentService.complete_assessment(
        db, student.id, params.assessment_id
    )
    return report


@practice_router.get("/assessment/history")
async def get_assessment_history(
    limit: Optional[int] = 10,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取能力评测历史
    
    参数：
    - limit: 返回记录数，默认10
    """
    history = await AssessmentService.get_assessment_history(db, student.id, limit)
    return history

