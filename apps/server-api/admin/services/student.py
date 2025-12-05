import uuid
from sqlalchemy import and_, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import CreateStudentSchema, SearchStudentSchema, UpdateStudentSchema
from core.database import Student, StudentTextbook, Textbook
from core.schema import SearchResultSchema, StudentSchema, TextbookSchema
from shared.utils import encrypt
from shared.utils.time import now


async def create_student(db: AsyncSession, params: CreateStudentSchema):
    """创建学生"""
    student = await db.scalar(select(Student).where(Student.phone == params.phone))

    if student:
        raise ValueError("该学生已经注册")

    password = encrypt.generate_password()
    student = Student(
        id=str(uuid.uuid4()),
        name=params.name,
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

    if params.name:
        student.name = params.name
    if params.phone is not None:
        student.phone = params.phone
    if params.grade is not None:
        student.grade = params.grade
    if params.status is not None:
        student.status = params.status

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


async def add_student_textbook(db: AsyncSession, id: str, textbook_id: int):
    """添加学生的教材"""
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student:
        raise ValueError("学生不存在")

    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
    if not textbook:
        raise ValueError("教材不存在")

    record = await db.scalar(
        select(StudentTextbook).where(
            StudentTextbook.student_id == id, StudentTextbook.textbook_id == textbook_id
        )
    )

    if record:
        raise ValueError("教材已经添加过了")

    record = StudentTextbook(student_id=id, textbook_id=textbook_id)
    db.add(record)
    await db.commit()


async def remove_student_textbook(db: AsyncSession, id: str, textbook_id: int):
    """移除学生的教材"""
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student:
        raise ValueError("学生不存在")

    await db.execute(
        delete(StudentTextbook).where(
            StudentTextbook.student_id == id, StudentTextbook.textbook_id == textbook_id
        )
    )
    await db.commit()


async def get_student_textbooks(db: AsyncSession, id: str):
    """查询学生的教材"""
    result = await db.scalars(
        select(Textbook)
        .join(StudentTextbook, StudentTextbook.textbook_id == Textbook.id)
        .where(StudentTextbook.student_id == id)
    )
    return [TextbookSchema.model_validate(item) for item in result.all()]


async def get_student_unused_textbooks(db: AsyncSession, id: str):
    """查询学生的教材"""
    used_textbooks = await get_student_textbooks(db, id)
    ids = [textbook.id for textbook in used_textbooks]
    result = await db.scalars(
        select(Textbook).where(Textbook.id.not_in(ids)).order_by(Textbook.grade)
    )
    return [TextbookSchema.model_validate(item) for item in result.all()]


async def reset_student_password(db: AsyncSession, id: str):
    """重置学生密码"""
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student:
        raise ValueError("学生不存在")

    password = encrypt.generate_password()
    student.password = encrypt.hash(password)
    student.update_time = now()
    await db.commit()

    return password


async def get_student_detail(db: AsyncSession, id: str):
    """获取学生详情"""
    student = await db.scalar(select(Student).where(Student.id == id))
    if not student:
        raise ValueError("学生不存在")

    return StudentSchema.model_validate(student)
