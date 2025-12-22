import requests
from typing import Optional
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.output_parsers import JsonOutputParser

from shared.core.database import Question
from shared.core.schema import AnswerAnalysisSchema
from shared.core.constants import AI_FALLBACK_CONTENT_MAX_LENGTH
from shared.utils import oss
from shared.utils.question import build_full_question_text
from shared.provider import get_provider
from shared.services.prompt import PromptService


async def _optimize_image_prompt(text: str, db: Optional[AsyncSession] = None) -> str:
    """使用 LLM 优化图片生成提示词

    Args:
        text: 题目文本内容
        db: 数据库会话，用于动态加载提示词
    """
    if not text or not text.strip():
        logger.warning("输入文本为空，返回默认提示词")
        return "卡通风格，简单背景，明亮色彩，适合小学生"

    # 清理输入文本
    question_content = text.strip()
    logger.debug(f"开始优化图片提示词，原始文本长度: {len(question_content)}")

    try:
        # 使用 PromptService 获取 prompt
        prompt = await PromptService.get_image_optimize_prompt(db=db)

        # 使用 provider 调用
        provider = get_provider()
        result = provider.invoke_chain(
            prompt=prompt,
            prompt_input={"question_content": question_content},
        )

        # 提取优化后的提示词
        if isinstance(result, str):
            optimized_prompt = result.strip()
        elif hasattr(result, "content"):
            optimized_prompt = result.content.strip()
        elif isinstance(result, dict) and "content" in result:
            optimized_prompt = result["content"].strip()
        else:
            logger.error(f"LLM 返回结果格式异常: {type(result)}, 内容: {result}")
            raise ValueError(f"LLM 返回结果格式错误: {type(result).__name__}")

        # 验证结果
        if not optimized_prompt:
            logger.error("LLM 返回的提示词为空")
            raise ValueError("LLM 返回的提示词为空，请重试")

        return optimized_prompt

    except ValueError as e:
        # 业务逻辑错误（如格式错误）
        logger.error(f"优化图片提示词失败（业务错误）: {e}")
        raise
    except (ConnectionError, TimeoutError, OSError) as e:
        # 网络或系统错误
        logger.error(f"优化图片提示词失败（网络/系统错误）: {e}")
        logger.warning("LLM 调用失败，使用降级方案")
        # 清理用户输入，只保留安全的字符，避免提示词注入
        safe_content = "".join(c for c in question_content[:AI_FALLBACK_CONTENT_MAX_LENGTH] if c.isalnum() or c in "，。！？、")
        fallback_prompt = f"卡通风格，简单背景，明亮色彩，适合小学生"
        if safe_content:
            fallback_prompt += f"，主题：{safe_content}"
        return fallback_prompt
    except Exception as e:
        # 其他未知错误
        logger.error(f"优化图片提示词失败（未知错误）: {e}", exc_info=True)
        logger.warning("LLM 调用失败，使用降级方案")
        # 清理用户输入，只保留安全的字符，避免提示词注入
        safe_content = "".join(c for c in question_content[:AI_FALLBACK_CONTENT_MAX_LENGTH] if c.isalnum() or c in "，。！？、")
        fallback_prompt = f"卡通风格，简单背景，明亮色彩，适合小学生"
        if safe_content:
            fallback_prompt += f"，主题：{safe_content}"
        return fallback_prompt


async def generate_question_image(
    question: Question,
    width: int = 1328,
    height: int = 1328,
    db: Optional[AsyncSession] = None,
) -> str:
    """为指定题目生成图片

    Args:
        question: 题目对象
        width: 图片宽度
        height: 图片高度
        db: 数据库会话，用于动态加载提示词
    """
    # 生成图片
    question_text = build_full_question_text(question)
    # 如果启用提示词优化，使用提示词优化服务
    image_prompt = await _optimize_image_prompt(question_text, db)
    logger.info(f"图片生成提示词: {image_prompt}")

    size_str = f"{width}*{height}" if width and height else "默认"
    logger.info(f"开始生成图片，尺寸: {size_str}, 提示词长度: {len(image_prompt)}")

    # 使用 provider 生成图片
    provider = get_provider()
    image_url = provider.invoke_image_generate(
        prompt=image_prompt,
        width=width,
        height=height,
        model="qwen-image-plus",
        negative_prompt="",
        prompt_extend=True,
    )

    response = requests.get(image_url, stream=True)
    response.raise_for_status()
    oss_path = f"questions/{question.textbook_id}/images/{question.id}.jpg"
    oss.upload(oss_path, response.content)

    logger.info(f"题目 {question.id} 图片生成并更新成功")
    return oss_path


async def generate_question_audio(question: Question, language: str = "English") -> str:
    """为指定题目生成语音

    Args:
        question: 题目对象
        language: 语言类型，默认 "English"
    """
    if not question.resource_content:
        raise ValueError(f"题目语音语料不存在: {question.id}")

    text = question.resource_content
    logger.info(f"开始文本转语音，文本长度: {len(text)}, 语言: {language}")
    logger.debug(f"文本内容: {text[:200]}...")

    # 使用 provider 生成语音
    provider = get_provider()
    audio_url = provider.invoke_tts(
        text=text,
        voice=provider.default_tts_voice,
        language=language,
        model="qwen3-tts-flash",
    )

    # 下载音频
    response = requests.get(audio_url, stream=True)
    response.raise_for_status()
    oss_path = f"questions/{question.textbook_id}/audio/{question.id}.mp3"
    oss.upload(oss_path, response.content)

    logger.info(f"题目 {question.id} 语音生成并更新成功")
    return oss_path


async def analyze_text_answer(
    question: Question, text_answer: str, db: Optional[AsyncSession] = None
) -> AnswerAnalysisSchema:
    """分析题目文本答案是否正确

    Args:
        question: 题目对象
        text_answer: 学生答案
        db: 数据库会话，用于动态加载提示词
    """
    logger.info(f"开始分析答题情况: content_length={len(question.content)}, text_answer={text_answer}")

    # 创建 JSON 输出解析器
    parser = JsonOutputParser(pydantic_object=AnswerAnalysisSchema)

    # 使用 PromptService 获取 prompt
    prompt = await PromptService.get_answer_analyze_prompt(db=db, format_instructions=parser.get_format_instructions())

    # 使用 provider 调用
    provider = get_provider()
    result = provider.invoke_chain(
        prompt=prompt,
        parser=parser,
        prompt_input={
            "content": question.content,
            "options": question.options if question.options else "无",
            "knowledge": question.knowledge if question.knowledge else "无",
            "question_answer": question.answer,
            "student_answer": text_answer,
        },
    )

    # 验证结果
    if not isinstance(result, dict):
        raise ValueError(f"LLM 返回结果格式错误，期望字典类型，实际为: {type(result).__name__}")

    # 解析结果
    return AnswerAnalysisSchema.model_validate(result)


async def recognize_audio_answer(audio_url: str) -> str:
    """识别题目音频答案

    Args:
        audio_url: 音频 URL

    Returns:
        识别出的文本内容
    """
    logger.info(f"开始识别音频答案: audio_url={audio_url}")

    # 使用 provider 识别音频答案
    provider = get_provider()
    result = provider.invoke_asr(audio_url)
