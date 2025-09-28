from fastapi import APIRouter
from common.constants import *

config_router = APIRouter()


@config_router.get("/configs")
async def configs():
    return {
        "subjects": SUBJECTS,
        "textbook_version": TEXTBOOK_VERSIONS,
        "semesters": SEMESTERS,
        "question_types": QUESTION_TYPES,
    }
