import dashscope
from common.settings import envs
from ai.services.prompt import PromptOptimizationService


class AliyunAIService:

    @staticmethod
    def asr(file_url: str, language: str = "zh"):
        response = dashscope.MultiModalConversation.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen3-asr-flash",
            messages=[{"role": "user", "content": [{"audio": file_url}]}],
            result_format="message",
            asr_options={"language": language, "enable_itn": True},
        )

        if response.status_code != 200 or not response.code:
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        return response.output.choices[0].message.content.text

    @staticmethod
    def tts(text: str, voice: str = "Cherry", language: str = "English"):
        # qwen3-tts-flash 需要使用 input.text 参数
        response = dashscope.MultiModalConversation.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen3-tts-flash",
            text=text,
            voice=voice,
            language_type=language,
            stream=False,
        )

        if response.status_code != 200 or not response.code:
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        return response.output.audio.url

    @staticmethod
    def generate_image(
        text: str, width: int = None, height: int = None, optimize_prompt: bool = True
    ):
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

            image_prompt = PromptOptimizationService.optimize_image_prompt(text)
        else:
            # 直接使用传入的文本作为提示词
            image_prompt = text

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

        if response.status_code != 200 or not response.code:
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        return response.output.choices[0].message.content.image
