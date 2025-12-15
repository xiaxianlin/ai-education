from fastapi import APIRouter

from shared.core.constants import (
    SUBJECTS,
    TEXTBOOK_VERSIONS,
    SEMESTERS,
    QUESTION_SCENES,
    DIFFICULTY_LEVELS,
)

config_router = APIRouter()


@config_router.get("/configs")
async def configs():
    """获取配置信息"""

    return {
        "subjects": SUBJECTS,
        "textbook_versions": TEXTBOOK_VERSIONS,
        "semesters": SEMESTERS,
        "question_scenes": QUESTION_SCENES,
        "difficulty_levels": DIFFICULTY_LEVELS,
    }
