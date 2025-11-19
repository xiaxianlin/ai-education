"""存储服务 - 负责文件上传和题目保存"""
import os
import requests
from pathlib import Path
from typing import Any, Dict, List
from loguru import logger

from core.database import Question
from core.settings import envs
from sqlalchemy.ext.asyncio import AsyncSession
from shared.question.types import QuestionGenerationState
from shared.provider.aliyun import AliyunOSS
from shared.utils.time import now


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
    unit_id = state["unit_id"]

    oss = AliyunOSS()
    tmp_dir = Path(envs.TMP_DIR)
    tmp_dir.mkdir(parents=True, exist_ok=True)

    # 上传图片
    for idx, question in enumerate(image_questions):
        if hasattr(question, "_temp_image_url") and question._temp_image_url:
            try:
                # 下载图片
                image_path = tmp_dir / f"question_{unit_id}_{idx}_image.jpg"
                await download_file(question._temp_image_url, str(image_path))

                # 读取文件内容
                with open(image_path, "rb") as f:
                    file_data = f.read()

                # 上传到 OSS
                oss_path = f"questions/{unit_id}/images/{idx}.jpg"

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
                logger.error(f"上传图片失败: {e}")
                question.resource = None

    # 上传音频
    for idx, question in enumerate(audio_questions):
        if hasattr(question, "_temp_audio_url") and question._temp_audio_url:
            try:
                # 下载音频
                audio_path = tmp_dir / f"question_{unit_id}_{idx}_audio.mp3"
                await download_file(question._temp_audio_url, str(audio_path))

                # 读取文件内容
                with open(audio_path, "rb") as f:
                    file_data = f.read()

                # 上传到 OSS
                oss_path = f"questions/{unit_id}/audio/{idx}.mp3"

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
                logger.error(f"上传音频失败: {e}")
                question.resource = None

    return {
        "image_questions": image_questions,
        "audio_questions": audio_questions,
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


async def update_questions(state: QuestionGenerationState) -> Dict[str, Any]:
    """更新已保存的问题（如 resource 字段等）"""
    image_questions: List[Question] = state.get("image_questions", [])
    audio_questions: List[Question] = state.get("audio_questions", [])
    text_questions: List[Question] = state.get("text_questions", [])
    db: AsyncSession = state["db"]

    all_questions = image_questions + audio_questions + text_questions

    if all_questions:
        # 更新所有问题的 update_time（resource 字段已在 upload_files 节点中设置）
        for question in all_questions:
            question.update_time = now()

        await db.commit()
        logger.info(
            f"成功更新 {len(all_questions)} 道题目（图片题：{len(image_questions)}，"
            f"音频题：{len(audio_questions)}，文本题：{len(text_questions)}）"
        )
    else:
        logger.info("没有需要更新的题目")

    return {
        "saved_questions": all_questions,
    }

