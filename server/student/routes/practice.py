"""练习路由（每日练习 + 单元练习 + 能力评测）"""

import base64
from typing import Dict, List
from fastapi import APIRouter, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Database
from student.schema import AnswerQuestionSchema, PracticeStatsSchem, PracticeHistorySchema
from student.services import textbook, daily_practice, assessment, unit_practice, practice, answer

practice_router = APIRouter(prefix="/practice")


@practice_router.get("/daily")
async def get_daily_practice(request: Request, db: AsyncSession = Database) -> PracticeStatsSchem:
    """获取每日练习信息"""
    student = request.state.student

    result = await daily_practice.check_daily_practice(db, student.id)
    if result is None:
        raise ValueError("当天没有每日练习")
    return result


@practice_router.post("/daily")
async def create_daily_practice_route(
    request: Request, db: AsyncSession = Database
) -> PracticeStatsSchem:
    """创建每日练习"""
    # 获取当前学生信息
    student = request.state.student

    # 检查是否有正在生成的每日练习
    generating_session = await daily_practice.get_daily_practice(db, student.id)
    if generating_session and generating_session.status == 3:
        raise ValueError("每日练习正在生成中，请稍候")

    # 获取学生当前激活的教材
    active_textbook = await textbook.get_active_textbook(db, student.id)
    if not active_textbook:
        raise ValueError("请先选择教材")

    result = await daily_practice.create_daily_practice(db, student.id, active_textbook)

    return result


@practice_router.get("/assessment")
async def get_assessment(request: Request, db: AsyncSession = Database) -> PracticeStatsSchem:
    """获取能力评估信息"""
    # 获取当前学生信息
    student = request.state.student

    # 检查是否有未完成的能力评估
    result = await assessment.check_assessment(db, student.id)
    if result:
        return result


@practice_router.post("/assessment")
async def create_assessment_route(
    request: Request, db: AsyncSession = Database
) -> PracticeStatsSchem:
    """创建能力评估"""
    # 获取当前学生信息
    student = request.state.student

    # 检查是否有正在生成的能力评估
    from shared.services.practice import PracticeService
    generating_session = await PracticeService.check_generating_session(
        db=db,
        session_type="assessment",
        student_id=student.id,
    )
    if generating_session:
        status_text = "生产中" if generating_session.status == 3 else "生成完成"
        raise ValueError(f"能力评估正在生成中（{status_text}），请稍候")

    # 获取学生当前激活的教材
    active_textbook = await textbook.get_active_textbook(db, student.id)
    if not active_textbook:
        raise ValueError("请先选择教材")

    result = await assessment.create_assessment(db, student.id, active_textbook)

    return result


@practice_router.get("/units/{textbook_id}")
async def get_units_practice_stats(
    textbook_id: int, request: Request, db: AsyncSession = Database
) -> Dict[int, PracticeStatsSchem]:
    """获取指定教材下所有单元的未完成练习记录"""
    # 获取当前学生信息
    student = request.state.student

    result = await unit_practice.get_units_practice_stats(db, student.id, textbook_id)

    return result


@practice_router.get("/unit/{unit_id}")
async def get_unit_practice(
    unit_id: int, request: Request, db: AsyncSession = Database
) -> PracticeStatsSchem:
    """获取指定单元的练习信息"""
    # 获取当前学生信息
    student = request.state.student

    # 检查是否有未完成的单元练习
    result = await unit_practice.check_unit_practice(db, student.id, unit_id)
    if result:
        return result


@practice_router.post("/unit/{unit_id}")
async def create_unit_practice_route(
    unit_id: int, request: Request, db: AsyncSession = Database
) -> PracticeStatsSchem:
    """创建单元练习"""
    # 获取当前学生信息
    student = request.state.student

    # 检查是否有正在生成的单元练习
    from shared.services.practice import PracticeService
    generating_session = await PracticeService.check_generating_session(
        db=db,
        session_type="unit_practice",
        student_id=student.id,
        unit_id=unit_id,
    )
    if generating_session:
        status_text = "生产中" if generating_session.status == 3 else "生成完成"
        raise ValueError(f"单元练习正在生成中（{status_text}），请稍候")

    result = await unit_practice.create_unit_practice(db, student.id, unit_id)

    return result


@practice_router.get("/history/{type}")
async def get_practice_history_route(
    type: str, request: Request, db: AsyncSession = Database
) -> List[PracticeHistorySchema]:
    """根据类型获取最近 30 条练习记录，type 可选值：daily_practice/unit_practice/assessment"""
    # 获取当前学生信息
    student = request.state.student

    # 验证练习类型
    valid_types = ["daily_practice", "unit_practice", "assessment"]
    if type not in valid_types:
        raise ValueError(f"无效的练习类型，可选值：{', '.join(valid_types)}")

    # 获取练习历史记录
    result = await practice.get_practice_history(db, student.id, type, limit=30)

    return result


@practice_router.post("/answer")
async def answer_question(
    params: AnswerQuestionSchema, request: Request, db: AsyncSession = Database
):
    """
    提交练习答案

    Args:
        params.session_id: 练习会话ID
        params.question_id: 题目ID
        params.answer: 用户答案
        params.time_spent: 答题耗时（秒）
        params.is_audio_answer: 是否为音频回答
        params.audio_data: 音频数据（base64编码字符串）
    """
    # 获取当前学生信息
    student = request.state.student

    # 如果是音频答案，解码 base64 数据
    audio_bytes = None
    if params.is_audio_answer and params.audio_data:
        try:
            audio_bytes = base64.b64decode(params.audio_data)
        except Exception as e:
            raise ValueError(f"音频数据解码失败: {str(e)}")

    # 提交答案
    result = await answer.submit_answer(
        db=db,
        student_id=student.id,
        session_id=params.session_id,
        question_id=params.question_id,
        answer=params.answer,
        time_spent=params.time_spent,
        is_video_answer=params.is_audio_answer,
        audio_bytes=audio_bytes,
    )

    return result


@practice_router.post("/{session_id}/begin")
async def begin_practice_session(session_id: int, request: Request, db: AsyncSession = Database):
    """开始练习"""
    # 获取当前学生信息
    student = request.state.student

    # 开始练习
    result = await practice.begin_practice(db, student.id, session_id)

    return result


@practice_router.post("/{session_id}/complete")
async def complete_practice_practice(
    session_id: int, request: Request, db: AsyncSession = Database
):
    """完成练习，生成练习报告"""
    # 获取当前学生信息
    student = request.state.student

    # 完成练习并生成报告
    report_id = await practice.complete_practice(db, student.id, session_id)

    return {"report_id": report_id}


@practice_router.get("/session/{session_id}")
async def get_session_detail(
    session_id: int, request: Request, db: AsyncSession = Database
) -> Dict:
    """
    获取练习会话详情
    
    包括：
    - 会话基本信息
    - 问题列表（按顺序）
    - 已提交的答案
    - 已完成练习的报告（如果存在）
    
    Args:
        session_id: 练习会话ID
        
    Returns:
        会话详情，包含session、questions、answers、report
    """
    # 获取当前学生信息
    student = request.state.student
    
    # 获取会话详情
    result = await practice.get_session_detail(db, student.id, session_id)
    
    return result
