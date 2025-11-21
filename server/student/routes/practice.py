"""练习路由（每日练习 + 单元练习 + 能力评测）"""

from typing import Dict, List
from fastapi import APIRouter, Request, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Database
from student.schema import AnswerQuestionSchema, PracticeStatsSchem, PracticeHistorySchema
from student.services import textbook, daily_practice, assessment, unit_practice, practice

practice_router = APIRouter(prefix="/practice")


@practice_router.get("/daily")
async def get_daily_practice(request: Request, db: AsyncSession = Database) -> PracticeStatsSchem:
    """获取每日练习信息"""
    # 获取当前学生信息
    student = request.state.student

    result = await daily_practice.check_daily_practice(db, student.id)
    if result:
        return result

    last = await daily_practice.check_last_practice(db, student.id)
    if last:
        return last


@practice_router.post("/daily")
async def create_daily_practice_route(
    request: Request, db: AsyncSession = Database
) -> PracticeStatsSchem:
    """创建每日练习"""
    # 获取当前学生信息
    student = request.state.student

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
    params: AnswerQuestionSchema,
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Database,
):
    """提交练习答案"""


@practice_router.post("/{session_id}/begin")
async def begin_practice_session(session_id: int, request: Request, db: AsyncSession = Database):
    """开始练习"""


@practice_router.post("/{session_id}/complete")
async def complete_practice_practice(
    session_id: int, request: Request, db: AsyncSession = Database
):
    """完成练习，生成练习报告"""
