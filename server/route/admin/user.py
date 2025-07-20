from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import GetDB
from service.admin.user import UserService
from schema import ResponseSchema, StatusSchema
from schema.admin import UserCreateSchema, UserUpdateSchema, UserSearchSchema, UserSubjectCreateSchema


router = APIRouter(prefix="/user")


@router.get("/search")
async def search(params: UserSearchSchema = Depends(), db: AsyncSession = GetDB):
    res = await UserService.search(db, params)
    return ResponseSchema(data=res)


@router.get("/{id}")
async def get_by_id(id: str, db: AsyncSession = GetDB):
    res = await UserService.get_by_id(db, id)
    return ResponseSchema(data=res)


@router.post("/")
async def create(params: UserCreateSchema, db: AsyncSession = GetDB):
    id = await UserService.create(db, params)
    return ResponseSchema(data=id)


@router.patch("/{id}")
async def update(id: str, params: UserUpdateSchema, db: AsyncSession = GetDB):
    await UserService.update(db, id, params)
    return ResponseSchema()


@router.put("/{id}/status")
async def update_status(id: str, params: StatusSchema, db: AsyncSession = GetDB):
    await UserService.update_status(db, id, params.status)
    return ResponseSchema()


@router.delete("/{id}")
async def remove(id: str, db: AsyncSession = GetDB):
    await UserService.delete(db, id)
    return ResponseSchema()


@router.post("/{id}/subject")
async def add_subject(id: str, params: UserSubjectCreateSchema, db: AsyncSession = GetDB):
    await UserService.add_subject(db, id, params)
    return ResponseSchema()


@router.delete("/{id}/subject/{subject_id}")
async def remove_subject(id: str, subject_id: str, db: AsyncSession = GetDB):
    await UserService.remove_subject(db, id, subject_id)
    return ResponseSchema()