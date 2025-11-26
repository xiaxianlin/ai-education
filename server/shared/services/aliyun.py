import dashscope
from loguru import logger
from core.settings import envs
from shared.services.prompt import PromptService


class AliyunAIService:

    @staticmethod
    def asr(file_path: str, language: str = "zh"):
        logger.info(f"开始语音识别，文件地址: {file_path}, 语言: {language}")
        audio_file_path = f"file://{file_path}"
        response = dashscope.MultiModalConversation.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen3-asr-flash",
            messages=[{"role": "user", "content": [{"audio": audio_file_path}]}],
            result_format="message",
            asr_options={"language": language, "enable_itn": True},
        )

        if response.status_code != 200:
            logger.error(f"语音识别失败，任务 ID: {response.request_id}, 错误信息: {response.message}")
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        # 处理不同的响应格式
        try:
            content = response.output.choices[0].message.content[0].get("text")
            logger.info(f"语音识别成功，任务 ID: {response.request_id}, 识别结果: {content[:100]}...")
            return content
        except Exception as e:
            logger.error(f"解析 ASR 响应失败: {e}, 响应内容: {response.output}")
            raise ValueError(f"语音识别响应格式错误: {str(e)}")

    @staticmethod
    def tts(text: str, voice: str = "Elias", language: str = "English"):
        logger.info(f"开始文本转语音，文本长度: {len(text)}, 语音: {voice}, 语言: {language}")
        logger.debug(f"文本内容: {text[:200]}...")

        response = dashscope.MultiModalConversation.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen3-tts-flash",
            text=text,
            voice=voice,
            language_type=language,
            stream=False,
        )

        logger.info(response)

        if response.status_code != 200:
            logger.error(f"文本转语音失败，任务 ID: {response.request_id}, 错误信息: {response.message}")
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        audio_url = response.output.audio.url
        logger.info(f"文本转语音成功，任务 ID: {response.request_id}, 音频URL: {audio_url}")
        return audio_url

    @staticmethod
    def generate_image(text: str, width: int = None, height: int = None, optimize_prompt: bool = True):
        """
        生成图片

        Args:
            text: 问题内容或图片生成提示词
            width: 图片宽度
            height: 图片高度
            optimize_prompt: 是否使用 LLM 优化提示词（默认 True）

        Returns:
            图片 URL
        """
        # 如果启用提示词优化，使用提示词优化服务
        if optimize_prompt:
            logger.info(f"开始优化图片生成提示词，原始文本长度: {len(text)}")
            image_prompt = PromptService.optimize_image_prompt(text)
            logger.info(f"提示词优化完成，优化后长度: {len(image_prompt)}")
            logger.debug(f"优化后的提示词: {image_prompt[:200]}...")
        else:
            # 直接使用传入的文本作为提示词
            image_prompt = text
            logger.info(f"使用原始提示词，长度: {len(image_prompt)}")

        size_str = f"{width}*{height}" if width and height else "默认"
        logger.info(f"开始生成图片，尺寸: {size_str}, 提示词长度: {len(image_prompt)}")

        response = dashscope.MultiModalConversation.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen-image-plus",
            messages=[{"role": "user", "content": [{"text": image_prompt}]}],
            result_format="message",
            prompt_extend=True,
            negative_prompt="",
            stream=False,
            size=f"{width}*{height}" if width and height else None,
        )

        logger.info(response)
        if response.status_code != 200:
            logger.error(f"图片生成失败，任务 ID: {response.request_id}, 错误信息: {response.message}")
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")
        image_url = response.output.choices[0].message.content[0].get("image")
        logger.info(f"图片生成成功，任务 ID: {response.request_id}, 图片URL: {image_url}")
        return image_url
