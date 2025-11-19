"""资源生成服务 - 负责生成图片和音频资源"""
import asyncio
from typing import Any, Dict, List
from loguru import logger

from core.database import Question
from shared.question.types import QuestionGenerationState
from shared.utils.question import build_full_question_text
from shared.services.aliyun import AliyunAIService


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
            # 构建完整的问题内容（包含题目、选项、答案）
            full_question_text = build_full_question_text(question)

            # 生成图片
            # 使用允许的尺寸：1328*1328（最接近正方形的尺寸）
            # 使用 optimize_prompt=True 优化提示词
            image_url = AliyunAIService.generate_image(
                text=full_question_text, width=1328, height=1328, optimize_prompt=True
            )
            # 将图片URL保存到临时字段，后续上传时使用
            question._temp_image_url = image_url
            logger.info(f"题目 {question.id} 图片生成成功")
        except Exception as e:
            logger.error(f"为问题 {question.content[:50] if question.content else 'N/A'} 生成图片失败: {e}")
            question._temp_image_url = None

    # 并行执行所有图片生成任务
    await asyncio.gather(*[generate_single_image(q) for q in questions_to_generate])

    logger.info(f"图片生成完成，共处理 {len(questions_to_generate)} 道题目")

    return {
        "image_questions": image_questions,
    }


async def generate_audio(state: QuestionGenerationState) -> Dict[str, Any]:
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
            # 生成语音，优先使用 resource_content，如果没有则使用 content
            text_to_speak = question.resource_content if question.resource_content else question.content
            audio_url = AliyunAIService.tts(text=text_to_speak, voice="Cherry", language="Chinese")
            # 将音频URL保存到临时字段，后续上传时使用
            question._temp_audio_url = audio_url
            logger.info(f"题目 {question.id} 语音生成成功")
        except Exception as e:
            logger.error(f"为问题 {question.content[:50]} 生成语音失败: {e}")
            question._temp_audio_url = None

    # 并行执行所有语音生成任务
    await asyncio.gather(*[generate_single_audio(q) for q in questions_to_generate])

    logger.info(f"语音生成完成，共处理 {len(questions_to_generate)} 道题目")

    return {
        "audio_questions": audio_questions,
    }

