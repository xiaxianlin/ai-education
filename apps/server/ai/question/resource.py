import requests
from loguru import logger
from dashscope import MultiModalConversation
from langchain_core.prompts import ChatPromptTemplate

from shared.core.settings import envs
from shared.core.database import Question
from shared.utils import oss
from ai.utils.question import build_full_question_text
from ai.utils.llm import get_chat_client


IMAGE_GENERATION_PROMPT = """
你是一名专业的图片生成提示词工程师，专门为小学一到三年级的学生设计教育图片。请根据以下教育题目内容，生成一个简单、清晰、适合低年级学生认知水平的图片生成提示词。

题目内容：{question_content}

要求：
1. **简单明了**：图片内容要简单，避免复杂的背景和过多的细节
2. **清晰突出**：主要对象要清晰可见，背景简洁，避免干扰元素
3. **符合认知**：适合小学一到三年级学生的认知水平，使用他们熟悉的事物和场景
4. **色彩鲜明**：使用明亮、鲜艳的颜色，吸引学生注意力
5. **风格统一**：采用卡通、插画风格，避免写实风格
6. **重点突出**：如果是选择题或辨识题，重点突出需要识别的对象，使其成为画面焦点
7. **场景简单**：如果是场景题，只描述主要场景和1-3个关键元素，避免复杂构图
8. **物品识别**：如果是物品识别题，直接描述物品，使用纯色或简单背景

图片生成提示词格式要求：
- 使用简洁的中文或英文描述
- 明确指定风格：如"卡通风格"、"插画风格"、"简单线条"
- 明确指定背景：如"纯色背景"、"简单背景"、"白色背景"
- 明确指定颜色：如"鲜艳的颜色"、"明亮的颜色"
- 避免使用专业术语或复杂概念

请直接返回优化后的图片生成提示词，不要添加任何解释或说明。
"""


def _optimize_image_prompt(text: str) -> str:
    """使用 LLM 优化图片生成提示词"""
    if not text or not text.strip():
        logger.warning("输入文本为空，返回默认提示词")
        return "卡通风格，简单背景，明亮色彩，适合小学生"

    # 清理输入文本
    question_content = text.strip()
    logger.debug(f"开始优化图片提示词，原始文本长度: {len(question_content)}")

    try:
        # 构建 prompt 模板
        prompt = ChatPromptTemplate.from_messages([("system", IMAGE_GENERATION_PROMPT)])

        # 初始化 LLM
        client = get_chat_client()

        # 构建调用链
        chain = prompt | client

        # 调用 LLM，传入模板变量
        prompt_input = {"question_content": question_content}
        result = chain.invoke(prompt_input)

        # 提取优化后的提示词
        if hasattr(result, "content"):
            optimized_prompt = result.content.strip()
        elif isinstance(result, dict) and "content" in result:
            optimized_prompt = result["content"].strip()
        elif isinstance(result, str):
            optimized_prompt = result.strip()
        else:
            logger.error(f"LLM 返回结果格式异常: {type(result)}, 内容: {result}")
            raise ValueError(f"LLM 返回结果格式错误: {type(result).__name__}")

        # 验证结果
        if not optimized_prompt:
            logger.error("LLM 返回的提示词为空")
            raise ValueError("LLM 返回的提示词为空，请重试")

        return optimized_prompt

    except Exception as e:
        logger.error(f"优化图片提示词失败: {e}")
        # 如果 LLM 调用失败，返回一个基础的提示词作为降级方案
        logger.warning("LLM 调用失败，使用降级方案")
        fallback_prompt = (
            f"卡通风格，简单背景，明亮色彩，适合小学生，{question_content[:50]}"
        )
        return fallback_prompt


async def generate_question_image(
    question: Question, width: int = 1328, height: int = 1328
) -> str:
    """为指定题目生成图片"""

    # 生成图片
    question_text = build_full_question_text(question)
    # 如果启用提示词优化，使用提示词优化服务
    image_prompt = _optimize_image_prompt(question_text)
    logger.info(f"图片生成提示词: {image_prompt}")

    size_str = f"{width}*{height}" if width and height else "默认"
    logger.info(f"开始生成图片，尺寸: {size_str}, 提示词长度: {len(image_prompt)}")

    response = MultiModalConversation.call(
        api_key=envs.AI_PLATFORM_KEY,
        model="qwen-image-plus",
        messages=[{"role": "user", "content": [{"text": image_prompt}]}],
        result_format="message",
        prompt_extend=True,
        negative_prompt="",
        stream=False,
        size=f"{width}*{height}" if width and height else None,
    )

    logger.debug(f"图片生成响应: {response}")

    if response.status_code != 200:
        logger.error(
            f"图片生成失败，任务 ID: {response.request_id}, 错误信息: {response.message}"
        )
        raise ValueError(
            f"任务 ID：{response.request_id} \n 错误信息：{response.message}"
        )

    image_url = response.output.choices[0].message.content[0].get("image")
    logger.info(f"图片生成成功，任务 ID: {response.request_id}, 图片URL: {image_url}")

    response = requests.get(image_url, stream=True)
    response.raise_for_status()
    oss_path = f"questions/{question.textbook_id}/images/{question.id}.jpg"
    oss.upload(oss_path, response.content)

    logger.info(f"题目 {question.id} 图片生成并更新成功")
    return oss_path


async def generate_question_audio(question: Question, language: str = "English") -> str:
    """为指定题目生成语音"""

    if not question.resource_content:
        raise ValueError(f"题目语音语料不存在: {question.id}")

    voice = envs.AI_TTS_VOICE
    text = question.resource_content
    logger.info(
        f"开始文本转语音，文本长度: {len(text)}, 语音: {voice}, 语言: {language}"
    )
    logger.debug(f"文本内容: {text[:200]}...")

    response = MultiModalConversation.call(
        api_key=envs.AI_PLATFORM_KEY,
        model="qwen3-tts-flash",
        text=text,
        voice=voice,
        language_type=language,
        stream=False,
    )

    logger.debug(f"语音生成响应: {response}")

    if response.status_code != 200:
        logger.error(
            f"文本转语音失败，任务 ID: {response.request_id}, 错误信息: {response.message}"
        )
        raise ValueError(
            f"任务 ID：{response.request_id} \n 错误信息：{response.message}"
        )

    audio_url = response.output.audio.url
    logger.info(f"文本转语音成功，任务 ID: {response.request_id}, 音频URL: {audio_url}")

    # 下载音频

    response = requests.get(audio_url, stream=True)
    response.raise_for_status()
    oss_path = f"questions/{question.textbook_id}/audio/{question.id}.mp3"
    oss.upload(oss_path, response.content)

    logger.info(f"题目 {question.id} 语音生成并更新成功")
    return oss_path
