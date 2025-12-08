"""图片生成服务"""

from loguru import logger
from dashscope import MultiModalConversation

from core.settings import envs
from core.database import Question
from utils.prompt import optimize_image_prompt
from utils.question import build_full_question_text


def generate_image(question: Question, width: int = 1328, height: int = 1328) -> str:

    question_text = build_full_question_text(question)
    # 如果启用提示词优化，使用提示词优化服务
    image_prompt = optimize_image_prompt(question_text)
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
        logger.error(f"图片生成失败，任务 ID: {response.request_id}, 错误信息: {response.message}")
        raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

    image_url = response.output.choices[0].message.content[0].get("image")
    logger.info(f"图片生成成功，任务 ID: {response.request_id}, 图片URL: {image_url}")
    return image_url
