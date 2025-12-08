import os
import requests
from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger


from utils import oss
from services.image import generate_image
from services.audio import generate_audio, audio_answer_analysis
from services.analysis import text_answer_analysis
from question.graph import invoke_generate_workflow
from core.settings import envs
from core.database import Database, Textbook, Unit, Question
from core.schema import (
    QuestionSchema,
    QuestionGenerateRequest,
    TextAnswerAnalysisRequest,
    TextAnswerAnalysisResponse,
    AudioAnswerAnalysisRequest,
    AudioAnswerAnalysisResponse,
)

router = APIRouter()


@router.post("/generate")
async def generate_questions(
    request: QuestionGenerateRequest, db: AsyncSession = Database
) -> List[QuestionSchema]:
    """生成题目（供 server-task 调用）"""
    try:
        # 获取教材
        textbook = await db.scalar(select(Textbook).where(Textbook.id == request.textbook_id))
        if not textbook:
            raise ValueError(f"教材不存在: {request.textbook_id}")

        # 获取单元（如果需要，用于 unit_practice）
        unit = None
        if request.unit_id:
            unit = await db.scalar(select(Unit).where(Unit.id == request.unit_id))
            if not unit:
                raise ValueError(f"单元不存在: {request.unit_id}")

        # 调用题目生成工作流
        return await invoke_generate_workflow(
            db=db,
            type=request.type,
            count=request.count,
            textbook=textbook,
            unit=unit,
            student_id=request.student_id,
        )

    except Exception as e:
        logger.error(f"题目生成失败: {e}", exc_info=True)
        raise ValueError(f"题目生成失败: {e}")


@router.post("/{id}/image_generate")
async def generate_question_image(id: int, db: AsyncSession = Database) -> str:
    """为指定题目生成图片"""
    try:
        # 获取题目
        question = await db.scalar(select(Question).where(Question.id == id))
        if not question:
            raise ValueError(f"题目不存在: {id}")

        # 生成图片
        image_url = generate_image(question)

        # 下载图片
        tmp_dir = Path(envs.TMP_DIR)
        tmp_dir.mkdir(parents=True, exist_ok=True)
        image_path = tmp_dir / f"question_{id}_image.jpg"

        response = requests.get(image_url, stream=True)
        response.raise_for_status()
        oss_path = f"questions/{question.textbook_id}/images/{id}.jpg"
        oss.upload(oss_path, response.content)

        # 更新题目资源字段
        question.resource = oss_path
        question.resource_type = "image"
        await db.commit()

        # 清理临时文件
        os.remove(image_path)

        logger.info(f"题目 {id} 图片生成并更新成功")
        return oss_path
    except Exception as e:
        logger.error(f"题目图片生成失败: id={id}, error={e}", exc_info=True)
        raise ValueError(f"题目图片生成失败: id={id}, error={e}")


@router.post("/{id}/audio_generate")
async def generate_question_audio(id: int, db: AsyncSession = Database) -> str:
    """为指定题目生成语音"""
    try:
        # 获取题目
        question = await db.scalar(select(Question).where(Question.id == id))
        if not question:
            raise ValueError(f"题目不存在: {id}")

        if not question.resource_content:
            raise ValueError(f"题目语音语料不存在: {id}")

        audio_url = generate_audio(question.resource_content)

        # 下载音频
        tmp_dir = Path(envs.TMP_DIR)
        tmp_dir.mkdir(parents=True, exist_ok=True)
        audio_path = tmp_dir / f"question_{id}_audio.mp3"

        response = requests.get(audio_url, stream=True)
        response.raise_for_status()
        oss_path = f"questions/{question.textbook_id}/audio/{id}.mp3"
        oss.upload(oss_path, response.content)

        # 更新题目资源字段
        question.resource = oss_path
        question.resource_type = "audio"
        await db.commit()
        # 清理临时文件
        os.remove(audio_path)
        logger.info(f"题目 {id} 语音生成并更新成功")
        return oss_path
    except Exception as e:
        logger.error(f"题目语音生成失败: id={id}, error={e}", exc_info=True)
        raise ValueError(f"题目语音生成失败: id={id}, error={e}")


@router.post("/{id}/audio_answer_analysis")
async def analyze_question_audio(
    id: int, params: AudioAnswerAnalysisRequest, db: AsyncSession = Database
) -> AudioAnswerAnalysisResponse:
    """分析题目音频答案是否正确"""
    try:
        # 获取题目
        question = await db.scalar(select(Question).where(Question.id == id))
        if not question:
            raise ValueError(f"题目不存在: {id}")

        return await audio_answer_analysis(params.audio_url, params.audio_type, question.content)
    except Exception as e:
        logger.error(f"题目语音答案分析失败: id={id}, error={e}", exc_info=True)
        raise ValueError(f"题目语音答案分析失败: id={id}, error={e}")


@router.post("/{id}/text_answer_analysis")
async def analyze_answer(
    id: int, params: TextAnswerAnalysisRequest, db: AsyncSession = Database
) -> TextAnswerAnalysisResponse:
    """分析题目文本答案是否正确"""
    try:
        # 获取题目
        question = await db.scalar(select(Question).where(Question.id == id))
        if not question:
            raise ValueError(f"题目不存在: {id}")

        return await text_answer_analysis(question, params.text_answer)
    except Exception as e:
        logger.error(f"文本答案分析失败: id={id}, error={e}", exc_info=True)
        raise ValueError(f"文本答案分析失败: id={id}, error={e}")
