import os
from pathlib import Path
from fastapi import UploadFile
from sqlalchemy import asc, delete, desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import SaveTextbookSchema, SearchTextbookSchema
from provider.aliyun import AliyunRag, AliyunApp
from common.database import Knowledge, Question, Textbook, Unit
from common.schema import TextbookSchema
from utils.time import now
from common.settings import envs


async def _clean_textbook(db: AsyncSession, id: int):
    # 删除单元
    stmt = delete(Unit).where(Unit.textbook_id == id)
    await db.execute(stmt)
    # 删除知识点
    stmt = delete(Knowledge).where(Knowledge.textbook_id == id)
    await db.execute(stmt)
    # 更新所有问题关联
    stmt = (
        update(Question)
        .where(Question.textbook_id == id)
        .values({"unit_id": None, "knowledge_id": None})
    )
    await db.execute(stmt)
    await db.commit()


async def create_textbook(db: AsyncSession, data: SaveTextbookSchema):
    subject = data.subject.strip()
    version = data.version.strip()
    grade = data.grade
    semester = data.semester.strip()

    exists_stmt = select(Textbook).where(
        Textbook.subject == subject,
        Textbook.version == version,
        Textbook.grade == grade,
        Textbook.semester == semester,
    )
    textbook_exists = await db.scalar(exists_stmt)
    if textbook_exists:
        raise ValueError("教材已存在")

    textbook = Textbook(
        subject=subject,
        version=version,
        grade=grade,
        semester=semester,
    )
    db.add(textbook)
    await db.commit()
    await db.refresh(textbook)

    return textbook.id


async def modify_textbook(db: AsyncSession, id: int, data: SaveTextbookSchema):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")

    textbook.subject = data.subject.strip()
    textbook.version = data.version.strip()
    textbook.grade = data.grade
    textbook.semester = data.semester.strip()
    textbook.update_time = now()
    await db.commit()


async def delete_textbook(db: AsyncSession, id: int):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")

    count = (
        await db.scalar(
            select(func.count()).select_from(Question).where(Question.textbook_id == id)
        )
        or 0
    )

    if count > 0:
        raise ValueError("教材已经被使用，不能被删除")

    await _clean_textbook(db, id)

    if textbook.index_file_id:
        rag = AliyunRag()
        rag.delete_index_document(textbook.index_file_id)

    await db.delete(textbook)
    await db.commit()


async def get_textbook(db: AsyncSession, textbook_id: int):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
    if not textbook:
        raise ValueError("教材不存在")
    return TextbookSchema.model_validate(textbook)


async def search_textbook(db: AsyncSession, params: SearchTextbookSchema):
    stmt = select(Textbook)
    if params.version:
        stmt = stmt.where(Textbook.version == params.version)
    if params.subject:
        stmt = stmt.where(Textbook.subject == params.subject)
    if params.grade:
        stmt = stmt.where(Textbook.grade == params.grade)

    # --- 总数 ---
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = await db.scalar(count_stmt)

    # --- 排序 ---
    sort_column = getattr(Textbook, params.sort, Textbook.id)
    stmt = stmt.order_by(
        desc(sort_column) if params.order == "desc" else asc(sort_column),
    )

    # --- 分页 ---
    offset = (params.page - 1) * params.size
    stmt = stmt.offset(offset).limit(params.size)

    results = await db.scalars(stmt)

    return {
        "total": total,
        "data": [TextbookSchema.model_validate(item) for item in results.unique().all()],
    }


async def update_textbook_status(db: AsyncSession, id: int, status: int):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")

    textbook.status = status
    await db.commit()


async def parse_textbook(db: AsyncSession, id: int):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")
    if not textbook.file:
        raise ValueError("教材文件不存在")
    if not textbook.index_file_id:
        raise ValueError("教材文件还未被解析")

    # 重新解析，需要清理教材相关数据
    await _clean_textbook(db, id)

    data = AliyunApp.invoke(
        query=f"解析教材{textbook.file}",
        app_id="e18385d4dd3e4801938b6f68024466b3",
        file_id=textbook.index_file_id,
    )

    units = data.get("units")
    if not units:
        raise ValueError("教材解析格式错误")

    for item in units:
        unit = Unit(textbook_id=id, name=item.get("unit_name"), content=item.get("unit_content"))
        db.add(unit)
        await db.commit()
        await db.refresh(unit)

        knowledges = item.get("topics")
        if not knowledges:
            return

        knowledges = [
            Knowledge(
                unit_id=unit.id,
                textbook_id=id,
                name=item.get("topic_name"),
                content=item.get("topic_content"),
            )
            for item in knowledges
        ]
        db.add_all(knowledges)
        await db.commit()

    textbook.is_parsed = 1
    await db.commit()
    return units


async def upload_textbook(db: AsyncSession, id: int, file: UploadFile):

    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")
    textbook.file = file.filename

    data = await file.read()

    try:
        tmp_dir = f"{envs.TMP_DIR}/textbook"
        os.makedirs(tmp_dir, exist_ok=True)
        tmp_file_path = Path(tmp_dir) / file.filename

        with open(tmp_file_path, "wb") as buffer:
            buffer.write(data)

        rag = AliyunRag()
        # 更新索引（同步）
        textbook.index_file_id = rag.exec_upload(
            file.filename, tmp_file_path, textbook.index_file_id
        )

        textbook.update_time = now()
        await db.commit()
    except ValueError as e:
        raise e
    finally:
        os.remove(tmp_file_path)
