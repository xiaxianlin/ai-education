from fastapi import APIRouter

from shared.core.constants import (
    SUBJECTS,
    TEXTBOOK_VERSIONS,
    SEMESTERS,
    question_types,
    DIFFICULTY_LEVELS,
    question_types,
)

config_router = APIRouter()


@config_router.get("/configs")
async def configs():
    """获取配置信息"""

    return {
        "subjects": SUBJECTS,
        "textbook_versions": TEXTBOOK_VERSIONS,
        "semesters": SEMESTERS,
        "question_types": question_types,
        "difficulty_levels": DIFFICULTY_LEVELS,
        "question_types": question_types,
        "providers": ["aliyun"],
    }
