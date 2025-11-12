from fastapi import APIRouter, Query
from core.schema import ResponseSchema
from core.constants import *

config_router = APIRouter()


@config_router.post("/configs")
async def configs(
    subject: str = Query(None, description="科目名称"),
    grade: int = Query(None, description="年级（1-12）"),
):
    """
    获取配置信息
    
    如果提供了 subject 和 grade，则返回对应科目和年级的题型列表
    否则返回所有题型的聚合列表（QUESTION_TYPES）
    """
    question_types = QUESTION_TYPES  # 默认返回所有题型的聚合
    if subject and grade:
        question_types = get_question_types(subject, grade)
    
    data = {
        "subjects": SUBJECTS,
        "textbook_versions": TEXTBOOK_VERSIONS,
        "semesters": SEMESTERS,
        "question_types": question_types,
    }

    return ResponseSchema(data=data)
