"""练习路由（今日练习 + 单元练习 + 能力评测）"""
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional
from datetime import datetime

from core.database import Database
from student.routes.profile import get_current_student
from core.database import PracticeSession
from student.services.practice import PracticeService
from shared.provider.aliyun import AliyunOSS
from loguru import logger
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
    session = await PracticeService.create_daily_practice(
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
    result = await PracticeService.check_or_create_today_practice(db, student.id)
    return result


@practice_router.get("/daily/progress/{task_id}")
async def get_daily_practice_progress(
    task_id: int,
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取今日练习生成进度（已废弃，不再使用任务服务）
    
    此端点已废弃，现在生成是同步的，不再需要查询进度。
    请使用 /daily/check 端点检查今日练习状态。
    """
    # 返回错误，提示使用新的端点
    from fastapi import HTTPException
    raise HTTPException(
        status_code=410,  # Gone
        detail="此端点已废弃。现在生成是同步的，请使用 /daily/check 端点检查今日练习状态。"
    )


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
    history = await PracticeService.get_practice_history(db, student.id, limit)
    return history


@practice_router.get("/daily/stats")
async def get_daily_practice_stats(
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取今日练习统计数据
    
    返回：
    - today_progress: 今日进度（百分比）
    - daily_questions: 今日题目总数
    - completed_questions: 已完成题目数
    - consecutive_days: 连续天数
    - total_practice: 累计练习次数
    """
    stats = await PracticeService.get_today_stats(db, student.id)
    return stats


@practice_router.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...),
    student=Depends(get_current_student),
):
    """
    上传录音文件到 OSS
    
    返回：
    - audio_url: 录音文件的 OSS URL
    """
    try:
        # 读取文件内容
        file_data = await file.read()
        
        # 生成文件路径
        timestamp = int(datetime.now().timestamp())
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'webm'
        oss_path = f"student_audio/{student.id}/{timestamp}.{file_extension}"
        
        # 上传到 OSS
        oss = AliyunOSS()
        oss.upload(oss_path, file_data)
        
        # 生成访问 URL
        audio_url = f"https://xxl-ai-helper.oss-cn-hangzhou.aliyuncs.com/{oss_path}"
        
        logger.info(f"学生 {student.id} 上传录音文件: {oss_path}")
        
        return {"audio_url": audio_url}
    except Exception as e:
        logger.error(f"上传录音文件失败: {e}")
        raise ValueError(f"上传录音文件失败: {str(e)}")


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
    session_data = await PracticeService.get_practice_session(
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
    result = await PracticeService.submit_answer(
        db,
        student.id,
        params.session_id,
        params.question_id,
        params.answer,
        params.time_spent,
        params.audio_url,
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
    report = await PracticeService.complete_practice(
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
    - count: 题目数量（默认30）
    """
    session = await PracticeService.create_practice_session(
        db, student.id, params.unit_id, params.difficulty, params.count
    )
    return session


@practice_router.get("/unit/incomplete-sessions")
async def get_incomplete_unit_sessions(
    student=Depends(get_current_student),
    db: AsyncSession = Database,
):
    """
    获取所有未完成的单元练习会话
    
    返回：
    - 一个字典，key 为 unit_id，value 为 session_id
    """
    result = await db.execute(
        select(PracticeSession).where(
            and_(
                PracticeSession.student_id == student.id,
                PracticeSession.session_type == "unit",
                PracticeSession.status == "in_progress",
            )
        ).order_by(PracticeSession.create_time.desc())
    )
    sessions = result.scalars().all()
    
    # 返回 unit_id -> session_id 的映射
    incomplete_sessions = {}
    for session in sessions:
        # 如果同一个单元有多个未完成的会话，只保留最新的
        if session.unit_id not in incomplete_sessions:
            incomplete_sessions[session.unit_id] = session.id
    
    return incomplete_sessions


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
    session_data = await PracticeService.get_practice_session(
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
    result = await PracticeService.submit_answer(
        db,
        student.id,
        params.session_id,
        params.question_id,
        params.answer,
        params.time_spent,
        params.audio_url,
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
    report = await PracticeService.complete_practice(
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
    progress = await PracticeService.get_unit_progress(db, student.id, unit_id)
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
    history = await PracticeService.get_practice_history(db, student.id, limit)
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
    test = await PracticeService.create_assessment(
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
    next_question = await PracticeService.get_next_question(
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
    result = await PracticeService.submit_answer(
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
    report = await PracticeService.complete_assessment(
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
    history = await PracticeService.get_assessment_history(db, student.id, limit)
    return history

