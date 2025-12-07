"""练习路由（每日练习 + 单元练习 + 能力评测）"""

from typing import Dict
from fastapi import APIRouter, Request, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Database
from student.schema import (
    PracticeType,
    AnswerQuestionSchema,
    CreatePracticeSchema,
    UploadRecordingResultSchema,
)
from student.services import practice, answer


practice_router = APIRouter(prefix="/practice")


@practice_router.get("/daily")
async def get_daily_practice(request: Request, db: AsyncSession = Database):
    """获取每日练习信息"""
    student = request.state.student
    return await practice.get_daily_practice(db, student.id)


@practice_router.get("/unit")
async def get_unit_practice(request: Request, db: AsyncSession = Database):
    """获取单元练习信息"""
    student = request.state.student
    return await practice.get_unit_practice(db, student.id)


@practice_router.get("/assessment")
async def get_assessment(request: Request, db: AsyncSession = Database):
    """获取能力评估信息"""
    student = request.state.student
    return await practice.get_assessment(db, student.id)


@practice_router.post("/create")
async def create_practice(
    request: Request,
    params: CreatePracticeSchema,
    db: AsyncSession = Database,
):
    """创建练习会话"""
    type = params.type
    params = params.model_dump()
    params["db"] = db
    params["student_id"] = request.state.student.id

    if type == "daily_practice":
        return await practice.create_daily_practice(**params)

    if type == "unit_practice":
        return await practice.create_unit_practice(**params)

    if type == "assessment":
        return await practice.create_assessment(**params)


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
async def get_practice_history(
    type: PracticeType, request: Request, db: AsyncSession = Database
):
    """根据类型获取最近 30 条练习记录，type 可选值：daily_practice/unit_practice/assessment"""
    student = request.state.student
    return await practice.get_practice_history(db, student.id, type.value, limit=30)


@practice_router.post("/{session_id}/begin")
async def begin_practice_session(
    session_id: int, request: Request, db: AsyncSession = Database
):
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
async def complete_practice_session(
    session_id: int, request: Request, db: AsyncSession = Database
):
    """完成练习，生成练习报告"""
    # 获取当前学生信息
    student = request.state.student

    # 完成练习并生成报告
    return await practice.complete_practice(db, student.id, session_id)


@practice_router.post(
    "/answer/{session_id}/{question_id}/upload",
    response_model=UploadRecordingResultSchema,
)
async def upload_recording(
    request: Request,
    session_id: int,
    question_id: int,
    audio_file: UploadFile = File(...),
    db: AsyncSession = Database,
):
    """
    上传录音接口

    接收录音 blob 数据后上传到 OSS，然后通过 ASR 进行语音识别

    Args:
        session_id: 练习会话ID
        question_id: 问题ID
        audio_file: 音频文件 (blob)

    Returns:
        oss_path: OSS 存储路径
        transcription: 语音识别结果
    """
    student = request.state.student

    # 读取文件内容
    audio_data = await audio_file.read()

    # 从文件名获取扩展名，默认为 webm
    filename = audio_file.filename or "audio.webm"
    audio_type = filename.split(".")[-1] if "." in filename else "webm"

    oss_path, analysis = await practice.upload_recording(
        db=db,
        student_id=student.id,
        session_id=session_id,
        question_id=question_id,
        audio_data=audio_data,
        audio_type=audio_type,
    )

    return UploadRecordingResultSchema(
        oss_path=oss_path,
        transcription=analysis.recognized_text,
        match=analysis.match,
        analysis=analysis.analysis,
    )
