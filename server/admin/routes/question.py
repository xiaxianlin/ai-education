from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import SearchQuestionSchema, UpdateQuestionSchema
from admin.services import question
from common.database import Database
from common.schema import ResponseSchema

question_router = APIRouter(prefix="/question")


@question_router.patch("/{id}")
async def update_question(id: str, update: UpdateQuestionSchema, db: AsyncSession = Database):
    await question.update_question(db, id, update)
    


@question_router.delete("/{id}")
async def delete_question(id: str, db: AsyncSession = Database):
    await question.delete_question(db, id)
    


@question_router.get("/search")
async def list_questions(params: SearchQuestionSchema = Depends(), db: AsyncSession = Database):
    data = await question.search_question(db, params)
    return ResponseSchema(data=data)


@question_router.get("/{id}")
async def get_question(id: str, db: AsyncSession = Database):
    data = await question.get_question(db, id)
    return ResponseSchema(data=data)
