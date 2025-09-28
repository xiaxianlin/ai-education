from fastapi import APIRouter
from common.schema import ResponseSchema
from common.constants import *

config_router = APIRouter()


@config_router.post("/configs")
async def configs():
    data = {
        "subjects": SUBJECTS,
        "textbook_version": TEXTBOOK_VERSIONS,
        "semesters": SEMESTERS,
        "question_types": QUESTION_TYPES,
    }

    return ResponseSchema(data=data)
