import os
from pathlib import Path
from fastapi import UploadFile
from loguru import logger
from sqlalchemy import asc, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from admin.schema import SaveTextbookSchema, SearchTextbookSchema
from shared.provider.aliyun import AliyunRag
from shared.services.textbook_parser import TextbookParser
from core.database import Knowledge, Question, Textbook, Unit
from core.schema import TextbookSchema
from shared.utils.time import now
from core.settings import envs


async def _clean_textbook(db: AsyncSession, id: int):
    """清理教材相关数据（优化版，包含QuestionKnowledge关联）"""
    from core.database import QuestionKnowledge

    # 1. 删除问题-知识点关联
    stmt = delete(QuestionKnowledge).where(
        QuestionKnowledge.knowledge_id.in_(select(Knowledge.id).where(Knowledge.textbook_id == id))
    )
    await db.execute(stmt)

    # 2. 删除知识点
    stmt = delete(Knowledge).where(Knowledge.textbook_id == id)
    await db.execute(stmt)

    # 3. 删除单元
    stmt = delete(Unit).where(Unit.textbook_id == id)
    await db.execute(stmt)

    # 4. 更新所有问题关联（清理旧的字符串字段）
    stmt = (
        update(Question)
        .where(Question.textbook_id == id)
        .values({"unit_id": None, "knowledge": None})
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

    # --- 排序（先按科目、后按年级，确保年级顺序） ---
    stmt = stmt.order_by(asc(Textbook.subject), asc(Textbook.grade))

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
    """
    解析教材，使用RAG知识库解析：
    1. 从RAG知识库获取切片数据
    2. 解析教材内容，提取单元信息
    3. 交给 AI 去生成单元和知识点数据
    """
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")
    if not textbook.index_file_id:
        raise ValueError("教材文件还未上传到知识库，请先上传文件")

    # 重新解析，需要清理教材相关数据
    await _clean_textbook(db, id)

    logger.info(f"开始解析教材: {textbook.file}，file_id: {textbook.index_file_id}")

    # 使用RAG知识库解析
    parsed_units = await TextbookParser.parse_by_rag(textbook.index_file_id)
    logger.info(f"AI解析完成，共{len(parsed_units)}个单元")

    # 保存单元和知识点到数据库
    for item in parsed_units:
        # 创建单元
        unit = Unit(textbook_id=id, name=item.unit_name, content=item.unit_content)
        db.add(unit)
        await db.commit()
        await db.refresh(unit)

        # 创建知识点（带排序和默认属性）
        topics = item.topics
        if not topics:
            continue

        knowledge_objects = []
        for knowledge_index, topic in enumerate(topics):
            knowledge = Knowledge(
                unit_id=unit.id,
                textbook_id=id,
                name=topic.get("topic_name", ""),
                content=topic.get("topic_content", ""),
                order=knowledge_index,  # 按解析顺序设置排序
                difficulty=None,  # 可后续手动设置或通过AI分析
                importance=5,  # 默认重要性
            )
            knowledge_objects.append(knowledge)

        db.add_all(knowledge_objects)
        await db.commit()

    textbook.is_parsed = 1
    await db.commit()

    return [unit.model_dump() for unit in parsed_units]


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
