"""存储服务 - 负责文件上传和题目保存"""

import os
import requests
from pathlib import Path
from typing import Any, Dict, List
from loguru import logger
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio import AsyncSession

from core.settings import envs
from core.database import Question
from core.constants import get_question_types
from question.types import QuestionGenerationState, GeneratedQuestion, QuestionOption
from services.oss_service import OSSService


async def download_file(url: str, file_path: str) -> None:
    """下载文件到本地"""
    response = requests.get(url, stream=True)
    response.raise_for_status()

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)


async def upload_files(state: QuestionGenerationState) -> Dict[str, Any]:
    """文件上传节点 - 将图片和音频上传到 OSS"""
    image_questions: List[Question] = state.get("image_questions", [])
    audio_questions: List[Question] = state.get("audio_questions", [])
    textbook = state["textbook"]

    oss = OSSService()
    tmp_dir = Path(envs.TMP_DIR)
    tmp_dir.mkdir(parents=True, exist_ok=True)

    # 上传图片
    for question in image_questions:
        if hasattr(question, "_temp_image_url") and question._temp_image_url:
            # 确保题目 ID 已生成
            if not question.id:
                raise ValueError(f"题目 ID 未生成，无法上传文件。题目内容: {question.content[:50]}...")
            
            try:
                # 下载图片
                image_path = tmp_dir / f"question_{textbook.id}_{question.id}_image.jpg"
                await download_file(question._temp_image_url, str(image_path))

                # 读取文件内容
                with open(image_path, "rb") as f:
                    file_data = f.read()

                # 上传到 OSS，使用 question.id 作为文件名
                oss_path = f"questions/{textbook.id}/images/{question.id}.jpg"

                # 检查文件是否存在，如果存在则先删除
                if oss.exist(oss_path):
                    logger.info(f"OSS 文件已存在，先删除: {oss_path}")
                    oss.delete(oss_path)

                oss.upload(oss_path, file_data)

                # 保存资源路径
                question.resource = oss_path

                # 清理临时文件
                os.remove(image_path)
            except Exception as e:
                logger.error(f"上传图片失败: question_id={question.id}, error={e}")
                question.resource = None

    # 上传音频
    for question in audio_questions:
        if hasattr(question, "_temp_audio_url") and question._temp_audio_url:
            # 确保题目 ID 已生成
            if not question.id:
                raise ValueError(f"题目 ID 未生成，无法上传文件。题目内容: {question.content[:50]}...")
            
            try:
                # 下载音频
                audio_path = tmp_dir / f"question_{textbook.id}_{question.id}_audio.mp3"
                await download_file(question._temp_audio_url, str(audio_path))

                # 读取文件内容
                with open(audio_path, "rb") as f:
                    file_data = f.read()

                # 上传到 OSS，使用 question.id 作为文件名
                oss_path = f"questions/{textbook.id}/audio/{question.id}.mp3"

                # 检查文件是否存在，如果存在则先删除
                if oss.exist(oss_path):
                    logger.info(f"OSS 文件已存在，先删除: {oss_path}")
                    oss.delete(oss_path)

                oss.upload(oss_path, file_data)

                # 保存资源路径
                question.resource = oss_path

                # 清理临时文件
                os.remove(audio_path)
            except Exception as e:
                logger.error(f"上传音频失败: question_id={question.id}, error={e}")
                question.resource = None

    return {
        "image_questions": image_questions,
        "audio_questions": audio_questions,
    }


async def update_resource_info(state: QuestionGenerationState) -> Dict[str, Any]:
    """更新资源信息节点 - 将上传后的资源路径更新到数据库"""
    image_questions: List[Question] = state.get("image_questions", [])
    audio_questions: List[Question] = state.get("audio_questions", [])
    db: AsyncSession = state["db"]

    updated_count = 0
    all_resource_questions = image_questions + audio_questions

    # 统计需要更新的题目数量
    for question in all_resource_questions:
        if question.resource:
            updated_count += 1

    # 提交所有更改（SQLAlchemy 会自动跟踪已附加对象的字段更改）
    if updated_count > 0:
        try:
            # 先刷新以确保更改被写入数据库
            await db.flush()
            # 提交更改
            await db.commit()
            # 刷新所有对象以获取最新状态
            for question in all_resource_questions:
                if question.id:
                    await db.refresh(question)
            logger.info(f"成功更新 {updated_count} 道题目的资源路径到数据库")
        except Exception as e:
            logger.error(f"提交资源路径更新失败: {e}")
            await db.rollback()
            raise
    else:
        logger.info("没有需要更新资源路径的题目")

    return {
        "image_questions": image_questions,
        "audio_questions": audio_questions,
    }


async def convert_questions(state: QuestionGenerationState) -> Dict[str, Any]:
    """将内容转换成 Question 数组，并根据问题类型分流"""
    generated_questions: List[GeneratedQuestion] = state["generated_questions"]

    # 处理单元：教材生成可能有多个单元，单元生成只有一个单元
    unit = state.get("unit")

    # 获取 textbook：优先从 state 中获取，如果没有则从 unit 或 textbook_id 加载
    textbook = state.get("textbook")

    questions: List[Question] = []
    image_questions: List[Question] = []
    audio_questions: List[Question] = []
    text_questions: List[Question] = []

    # 根据科目和年级获取对应的题型
    question_types = get_question_types(textbook.subject, textbook.grade)

    # 验证题型列表不为空（虽然 generate_prompt 已经验证过，但这里再次验证以确保安全）
    if not question_types:
        raise ValueError(
            f"科目 {textbook.subject} 的 {textbook.grade} 年级暂不支持题目生成。"
            f"目前仅支持一年级的英语和数学。"
        )

    for item in generated_questions:
        question_type = item.question_type
        if question_type not in question_types:
            logger.warning(
                f"生成的题型 {question_type} 不在预期列表中（科目: {textbook.subject}, 年级: {textbook.grade}）"
            )
            question_type = "未知题型"

        # 获取子类型，如果为空字符串则设为 None
        question_subtype = getattr(item, "question_subtype", None)
        if question_subtype and question_subtype.strip():
            question_subtype = question_subtype.strip()
        else:
            question_subtype = None

        # 获取 resource_content，如果为空字符串则设为 None
        resource_content = getattr(item, "resource_content", None)
        if resource_content and resource_content.strip():
            resource_content = resource_content.strip()
        else:
            resource_content = None

        question = Question(
            subject=textbook.subject,
            grade=textbook.grade,
            type=question_type,
            subtype=question_subtype,
            content=item.question,
            resource_content=resource_content,
            options=TypeAdapter(List[QuestionOption])
            .dump_json(item.options, by_alias=True, exclude_none=True)
            .decode(),
            answer=item.answer,
            difficulty=item.difficulty,
            textbook_id=textbook.id,
            unit_id=unit.id if unit else None,  # 教材生成时 textbook.id 可以为 None
            knowledge=item.knowledge if item.knowledge else "",
        )

        questions.append(question)

        # 根据 QUESTION_TYPES 判断资源类型
        # 口语题的 resource_type 为空，只有听力相关和识别相关的题目 resource_type 才有值
        resource_type = None

        # 口语题类型的 resource_type 始终为空
        if question_type != "口语题":
            # 判断是否需要图片（识别相关）
            # 1. 识图题类型的所有子类型都需要图片
            if question_type == "识图题":
                resource_type = "image"
            # 2. 选择题中的"数位看图"需要图片
            elif question_type == "选择题" and question_subtype == "数位看图":
                resource_type = "image"
            # 3. 选择题中的"看图选词"、"看图选句"需要图片
            elif question_type == "选择题" and question_subtype in ["看图选词", "看图选句"]:
                resource_type = "image"
            # 4. 拼写题中的"看图写单词"需要图片
            elif question_type == "拼写题" and question_subtype == "看图写单词":
                resource_type = "image"
            # 判断是否需要音频（听力相关）
            # 1. 选择题中的"听音选词"、"听音选句"需要音频
            elif question_type == "选择题" and question_subtype in ["听音选词", "听音选句"]:
                resource_type = "audio"
            # 2. 拼写题中的"听音写单词"需要音频
            elif question_type == "拼写题" and question_subtype == "听音写单词":
                resource_type = "audio"

        # 设置资源类型字段并分类
        question.resource_type = resource_type
        if resource_type == "image":
            image_questions.append(question)
        elif resource_type == "audio":
            audio_questions.append(question)
        else:
            text_questions.append(question)

    if len(questions) == 0:
        raise ValueError("题目生成失败")

    return {
        "questions": questions,
        "image_questions": image_questions,
        "audio_questions": audio_questions,
        "text_questions": text_questions,
    }


async def save_questions(state: QuestionGenerationState) -> Dict[str, Any]:
    """保存题目到数据库"""
    questions: List[Question] = state.get("questions", [])
    image_questions: List[Question] = state.get("image_questions", [])
    audio_questions: List[Question] = state.get("audio_questions", [])
    text_questions: List[Question] = state.get("text_questions", [])
    db: AsyncSession = state["db"]

    all_questions = image_questions + audio_questions + text_questions

    if all_questions:
        db.add_all(all_questions)
        await db.commit()
        for question in all_questions:
            await db.refresh(question)
        logger.info("成功保存 %s 道题目到数据库", len(all_questions))
    else:
        logger.warning("没有需要保存的题目")

    return {
        "questions": questions,
        "image_questions": image_questions,
        "audio_questions": audio_questions,
        "text_questions": text_questions,
    }

