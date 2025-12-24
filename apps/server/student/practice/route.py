"""练习路由（日常练习 + 单元练习 + 能力评测）"""

from uuid import uuid4

from fastapi import APIRouter, File, Request, UploadFile
from shared.core.database import Database
from shared.services.practice_session import get_practice_session_data
from shared.worker import Executor, submit_task
from sqlalchemy.ext.asyncio import AsyncSession

from .schema import (
    AnswerQuestionSchema,
    CreatePracticeSchema,
    PracticeSubmitParams,
)
from .services import answer, practice_generate, practice_session

practice_router = APIRouter(prefix="/practice_session")


@practice_router.get(
    "/daily",
    tags=["练习会话"],
    summary="获取日常练习信息",
    description="获取当日练习进度和相关信息",
)
async def get_daily_practices(request: Request, db: AsyncSession = Database):
    student = request.state.student
    return await practice_session.get_daily_practices(db, student.id)


@practice_router.get(
    "/unit/{textbook_id}",
    tags=["练习会话"],
    summary="获取单元练习信息",
    description="获取单元练习进度和相关信息",
)
async def get_unit_practices(textbook_id: int, request: Request, db: AsyncSession = Database):
    student = request.state.student
    return await practice_session.get_unit_practices(db, student.id, textbook_id)


@practice_router.get(
    "/assessment",
    tags=["练习会话"],
    summary="获取综合评估信息",
    description="获取综合能力评估进度和相关信息",
)
async def get_assessments(request: Request, db: AsyncSession = Database):
    student = request.state.student
    return await practice_session.get_assessments(db, student.id)


@practice_router.get(
    "/records/{practice_id}",
    tags=["练习会话"],
    summary="查询练习历史",
    description="根据练习类型（日常、单元、评估）查询最近的练习记录",
)
async def get_practice_history(practice_id: int, request: Request, db: AsyncSession = Database):
    student = request.state.student
    return await practice_session.get_practice_sessions(db, student.id, practice_id, limit=30)


@practice_router.get(
    "/{id}",
    tags=["练习会话"],
    summary="获取练习会话详情",
    description="获取练习会话的详细内容，包括题目和历史回答",
)
async def get_session_detail(session_id: int, request: Request, db: AsyncSession = Database):
    # 获取当前学生信息
    student = request.state.student
    return await get_practice_session_data(db, student.id, session_id)


@practice_router.post(
    "/create",
    tags=["练习会话"],
    summary="创建练习会话（异步）",
    description="提交练习生成请求，由后台异步处理并生成题目",
)
async def create_practice(request: Request, params: CreatePracticeSchema):
    task_id = f"practice_{uuid4().hex[:16]}"
    payload = PracticeSubmitParams(
        type=params.type.value if params.type else None,
        student_id=request.state.student.id,
        textbook_id=params.textbook_id,
        unit_id=params.unit_id,
        practice_id=params.practice_id,
    )

    # 提交任务到队列
    return submit_task(task_id, Executor.generate_practice_task, [payload.model_dump()])


@practice_router.post(
    "/immediately_create",
    tags=["练习会话"],
    summary="立即创建练习会话",
    description="同步创建练习会话并获取题目内容",
)
async def create_practice_immediately(request: Request, params: CreatePracticeSchema, db: AsyncSession = Database):
    student = request.state.student
    return await practice_generate.generate_practice_session(
        db=db,
        type=params.type.value if params.type else None,
        student_id=student.id,
        textbook_id=params.textbook_id,
        unit_id=params.unit_id,
        practice_id=params.practice_id,
    )


@practice_router.post(
    "/{id}/begin",
    tags=["练习会话"],
    summary="开始练习",
    description="标记练习会话为开始状态",
)
async def begin_practice_session(id: int, request: Request, db: AsyncSession = Database):
    # 获取当前学生信息
    student = request.state.student

    # 开始练习
    await practice_session.begin_practice(db, student.id, id)


@practice_router.post(
    "/{id}/complete",
    tags=["练习会话"],
    summary="完成练习",
    description="结束练习会话并生成本次练习的分析报告",
)
async def complete_practice_session(id: int, request: Request, db: AsyncSession = Database):
    # 获取当前学生信息
    student = request.state.student

    # 完成练习并生成报告
    return await practice_session.complete_practice(db, student.id, id)


@practice_router.post(
    "/answer",
    tags=["练习会话"],
    summary="提交练习答案",
    description="学生提交单道题目的回答并获取即时反馈",
)
async def answer_question(params: AnswerQuestionSchema, request: Request, db: AsyncSession = Database):
    # 获取当前学生信息
    student = request.state.student
    return await answer.submit_answer(db, student.id, params)


@practice_router.post(
    "/answer/audio/asr",
    tags=["练习会话"],
    summary="音频答案解析",
    description="上传口语练习音频并利用 AI 进行语音转文字及内容分析",
)
async def asr_audio_answer(audio_file: UploadFile = File(...), db: AsyncSession = Database):
    return await answer.asr_audio_answer(db, await audio_file.read())
