import os
from pathlib import Path

from fastapi import UploadFile
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.database import Textbook, Unit
from shared.core.schema import TextbookSchema
from shared.core.settings import envs
from shared.provider import get_provider
from shared.utils import rag
from sqlalchemy import asc, delete, distinct, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import SaveTextbookSchema, SearchTextbookSchema, UnitExtractionResult


async def _clean_textbook(db: AsyncSession, id: int):
    """清理教材相关数据（优化版）"""

    # 删除单元
    stmt = delete(Unit).where(Unit.textbook_id == id)
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
    await db.commit()


async def delete_textbook(db: AsyncSession, id: int):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")

    await _clean_textbook(db, id)

    if textbook.index_file_id:
        rag.delete_index_document(textbook.index_file_id)

    await db.delete(textbook)
    await db.commit()


async def get_textbook(db: AsyncSession, textbook_id: int):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))
    if not textbook:
        raise ValueError("教材不存在")
    return TextbookSchema.model_validate(textbook)


async def search_textbook(db: AsyncSession, params: SearchTextbookSchema):
    """搜索教材（无分页，返回列表）"""
    stmt = select(Textbook)
    if params.version:
        stmt = stmt.where(Textbook.version == params.version)
    if params.subject:
        stmt = stmt.where(Textbook.subject == params.subject)
    if params.grade is not None:
        stmt = stmt.where(Textbook.grade == params.grade)

    # 排序：先科目、再年级、再版本、再学期
    stmt = stmt.order_by(
        asc(Textbook.subject),
        asc(Textbook.grade),
        asc(Textbook.version),
        asc(Textbook.semester),
    )

    results = await db.scalars(stmt)
    return [TextbookSchema.model_validate(item) for item in results.unique().all()]


async def upload_textbook(db: AsyncSession, id: int, file: UploadFile):
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")

    # 验证文件并获取安全文件名
    textbook.file = file.filename

    try:
        tmp_dir = f"{envs.TMP_DIR}/textbook"
        os.makedirs(tmp_dir, exist_ok=True)
        tmp_file_path = Path(tmp_dir) / file.filename

        with open(tmp_file_path, "wb") as buffer:
            buffer.write(file.file.read())

        textbook.index_file_id = rag.upload(
            file_name=file.filename,
            file_path=str(tmp_file_path),
            old_file_id=textbook.index_file_id if textbook.index_file_id else None,
        )
        await db.commit()
    except ValueError as e:
        raise e
    finally:
        if tmp_file_path.exists():
            os.remove(tmp_file_path)


async def parse_textbook(db: AsyncSession, id: int):
    """
    解析教材，使用RAG知识库解析：
    1. 从RAG知识库获取切片数据
    2. 解析教材内容，提取单元信息
    3. 生成单元数据
    """
    textbook = await db.scalar(select(Textbook).where(Textbook.id == id))
    if not textbook:
        raise ValueError("教材不存在")
    if not textbook.index_file_id:
        raise ValueError("教材文件还未上传到知识库，请先上传文件")

    # 重新解析，需要清理教材相关数据
    await _clean_textbook(db, id)

    logger.info(f"开始解析教材: {textbook.file}，file_id: {textbook.index_file_id}")

    # parsed_units = await parse_textbook_units(textbook.index_file_id)
    chunks = rag.get_all_chunks(file_id=textbook.index_file_id)
    if not chunks:
        raise ValueError(f"未找到文件索引ID为 {textbook.index_file_id} 的切片数据")

    full_content = "\n\n".join(chunks)

    parser = JsonOutputParser(pydantic_object=UnitExtractionResult)
    format_instructions = parser.get_format_instructions()

    # 构建prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业的教材分析专家，擅长从教材内容中提取单元信息。"
                "请仔细分析每个单元的内容，提取出单元名称和单元内容摘要。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            (
                "human",
                "请分析以下教材单元内容，提取单元信息：\n\n{units_content}",
            ),
        ]
    )

    prompt_input = {
        "units_content": full_content,
        "format_instructions": format_instructions,
    }

    provider = get_provider()

    result = await provider.invoke_chain(
        prompt=prompt,
        parser=parser,
        prompt_input=prompt_input,
    )
    logger.info("AI解析单元信息成功")

    # 验证结果
    if not isinstance(result, dict) or "units" not in result:
        raise ValueError("AI返回结果格式错误")

    validated_result = UnitExtractionResult.model_validate(result)

    parsed_units = validated_result.units

    logger.info(f"AI解析完成，共{len(parsed_units)}个单元")

    # 保存单元到数据库
    for item in parsed_units:
        # 创建单元
        unit = Unit(textbook_id=id, name=item.unit_name, content=item.unit_content)
        db.add(unit)
        await db.commit()
        await db.refresh(unit)

    textbook.is_parsed = 1
    await db.commit()


async def get_available_textbook_options(db: AsyncSession):
    """获取可用的教材选项（年级、学科、学期）"""
    from sqlalchemy import func

    # 获取所有唯一的学科
    subjects_result = await db.scalars(select(distinct(Textbook.subject)).order_by(Textbook.subject))
    subjects = [s for s in subjects_result.all() if s]

    # 获取所有唯一的年级
    grades_result = await db.scalars(select(distinct(Textbook.grade)).order_by(Textbook.grade))
    grades = [g for g in grades_result.all() if g is not None]

    # 获取所有唯一的学期
    semesters_result = await db.scalars(
        select(distinct(Textbook.semester)).order_by(Textbook.semester)
    )
    semesters = [s for s in semesters_result.all() if s]

    return {
        "subjects": subjects,
        "grades": grades,
        "semesters": semesters,
    }
