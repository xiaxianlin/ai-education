"""练习路由（每日练习 + 单元练习 + 能力评测）"""

from typing import Dict
from uuid import uuid4

from fastapi import APIRouter, File, Form, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Database
from shared.worker import Executor, get_task_status, submit_task
from student.schema import (
    AnswerQuestionSchema,
    CreatePracticeSchema,
    PracticeSubmitParams,
    PracticeType,
)
from student.services import answer, practice, practice_generate

practice_router = APIRouter(prefix="/practice")


@practice_router.get("/daily/{textbook_id}")
async def get_daily_practice(textbook_id: int, request: Request, db: AsyncSession = Database):
    """获取每日练习信息"""
    student = request.state.student
    return await practice.get_daily_practice(db, student.id, textbook_id)


@practice_router.get("/unit/{unit_id}")
async def get_unit_practice(unit_id: int, request: Request, db: AsyncSession = Database):
    """获取单元练习信息"""
    student = request.state.student
    return await practice.get_unit_practice(db, student.id, unit_id)


@practice_router.get("/assessment/{textbook_id}")
async def get_assessment(textbook_id: int, request: Request, db: AsyncSession = Database):
    """获取能力评估信息"""
    student = request.state.student
    return await practice.get_assessment(db, student.id, textbook_id)


@practice_router.post("/create")
async def create_practice(request: Request, params: CreatePracticeSchema):
    """创建练习会话（异步任务）

    提交练习生成任务到任务队列，等待任务进入进行中状态后返回任务ID。
    客户端也可以继续通过 /task/{task_id} 接口轮询任务状态。
    """

    task_id = f"practice_{uuid4().hex[:16]}"
    payload = PracticeSubmitParams(
        type=params.type.value,
        student_id=request.state.student.id,
        textbook_id=params.textbook_id,
        unit_id=params.unit_id,
    )

    # 提交任务到队列
    return submit_task(task_id, Executor.generate_practice_task, [payload.model_dump()])


@practice_router.post("/immediately_create")
async def create_practice_immediately(
    request: Request, params: CreatePracticeSchema, db: AsyncSession = Database
):
    """立即创建练习会话"""
    student = request.state.student
    return await practice_generate.generate_practice_session(
        db=db,
        type=params.type.value,
        student_id=student.id,
        textbook_id=params.textbook_id,
        unit_id=params.unit_id,
    )


@practice_router.get("/task/{task_id}/status")
async def get_practice_task_status(task_id: str):
    """查询练习生成任务状态"""
    return get_task_status(task_id)


@practice_router.get("/detail/{session_id}")
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
    return await practice.get_session_detail(db, student.id, session_id)


@practice_router.get("/history/{type}")
async def get_practice_history(type: PracticeType, request: Request, db: AsyncSession = Database):
    """根据类型获取最近 30 条练习记录，type 可选值：daily_practice/unit_practice/assessment"""
    student = request.state.student
    return await practice.get_practice_history(db, student.id, type.value, limit=30)


@practice_router.post("/{session_id}/begin")
async def begin_practice_session(session_id: int, request: Request, db: AsyncSession = Database):
    """开始练习"""
    # 获取当前学生信息
    student = request.state.student

    # 开始练习
    await practice.begin_practice(db, student.id, session_id)


@practice_router.post("/answer")
async def answer_question(
    params: AnswerQuestionSchema, request: Request, db: AsyncSession = Database
):
    """提交练习答案"""
    # 获取当前学生信息
    student = request.state.student

    return await answer.submit_answer(db, student.id, params)


@practice_router.post("/{session_id}/complete")
async def complete_practice_session(session_id: int, request: Request, db: AsyncSession = Database):
    """完成练习，生成练习报告"""
    # 获取当前学生信息
    student = request.state.student

    # 完成练习并生成报告
    return await practice.complete_practice(db, student.id, session_id)


@practice_router.post("/answer/audio/analyze")
async def analyze_audio_answer(
    request: Request,
    session_id: int = Form(...),
    question_id: int = Form(...),
    audio_type: str = Form(...),
    audio_file: UploadFile = File(...),
    db: AsyncSession = Database,
):
    """上传录音并进行语音识别"""
    return await practice.analyze_audio_answer(
        db=db,
        student_id=request.state.student.id,
        session_id=session_id,
        question_id=question_id,
        audio_type=audio_type,
        audio_data=await audio_file.read(),
    )
