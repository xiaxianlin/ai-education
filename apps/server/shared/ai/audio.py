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
    return result
