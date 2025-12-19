from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Question
from shared.provider import get_provider
from shared.services.prompt import get_image_optimize_prompt


def _build_full_question_text(question: Question) -> str:
    """构建完整的问题内容，包含题目、选项、答案"""
    parts = []

    # 题目内容
    if question.content:
        parts.append(f"题目：{question.content}")

    # 选项
    if question.options:
        try:
            parsed = json.loads(question.options)
            if isinstance(parsed, list):
                options_text = "\n".join(
                    [
                        f"{chr(65 + i)}. {opt if isinstance(opt, str) else opt.get('text', opt.get('label', str(opt)))}"
                        for i, opt in enumerate(parsed)
                    ]
                )
            else:
                # 如果不是数组，尝试按换行符分割
                options_text = question.options
            if options_text:
                parts.append(f"选项：\n{options_text}")
        except (json.JSONDecodeError, Exception):
            # 如果解析失败，直接使用原始文本
            if question.options.strip():
                parts.append(f"选项：\n{question.options}")

    # 答案
    if question.answer:
        parts.append(f"答案：{question.answer}")

    return "\n\n".join(parts) if parts else question.content or ""


async def generate_question_image(db: AsyncSession, question: Question, width: int = 1328, height: int = 1328) -> str:
    """为指定题目生成图片

    Args:
        question: 题目对象
        width: 图片宽度
        height: 图片高度
        db: 数据库会话，用于动态加载提示词
    """

    provider = get_provider()

    optimize_prompt = await get_image_optimize_prompt(db=db)

    image_prompt = provider.invoke_chain(
        prompt=optimize_prompt, prompt_input={"question_content": _build_full_question_text(question)}
    )

    logger.info(f"图片生成提示词: {image_prompt}")

    logger.info(f"开始生成图片，尺寸: {width}*{height}, 提示词长度: {len(image_prompt)}")

    image_url = provider.invoke_image_generate(prompt=image_prompt, width=width, height=height)

    return image_url


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
        question: 题目对象
        audio_url: 音频 URL
    """
    logger.info(f"开始识别音频答案: audio_url={audio_url}, 问题: {question.content[:100]}...")

    # 使用 provider 识别音频答案
    provider = get_provider()
    result = provider.invoke_asr(audio_url)
