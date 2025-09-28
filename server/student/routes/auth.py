from fastapi import APIRouter
from common.database import Database
from common.schema import ResponseSchema, StudentSchema
from student.schema import LoginSchema
from student.services import auth
from student.services.student import query_student_textbook

auth_router = APIRouter()


@auth_router.get("/check")
async def check(user=auth.CurrentStudent, db=Database):
    data = await auth.get_student(db, user["id"])
    if not data:
        return ResponseSchema(status=401)

    textbooks = await query_student_textbook(db, data.id)

    data = StudentSchema.model_validate(data)
    return ResponseSchema(
        data={
            **data,
            "textbooks": textbooks,
        }
    )


@auth_router.post("/login")
async def login(params: LoginSchema, db=Database):
    token = auth.login(db, params.phone, params.password)
    return ResponseSchema(data=token)
