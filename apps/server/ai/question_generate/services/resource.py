"""资源生成服务 - 负责生成图片和音频资源"""

import asyncio
from typing import Any, Dict, List
from loguru import logger

from shared.core.database import Question
from ai.schema import QuestionGenerationState
from ai.question.resource import generate_image, generate_audio


async def generate_images(state: QuestionGenerationState) -> Dict[str, Any]:
    """图片生成节点 - 根据 resource_type 标识为题目生成图片（并行生成）"""
    image_questions: List[Question] = state.get("image_questions", [])

    # 过滤出需要生成图片的题目
    questions_to_generate = [q for q in image_questions if q.resource_type == "image"]

    if not questions_to_generate:
        logger.info("没有需要生成图片的题目")
        return {"image_questions": image_questions}

    logger.info(f"开始为 {len(questions_to_generate)} 道题目并行生成图片")

    # 并行生成图片
    async def generate_single_image(question: Question):
        try:
            image_url = await generate_image(question)
            question._temp_image_url = image_url
            logger.info(f"题目 {question.id} 图片生成成功")
        except Exception as e:
            logger.error(
                f"为问题 {question.content[:50] if question.content else 'N/A'} 生成图片失败: {e}"
            )
            question._temp_image_url = None

    # 并行执行所有图片生成任务
    await asyncio.gather(*[generate_single_image(q) for q in questions_to_generate])

    logger.info(f"图片生成完成，共处理 {len(questions_to_generate)} 道题目")

    return {"image_questions": image_questions}


async def generate_audios(state: QuestionGenerationState) -> Dict[str, Any]:
    """语音生成节点 - 根据 resource_type 标识为题目生成语音（并行生成）"""
    audio_questions: List[Question] = state.get("audio_questions", [])

    # 过滤出需要生成语音的题目
    questions_to_generate = [q for q in audio_questions if q.resource_type == "audio"]

    if not questions_to_generate:
        logger.info("没有需要生成语音的题目")
        return {"audio_questions": audio_questions}

    logger.info(f"开始为 {len(questions_to_generate)} 道题目并行生成语音")

    # 并行生成语音
    async def generate_single_audio(question: Question):
        try:
            audio_url = await generate_audio(question, language="English")
            # 将音频URL保存到临时字段，后续上传时使用
            question._temp_audio_url = audio_url
            logger.info(f"题目 {question.id} 语音生成成功")
        except Exception as e:
            logger.error(f"为问题 {question.content[:50]} 生成语音失败: {e}")
            question._temp_audio_url = None

    # 并行执行所有语音生成任务
    await asyncio.gather(*[generate_single_audio(q) for q in questions_to_generate])

    logger.info(f"语音生成完成，共处理 {len(questions_to_generate)} 道题目")

    return {"audio_questions": audio_questions}
