"""
学生端路由示例
展示如何使用共享类型定义
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# 导入共享类型
from shared_types import (
    Student,
    StudentLoginRequest,
    StudentLoginResponse,
    PracticeSession,
    PracticeType,
    CreatePracticeRequest,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    Textbook,
    Question,
    ApiResponse,
    PaginatedResponse
)

from server.core.database import get_db
from server.core.auth import get_current_student
from server.student.services.student import StudentService
from server.student.services.practice import PracticeService

router = APIRouter(prefix="/student", tags=["student"])

# 兼容性包装器（如果需要逐步迁移）
def api_response(data=None, message="success", code=0):
    """创建统一的 API 响应格式"""
    return ApiResponse(code=code, message=message, data=data)

def paginated_response(items: List, total: int, page: int, page_size: int, message="success", code=0):
    """创建分页响应格式"""
    data = PaginatedResponse(items=items, total=total, page=page, pageSize=page_size)
    return ApiResponse(code=code, message=message, data=data)

@router.post("/auth/login", response_model=ApiResponse[StudentLoginResponse])
async def login(
    request: StudentLoginRequest,
    db: Session = Depends(get_db)
):
    """
    学生登录
    使用共享类型 StudentLoginRequest 和 StudentLoginResponse
    """
    try:
        service = StudentService(db)
        result = await service.login(request.phone, request.password)

        # 构造响应对象
        response = StudentLoginResponse(
            token=result.token,
            student=result.student
        )

        return api_response(data=response)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile", response_model=ApiResponse[Student])
async def get_profile(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    获取学生信息
    使用共享类型 Student
    """
    # 可以在这里扩展学生信息
    return api_response(data=current_student)

@router.get("/textbooks", response_model=ApiResponse[PaginatedResponse[Textbook]])
async def get_textbooks(
    page: int = 1,
    page_size: int = 10,
    grade: int = None,
    subject: str = None,
    db: Session = Depends(get_db)
):
    """
    获取教材列表
    使用共享类型 Textbook 和分页响应
    """
    try:
        # 这里应该是实际的数据库查询逻辑
        # 示例数据
        textbooks = [
            Textbook(
                id=1,
                subject="数学",
                version="人教版",
                grade=5,
                semester="上学期",
                create_time=1640995200
            ),
            Textbook(
                id=2,
                subject="英语",
                version="人教版",
                grade=5,
                semester="上学期",
                create_time=1640995200
            )
        ]

        # 构造分页响应
        response = paginated_response(
            items=textbooks,
            total=len(textbooks),
            page=page,
            page_size=page_size
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/practices", response_model=ApiResponse[PracticeSession])
async def create_practice(
    request: CreatePracticeRequest,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    创建练习
    使用共享类型 CreatePracticeRequest 和 PracticeSession
    """
    try:
        service = PracticeService(db)
        session = await service.create_practice(
            student_id=current_student.id,
            request=request
        )

        return api_response(data=session)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/practices/answer", response_model=ApiResponse[SubmitAnswerResponse])
async def submit_answer(
    request: SubmitAnswerRequest,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    提交答案
    使用共享类型 SubmitAnswerRequest 和 SubmitAnswerResponse
    """
    try:
        service = PracticeService(db)
        result = await service.submit_answer(
            student_id=current_student.id,
            request=request
        )

        return api_response(data=result)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/practices/{session_id}/questions", response_model=ApiResponse[List[Question]])
async def get_practice_questions(
    session_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    获取练习题目
    使用共享类型 Question
    """
    try:
        service = PracticeService(db)
        questions = await service.get_practice_questions(
            session_id=session_id,
            student_id=current_student.id
        )

        return api_response(data=questions)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 示例：使用共享类型的验证
@router.post("/students", response_model=ApiResponse[Student])
async def create_student(
    student: Student,
    db: Session = Depends(get_db)
):
    """
    创建学生（管理员功能）
    直接使用共享类型 Student 进行验证
    """
    try:
        # 这里应该有实际的创建逻辑
        # student_data = student.dict()
        # db_student = StudentDB(**student_data)
        # db.add(db_student)
        # db.commit()
        # db.refresh(db_student)

        return api_response(data=student, message="学生创建成功")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 导出路由供其他模块使用
__all__ = [
    "router",
    "login",
    "get_profile",
    "get_textbooks",
    "create_practice",
    "submit_answer",
    "get_practice_questions",
    "create_student"
]