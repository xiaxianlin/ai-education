from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import LoginSchema
from common.database import Database
from common.schema import ResponseSchema
from admin.services import auth

auth_router = APIRouter()


@auth_router.post("/login")
async def login(params: LoginSchema, db: AsyncSession = Database):
    data = await auth.login(db, params)
    return ResponseSchema(data=data)
