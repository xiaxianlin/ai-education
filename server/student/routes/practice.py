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
    """上传录音文件到 OSS"""


@practice_router.post("/answer")
async def answer_question(
    params: AnswerQuestionSchema, request: Request, db: AsyncSession = Database
):
    """提交练习答案"""


@practice_router.get("/{session_id}/begin")
async def begin_practice_session(request: Request, db: AsyncSession = Database):
    """开始练习"""


@practice_router.post("/{session_id}/complete")
async def complete_practice_practice(
    params: CompletePracticeSchema, request: Request, db: AsyncSession = Database
):
    """完成练习"""
