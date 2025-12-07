"""语音生成路由"""
import os
import requests
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger

from schemas.audio import AudioTTSRequest, AudioTTSResponse
from core.database import Database, Question
from services.audio_service import AudioService
from services.oss_service import OSSService
from core.settings import envs

router = APIRouter(prefix="/api/v1/audio", tags=["Audio"])


@router.post("/tts", response_model=AudioTTSResponse)
async def text_to_speech(request: AudioTTSRequest):
    """文本转语音"""
    try:
        audio_url = AudioService.generate_audio(
            text=request.text,
            voice=request.voice,
            language=request.language,
        )
        
        return AudioTTSResponse(audio_url=audio_url)
    except Exception as e:
        logger.error(f"文本转语音失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tts/question/{question_id}")
async def generate_question_audio(
    question_id: int,
    db: AsyncSession = Database,
):
    """为指定题目生成语音并更新数据库"""
    try:
        # 获取题目
        question = await db.scalar(
            select(Question).where(Question.id == question_id)
        )
        if not question:
            raise ValueError(f"题目不存在: {question_id}")

        # 生成语音，优先使用 resource_content，如果没有则使用 content
        text_to_speak = question.resource_content if question.resource_content else question.content
        audio_url = AudioService.generate_audio(
            text=text_to_speak,
            voice="Cherry",
            language="Chinese",
        )

        # 下载音频
        tmp_dir = Path(envs.TMP_DIR)
        tmp_dir.mkdir(parents=True, exist_ok=True)
        audio_path = tmp_dir / f"question_{question_id}_audio.mp3"
        
        response = requests.get(audio_url, stream=True)
        response.raise_for_status()
        with open(audio_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # 读取文件内容
        with open(audio_path, "rb") as f:
            file_data = f.read()

        # 上传到 OSS
        oss_path = f"questions/{question.textbook_id}/audio/{question_id}.mp3"
        oss = OSSService()
        
        # 检查文件是否存在，如果存在则先删除
        if oss.exist(oss_path):
            logger.info(f"OSS 文件已存在，先删除: {oss_path}")
            oss.delete(oss_path)

        oss.upload(oss_path, file_data)

        # 更新题目资源字段
        question.resource = oss_path
        question.resource_type = "audio"
        await db.commit()
        await db.refresh(question)

        # 清理临时文件
        os.remove(audio_path)

        logger.info(f"题目 {question_id} 语音生成并更新成功")
        return {"message": "语音生成成功", "resource": oss_path}
    except Exception as e:
        logger.error(f"题目语音生成失败: question_id={question_id}, error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

