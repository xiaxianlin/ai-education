"""练习路由（今日练习 + 单元练习 + 能力评测）"""

from fastapi import APIRouter, Request, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Database
from student.schema import AnswerQuestionSchema, CompletePracticeSchema

practice_router = APIRouter(prefix="/practice")


@practice_router.get("/daily")
async def get_daily_practice(request: Request, db: AsyncSession = Database):
    """获取今日练习信息"""


@practice_router.get("/history/{type}")
async def get_practice_history(type: str, request: Request, db: AsyncSession = Database):
    """根据练习类型获取练习历史，type 可选值：daily/unit/assessment"""


@practice_router.post("/upload-audio")
async def upload_audio(request: Request, file: UploadFile = File(...)):
    """
    上传录音文件到 OSS

    返回：
    - audio_url: 录音文件的 OSS URL
    """


@practice_router.post("/answer")
async def answer_question(
    params: AnswerQuestionSchema, request: Request, db: AsyncSession = Database
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


@practice_router.get("/session/{session_id}")
async def get_practice_session(request: Request, db: AsyncSession = Database):
    """获取练习信息"""


@practice_router.post("/session/{session_id}/complete")
async def complete_daily_practice(
    params: CompletePracticeSchema, request: Request, db: AsyncSession = Database
):
    """
    完成今日练习

    请求参数：
    - session_id: 会话ID

    返回：
    - 练习报告，包括总分、知识点掌握情况、题目分布等
    """
