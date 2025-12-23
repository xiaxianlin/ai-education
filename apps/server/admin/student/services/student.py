import uuid

from fastapi import Request
from loguru import logger
from shared.core.database import (
    AsyncSessionLocal,
    Practice,
    Student,
    StudentPractice,
    StudentTextbook,
    Textbook,
)
from shared.core.schema import SearchResultSchema, StudentSchema
from shared.utils import encrypt
from shared.utils.time import now
from sqlalchemy import and_, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import SaveStudentSchema, SearchStudentSchema


async def check_student(request: Request):
    """检查学生是否存在，如果路由中没有 ID 则跳过检查"""
    id = request.path_params.get("id")
    if not id:
        request.state.student = None
        return  # 过滤掉不含 ID 的路由

    async with AsyncSessionLocal() as db:
        student = await db.scalar(select(Student).where(Student.id == id))
        if not student:
            raise ValueError("学生不存在")
        request.state.student = StudentSchema.model_validate(student)
        logger.info(f"学生信息: {request.state.student}")


async def search_student(db: AsyncSession, params: SearchStudentSchema):
    """搜索学生"""
    stmt = select(Student)

    conditions = []
    if params.name:
        conditions.append(Student.name.contains(params.name))
    if params.phone:
        conditions.append(Student.phone == params.phone)
    if params.status is not None:
        conditions.append(Student.status == params.status)

    # 获取总数
    count_query = select(func.count(Student.id)).where(and_(*conditions))
    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (params.page - 1) * params.size
    result = await db.scalars(
        stmt.where(and_(*conditions)).order_by(Student.create_time.desc()).offset(offset).limit(params.size)
    )

    return SearchResultSchema(
        total=total,
        data=[StudentSchema.model_validate(student) for student in result.all()],
    )


async def add_student(db: AsyncSession, params: SaveStudentSchema):
    """创建学生"""
    student = await db.scalar(select(Student).where(Student.phone == params.phone))

    if student:
        raise ValueError("该学生已经注册")

    try:

        password = encrypt.generate_password()
        student = Student(
            id=str(uuid.uuid4()),
            name=params.name,
            phone=params.phone,
            password=encrypt.hash(password),
            grade=params.grade,
            status=params.status,
        )
        db.add(student)
        await db.flush()  # 刷新以获取 student.id，但不提交事务

        # 查询所有系统练习
        practices = await db.scalars(select(Practice).where(Practice.type == "system"))
        practice_ids = [practice.id for practice in practices.all()]

        # 创建学生练习关联
        if practice_ids:
            practice_records = [
                StudentPractice(student_id=student.id, practice_id=practice_id) for practice_id in practice_ids
            ]
            db.add_all(practice_records)

        # 查询当前年级的所有教材
        textbooks = await db.scalars(select(Textbook).where(Textbook.grade == params.grade))
        textbook_ids = [textbook.id for textbook in textbooks.all()]

        # 创建学生教材关联
        if textbook_ids:
            textbook_records = [
                StudentTextbook(student_id=student.id, textbook_id=textbook_id) for textbook_id in textbook_ids
            ]
            db.add_all(textbook_records)

        await db.commit()

    except Exception as e:
        await db.rollback()
        raise e

    return password


async def update_student(db: AsyncSession, student: StudentSchema, params: SaveStudentSchema):
    """更新学生信息"""
    logger.info(f"更新学生信息参数: {params}")
    await db.execute(
        update(Student)
        .where(Student.id == student.id)
        .values(name=params.name, phone=params.phone, grade=params.grade, status=params.status, update_time=now())
    )
    await db.commit()


async def delete_student(db: AsyncSession, student: StudentSchema):
    """删除学生"""
    await db.execute(delete(Student).where(Student.id == student.id))
    await db.commit()


async def reset_student_password(db: AsyncSession, student: StudentSchema):

    password = encrypt.generate_password()
    db.execute(
        update(Student).where(Student.id == student.id).values(password=encrypt.hash(password), update_time=now())
    )
    await db.commit()

    return password
