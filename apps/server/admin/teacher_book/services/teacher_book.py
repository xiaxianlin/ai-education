from __future__ import annotations

import os
from pathlib import Path
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import SaveTeacherBookSchema
from shared.core.database import TeacherBook
from shared.core.schema import TeacherBookSchema
from shared.core.settings import envs
from shared.utils.file_validation import validate_file_upload


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

        # NOTE: RAG index deletion implementation planned for future release
    # if teacher_book.index_file_id:
    #     rag = AliyunRag()
    #     rag.delete_index_document(teacher_book.index_file_id)

    await db.delete(teacher_book)
    await db.commit()


async def get_teacher_book(db: AsyncSession, teacher_book_id: int):
    teacher_book = await db.scalar(select(TeacherBook).where(TeacherBook.id == teacher_book_id))
    if not teacher_book:
        raise ValueError("教师用书不存在")
    return TeacherBookSchema.model_validate(teacher_book)


async def search_teacher_book(db: AsyncSession, subject: str, grade: int):
    results = await db.scalars(select(TeacherBook).where(TeacherBook.subject == subject, TeacherBook.grade == grade))

    return [TeacherBookSchema.model_validate(item) for item in results.unique().all()]


async def upload_teacher_book(db: AsyncSession, id: int, file: UploadFile):

    teacher_book = await db.scalar(select(TeacherBook).where(TeacherBook.id == id))
    if not teacher_book:
        raise ValueError("教师用书不存在")

    # 验证文件并获取安全文件名
    data, safe_filename = validate_file_upload(file)
    teacher_book.file = safe_filename

    try:
        tmp_dir = f"{envs.TMP_DIR}/teacher_book"
        os.makedirs(tmp_dir, exist_ok=True)
        tmp_file_path = Path(tmp_dir) / safe_filename

        with open(tmp_file_path, "wb") as buffer:
            buffer.write(data)

        # NOTE: RAG index upload implementation planned for future release
        # rag = AliyunRag()
        # # 更新索引（同步）
        # teacher_book.index_file_id = rag.exec_upload(
        #     safe_filename, tmp_file_path, teacher_book.index_file_id
        # )

        await db.commit()
    except ValueError as e:
        raise e
    finally:
        if tmp_file_path.exists():
            os.remove(tmp_file_path)
