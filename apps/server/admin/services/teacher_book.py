import os
from pathlib import Path
from fastapi import UploadFile
from sqlalchemy import asc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import SaveTeacherBookSchema, SearchTeacherBookSchema
from shared.provider.aliyun import AliyunRag
from shared.core.database import TeacherBook
from shared.core.schema import TeacherBookSchema
from shared.core.settings import envs


async def create_teacher_book(db: AsyncSession, data: SaveTeacherBookSchema):
    subject = data.subject.strip()
    version = data.version.strip()
    grade = data.grade
    semester = data.semester.strip()

    exists_stmt = select(TeacherBook).where(
        TeacherBook.subject == subject,
        TeacherBook.version == version,
        TeacherBook.grade == grade,
        TeacherBook.semester == semester,
    )
    teacher_book_exists = await db.scalar(exists_stmt)
    if teacher_book_exists:
        raise ValueError("教师用书已存在")

    teacher_book = TeacherBook(
        subject=subject,
        version=version,
        grade=grade,
        semester=semester,
    )
    db.add(teacher_book)
    await db.commit()
    await db.refresh(teacher_book)

    return teacher_book.id


async def modify_teacher_book(db: AsyncSession, id: int, data: SaveTeacherBookSchema):
    teacher_book = await db.scalar(select(TeacherBook).where(TeacherBook.id == id))
    if not teacher_book:
        raise ValueError("教师用书不存在")

    teacher_book.subject = data.subject.strip()
    teacher_book.version = data.version.strip()
    teacher_book.grade = data.grade
    teacher_book.semester = data.semester.strip()
    await db.commit()


async def delete_teacher_book(db: AsyncSession, id: int):
    teacher_book = await db.scalar(select(TeacherBook).where(TeacherBook.id == id))
    if not teacher_book:
        raise ValueError("教师用书不存在")

    if teacher_book.index_file_id:
        rag = AliyunRag()
        rag.delete_index_document(teacher_book.index_file_id)

    await db.delete(teacher_book)
    await db.commit()


async def get_teacher_book(db: AsyncSession, teacher_book_id: int):
    teacher_book = await db.scalar(select(TeacherBook).where(TeacherBook.id == teacher_book_id))
    if not teacher_book:
        raise ValueError("教师用书不存在")
    return TeacherBookSchema.model_validate(teacher_book)


async def search_teacher_book(db: AsyncSession, params: SearchTeacherBookSchema):
    stmt = select(TeacherBook)
    if params.version:
        stmt = stmt.where(TeacherBook.version == params.version)
    if params.subject:
        stmt = stmt.where(TeacherBook.subject == params.subject)
    if params.grade:
        stmt = stmt.where(TeacherBook.grade == params.grade)

    # --- 总数 ---
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = await db.scalar(count_stmt)

    # --- 排序（先按科目、后按年级，确保年级顺序） ---
    stmt = stmt.order_by(asc(TeacherBook.subject), asc(TeacherBook.grade))

    # --- 分页 ---
    offset = (params.page - 1) * params.size
    stmt = stmt.offset(offset).limit(params.size)

    results = await db.scalars(stmt)

    return {
        "total": total,
        "data": [TeacherBookSchema.model_validate(item) for item in results.unique().all()],
    }


async def upload_teacher_book(db: AsyncSession, id: int, file: UploadFile):

    teacher_book = await db.scalar(select(TeacherBook).where(TeacherBook.id == id))
    if not teacher_book:
        raise ValueError("教师用书不存在")
    teacher_book.file = file.filename

    data = await file.read()

    try:
        tmp_dir = f"{envs.TMP_DIR}/teacher_book"
        os.makedirs(tmp_dir, exist_ok=True)
        tmp_file_path = Path(tmp_dir) / file.filename

        with open(tmp_file_path, "wb") as buffer:
            buffer.write(data)

        rag = AliyunRag()
        # 更新索引（同步）
        teacher_book.index_file_id = rag.exec_upload(
            file.filename, tmp_file_path, teacher_book.index_file_id
        )

        await db.commit()
    except ValueError as e:
        raise e
    finally:
        os.remove(tmp_file_path)
