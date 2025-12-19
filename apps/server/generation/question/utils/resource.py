from typing import List, Dict, Any
from loguru import logger
from shared.core.database import Question
from generation.question.schema import QuestionGenerationState


async def generate_images(state: QuestionGenerationState) -> Dict[str, Any]:
    """图片生成节点 - 根据 resource_type 标识为题目生成图片（并行生成）"""
    questions: List[Question] = state.get("questions", [])

    count = 0
    for question in questions:
        if question.resource_type != "image":
            continue
        try:
            image_url = await generate_question_image(question)
            question.resource = image_url
            logger.info(f"题目 {question.id} 图片生成成功")
            count += 1
        except Exception as e:
            logger.error(f"为问题 {question.content[:50] if question.content else 'N/A'} 生成图片失败: {e}")
            question.resource = None

    if count:
        logger.info(f"图片生成完成，共处理 {count} 道题目")
    return {}


async def generate_audios(state: QuestionGenerationState) -> Dict[str, Any]:
    """语音生成节点 - 根据 resource_type 标识为题目生成语音（并行生成）"""
    questions: List[Question] = state.get("questions", [])

    count = 0

    for question in questions:
        if question.resource_type != "audio":
            continue
        try:
            audio_url = await generate_question_audio(question, language="English")
            question.resource = audio_url
            logger.info(f"题目 {question.id} 语音生成成功")
            count += 1
        except Exception as e:
            logger.error(f"为问题 {question.content[:50]} 生成语音失败: {e}")
            question.resource = None

    if count:
        logger.info(f"语音生成完成，共处理 {count} 道题目")

    return {}
