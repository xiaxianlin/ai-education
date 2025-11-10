import os
import json
import requests
from pathlib import Path
from sqlalchemy import select, and_, or_, func, delete
from sqlalchemy.orm import joinedload, noload
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger
from admin.schema import SearchQuestionSchema, UpdateQuestionSchema
from common.database import Question, Unit
from common.schema import QuestionSchema, SearchResultSchema
from common.settings import envs
from ai.services.aliyun import AliyunAIService
from provider.aliyun import AliyunOSS
from utils.time import now
from utils.question import build_full_question_text


async def update_question(db: AsyncSession, id: str, update: UpdateQuestionSchema):
    """更新问题"""
    question = await db.scalar(select(Question).where(Question.id == id))
    if not question:
        raise ValueError("问题不存在")

    if update.subject is not None:
        question.subject = update.subject
    if update.grade is not None:
        question.grade = update.grade
    if update.type is not None:
        question.type = update.type
    if update.subtype is not None:
        question.subtype = update.subtype
    if update.content is not None:
        question.content = update.content
    if update.options is not None:
        question.options = update.options
    if update.answer is not None:
        question.answer = update.answer
    if update.difficulty is not None:
        question.difficulty = update.difficulty
    if update.resource_type is not None:
        question.resource_type = update.resource_type
    if update.resource_content is not None:
        question.resource_content = update.resource_content
    if update.knowledge is not None:
        question.knowledge = update.knowledge
    if update.unit_id is not None:
        question.unit_id = update.unit_id
    if update.textbook_id is not None:
        question.textbook_id = update.textbook_id
    if update.status is not None:
        question.status = update.status

    question.update_time = now()
    await db.commit()


async def delete_question(db: AsyncSession, id: str):
    """删除问题"""
    question = await db.scalar(select(Question).where(Question.id == id))
    if not question:
        raise ValueError("问题不存在")

    await db.delete(question)
    await db.commit()


async def get_question(db: AsyncSession, id: str):
    """根据ID获取问题"""
    result = await db.execute(
        select(Question)
        .options(
            joinedload(Question.unit).noload(Unit.textbook),
            joinedload(Question.textbook),
        )
        .where(Question.id == id)
    )
    question = result.scalar_one_or_none()
    if not question:
        raise ValueError("问题不存在")
    return QuestionSchema.model_validate(question)


async def query_question_by_knowledge(db: AsyncSession, knowledge: str, page: int, size: int):
    """根据知识点获取问题列表"""
    query = (
        select(Question)
        .options(
            noload(Question.textbook),
            noload(Question.unit),
        )
        .where(
            Question.knowledge == knowledge,
            Question.status == 1,
        )
    )

    # 获取总数
    count_query = select(func.count(Question.id)).where(
        Question.knowledge == knowledge,
        Question.status == 1,
    )

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (page - 1) * size
    query = query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def query_question_by_unit(db: AsyncSession, unit_id: int, page: int, size: int):
    """根据课程单元ID获取问题列表"""
    query = (
        select(Question)
        .options(
            noload(Question.textbook),
            noload(Question.unit),
        )
        .where(Question.unit_id == unit_id)
    )

    # 获取总数
    count_query = select(func.count(Question.id)).where(
        Question.unit_id == unit_id,
        Question.status == 1,
    )

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (page - 1) * size
    query = query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def query_question_by_textbook(
    db: AsyncSession, textbook_id: int, page: int = 1, size: int = 10
):
    """根据教材获取问题列表"""
    query = (
        select(Question)
        .options(
            noload(Question.textbook),
            noload(Question.unit),
        )
        .where(Question.textbook_id == textbook_id)
    )

    # 获取总数
    count_query = select(func.count(Question.id)).where(
        Question.textbook_id == textbook_id,
    )

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (page - 1) * size
    query = query.order_by(Question.create_time.desc()).offset(offset).limit(size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def search_question(db: AsyncSession, params: SearchQuestionSchema):
    """搜索问题"""
    query = select(Question).options(
        joinedload(Question.textbook),
        joinedload(Question.unit).noload(Unit.textbook),
    )

    conditions = []
    if params.keywords:
        conditions.append(Question.content.contains(params.keywords))
    if params.type:
        conditions.append(Question.type == params.type)
    if params.grade is not None:
        conditions.append(Question.grade == params.grade)
    if params.subject:
        conditions.append(Question.subject == params.subject)
    if params.resource_type is not None:
        if params.resource_type == '':
            # 筛选无资源类型的题目（resource_type 为 None 或空字符串）
            conditions.append(
                or_(
                    Question.resource_type.is_(None),
                    Question.resource_type == ''
                )
            )
        else:
            conditions.append(Question.resource_type == params.resource_type)
    if params.resource_generated is not None:
        if params.resource_generated:
            # 资源已生成：resource 不为空且不为空字符串
            conditions.append(
                and_(
                    Question.resource.isnot(None),
                    Question.resource != ''
                )
            )
        else:
            # 资源未生成：resource 为空或空字符串
            conditions.append(
                or_(
                    Question.resource.is_(None),
                    Question.resource == ''
                )
            )

    if len(conditions) > 0:
        query = query.where(and_(*conditions))

    # 获取总数
    count_query = select(func.count(Question.id))
    if conditions:
        count_query = count_query.where(and_(*conditions))

    total = await db.scalar(count_query) or 0

    # 分页查询
    offset = (params.page - 1) * params.size
    query = query.order_by(
        getattr(Question, params.sort, Question.create_time).desc()
        if params.order == "desc"
        else getattr(Question, params.sort, Question.create_time).asc()
    )
    query = query.offset(offset).limit(params.size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def search_resource_questions(db: AsyncSession, params: SearchQuestionSchema):
    """搜索需要处理资源的问题"""
    query = select(Question).options(
        joinedload(Question.textbook),
        joinedload(Question.unit).noload(Unit.textbook),
    )

    base_conditions = [
        Question.resource_type.isnot(None),
        Question.resource_type != "",
    ]
    conditions = base_conditions.copy()

    if params.keywords:
        conditions.append(Question.content.contains(params.keywords))
    if params.type:
        conditions.append(Question.type == params.type)
    if params.grade is not None:
        conditions.append(Question.grade == params.grade)
    if params.subject:
        conditions.append(Question.subject == params.subject)
    if params.resource_type:
        conditions.append(Question.resource_type == params.resource_type)
    if params.resource_generated is not None:
        if params.resource_generated:
            conditions.append(
                and_(
                    Question.resource.isnot(None),
                    Question.resource != "",
                )
            )
        else:
            conditions.append(
                or_(
                    Question.resource.is_(None),
                    Question.resource == "",
                )
            )

    query = query.where(and_(*conditions))

    count_query = select(func.count(Question.id)).where(and_(*conditions))
    total = await db.scalar(count_query) or 0

    offset = (params.page - 1) * params.size
    order_field = getattr(Question, params.sort, Question.update_time)
    query = query.order_by(order_field.desc() if params.order == "desc" else order_field.asc())
    query = query.offset(offset).limit(params.size)

    result = await db.scalars(query)

    return SearchResultSchema(
        total=total,
        data=[QuestionSchema.model_validate(question) for question in result.all()],
    )


async def _download_file(url: str, file_path: str) -> None:
    """下载文件到本地"""
    response = requests.get(url, stream=True)
    response.raise_for_status()

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)




async def generate_question_image(db: AsyncSession, question_id: str) -> QuestionSchema:
    """为单个问题生成图片并上传到 OSS"""
    question = await db.scalar(select(Question).where(Question.id == question_id))
    if not question:
        raise ValueError("问题不存在")

    if not question.content:
        raise ValueError("问题内容为空，无法生成图片")
    
    # 检查是否需要生成图片
    if question.resource_type != "image":
        raise ValueError(f"该题目不需要生成图片（resource_type={question.resource_type}）。只有 resource_type 为 'image' 的题目才能生成图片。")

    try:
        # 构建完整的问题内容（包含题目、选项、答案）
        full_question_text = build_full_question_text(question)

        # 生成图片
        logger.info(f"开始为问题 {question_id} 生成图片")
        # 使用允许的尺寸：1328*1328（最接近正方形的尺寸）
        image_url = AliyunAIService.generate_image(
            text=full_question_text, width=1328, height=1328, optimize_prompt=True
        )

        # 下载图片到临时目录
        oss = AliyunOSS()
        tmp_dir = Path(envs.TMP_DIR)
        tmp_dir.mkdir(parents=True, exist_ok=True)
        image_path = tmp_dir / f"question_{question_id}_image.jpg"

        await _download_file(image_url, str(image_path))

        # 读取文件内容
        with open(image_path, "rb") as f:
            file_data = f.read()

        # 上传到 OSS
        unit_id = question.unit_id or 0
        oss_path = f"questions/{unit_id}/images/{question_id}.jpg"

        # 检查文件是否存在，如果存在则先删除
        if oss.exist(oss_path):
            logger.info(f"OSS 文件已存在，先删除: {oss_path}")
            oss.delete(oss_path)

        oss.upload(oss_path, file_data)

        # 更新问题的 resource 字段
        question.resource = oss_path
        question.update_time = now()
        await db.commit()

        # 清理临时文件
        os.remove(image_path)

        logger.info(f"成功为问题 {question_id} 生成并上传图片: {oss_path}")

    except Exception as e:
        logger.error(f"为问题 {question_id} 生成图片失败: {e}")
        await db.rollback()
        raise


async def generate_question_audio(db: AsyncSession, question_id: str) -> QuestionSchema:
    """为单个问题生成语音并上传到 OSS"""
    question = await db.scalar(select(Question).where(Question.id == question_id))
    if not question:
        raise ValueError("问题不存在")

    if not question.content:
        raise ValueError("问题内容为空，无法生成语音")
    
    # 检查是否需要生成语音
    if question.resource_type != "audio":
        raise ValueError(f"该题目不需要生成语音（resource_type={question.resource_type}）。只有 resource_type 为 'audio' 的题目才能生成语音。")

    try:
        # 生成语音，优先使用 resource_content，如果没有则使用完整的问题内容
        if question.resource_content:
            text_to_speak = question.resource_content
            logger.info(f"使用 resource_content 生成语音: {text_to_speak[:50]}...")
        else:
            # 构建完整的问题内容（包含题目、选项、答案）
            text_to_speak = build_full_question_text(question)
            logger.info("使用完整问题内容生成语音")

        # 生成语音
        logger.info(f"开始为问题 {question_id} 生成语音")
        audio_url = AliyunAIService.tts(text=text_to_speak, voice="Cherry", language="Chinese")

        # 下载音频到临时目录
        oss = AliyunOSS()
        tmp_dir = Path(envs.TMP_DIR)
        tmp_dir.mkdir(parents=True, exist_ok=True)
        audio_path = tmp_dir / f"question_{question_id}_audio.mp3"

        await _download_file(audio_url, str(audio_path))

        # 读取文件内容
        with open(audio_path, "rb") as f:
            file_data = f.read()

        # 上传到 OSS
        unit_id = question.unit_id or 0
        oss_path = f"questions/{unit_id}/audio/{question_id}.mp3"

        # 检查文件是否存在，如果存在则先删除
        if oss.exist(oss_path):
            logger.info(f"OSS 文件已存在，先删除: {oss_path}")
            oss.delete(oss_path)

        oss.upload(oss_path, file_data)

        # 更新问题的 resource 字段
        question.resource = oss_path
        question.update_time = now()
        await db.commit()

        # 清理临时文件
        os.remove(audio_path)

        logger.info(f"成功为问题 {question_id} 生成并上传语音: {oss_path}")

    except Exception as e:
        logger.error(f"为问题 {question_id} 生成语音失败: {e}")
        await db.rollback()
        raise
