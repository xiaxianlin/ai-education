import asyncio
import os
from pathlib import Path
from fastapi import UploadFile
from sqlalchemy import asc, delete, desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import SaveTextbookSchema, SearchTextbookSchema
from provider.aliyun import AliyunOSS, AliyunRag, call_app
from common.database import Knowledge, Question, Textbook, Unit
from common.schema import TextbookSchema
from utils.time import now
from common.settings import envs


async def create_textbook(db: AsyncSession, data: SaveTextbookSchema):
    textbook = Textbook(
        subject=data.subject.strip(),
        version=data.version.strip(),
        grade=data.grade.strip(),
        semester=data.semester.strip(),
    )
    db.add(textbook)
    await db.commit()
    await db.refresh(textbook)

    return textbook.id


async def modify_textbook(db: AsyncSession, id: int, data: SaveTextbookSchema):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")

    textbook.subject = data.subject
    textbook.version = data.version
    textbook.grade = data.grade
    textbook.semester = data.semester
    textbook.update_time = now()
    await db.commit()


async def delete_textbook(db: AsyncSession, id: int):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        return True

    count = (
        await db.scalar(select(func.count()).select_from(Unit).where(Unit.textbook_id == id)) or 0
    )

    if count > 0:
        raise ValueError("教材已经被使用，不能被删除")

    if textbook.file:
        oss = AliyunOSS()
        await oss.delete(f"textbook/{textbook.file}")

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
        "data": [manager.to_dict({"password"}) for manager in results.unique().all()],
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

    data = call_app(
        query=f"解析教材{textbook.file}",
        app_id="e18385d4dd3e4801938b6f68024466b3",
        file_id=textbook.index_file_id,
    )

    units = data.get("units")
    if not units:
        raise ValueError("教材解析格式错误")

    for unit in units:
        unit = Unit(textbook_id=id, name=unit.get("unit_name"), content=unit.get("unit_content"))
        db.add(unit)
        await db.commit()
        await db.refresh(unit)

        knowledges = unit.get("topics")
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

    # 上传到 oss
    oss = AliyunOSS()
    data = await file.read()

    # 提前创建任务（协程对象）
    task = asyncio.create_task(oss.multipart_upload(f"textbook/{file.filename}", data))

    try:
        tmp_dir = f"{envs.RUNTIME_DIR}/tmp"
        os.makedirs(tmp_dir, exist_ok=True)
        tmp_file_path = Path(tmp_dir) / file.filename

        with open(tmp_file_path, "wb") as buffer:
            buffer.write(data)

        rag = AliyunRag()
        # 更新索引（同步）
        textbook.index_file_id = rag.update_file(
            file.filename,
            tmp_file_path,
            textbook.index_file_id,
        )

        # 等待 OSS 上传完成
        await task

        textbook.update_time = now()
        await db.commit()
    except ValueError as e:
        os.remove(tmp_file_path)
        raise e
