import uuid
from sqlalchemy import and_, delete, func, select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateStudentSchema, SearchStudentSchema, UpdateStudentSchema
from common.database import Student, StudentTextbook
from common.schema import SearchResultSchema, StudentSchema, StudentTextbookSchema
from utils import encrypt
from utils.time import now


async def create_student(db: AsyncSession, params: CreateStudentSchema):
    """创建学生"""
    student = await db.scalar(select(Student).where(Student.phone == params.phone))

    if student:
        raise ValueError("该学生已经注册")
    password = encrypt.generate_password()
    student = Student(
        id=str(uuid.uuid4()),
        name=params.username,
        phone=params.phone,
        password=encrypt.hash(password),
        status=1,
    )
    db.add(student)
    await db.commit()

    return password


async def update_student(db: AsyncSession, id: str, params: UpdateStudentSchema):
    """更新学生信息"""
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student:
        raise ValueError("学生不存在")

    if params.status is not None:
        student.status = params.status
    if params.type is not None:
        student.type = params.type
    if params.phone is not None:
        student.phone = params.phone

    student.update_time = now()
    await db.commit()


async def delete_student(db: AsyncSession, id: str):
    """删除学生"""
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student:
        raise ValueError("学生不存在")

    await db.delete(student)
    await db.commit()


async def search_student(db: AsyncSession, params: SearchStudentSchema):
    """搜索学生"""
    query = select(Student)

    conditions = []
    if params.keywords:
        conditions.append(Student.name.contains(params.keywords))
    if params.phone:
        conditions.append(Student.phone == params.phone)
    if params.status is not None:
        conditions.append(Student.status == params.status)

    if len(conditions) > 0:
        query = query.where(and_(*conditions))

    # 获取总数
    count_query = select(func.count(Student.id))
    if conditions:
        count_query = count_query.where(and_(*conditions))

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (params.page - 1) * params.size
    query = query.order_by(
        getattr(Student, params.sort, Student.create_time).desc()
        if params.order == "desc"
        else getattr(Student, params.sort, Student.create_time).asc()
    )
    query = query.offset(offset).limit(params.size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[StudentSchema.model_validate(student) for student in result.all()],
    )


async def save_student_textbook(db: AsyncSession, id: str, textbook_ids: list[str]):
    """保存学生的教材"""
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student:
        raise ValueError("学生不存在")

    db.execute(delete(StudentTextbook).where(StudentTextbook.student_id == id))
    await db.commit()

    models = [
        StudentTextbook(student_id=id, textbook_id=textbook_id) for textbook_id in textbook_ids
    ]

    db.add_all(models)
    await db.commit()


async def query_student_textbook(db: AsyncSession, id: str):
    """查询学生的教材"""
    result = await db.scalars(
        select(StudentTextbook)
        .options(joinedload(StudentTextbook.textbook))
        .where(Student.id == id)
    )
    return [StudentTextbookSchema.model_validate(item) for item in result.all()]
