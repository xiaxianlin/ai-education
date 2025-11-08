import dashscope
from common.settings import envs


class AliyunAIService:

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

    def tts(text: str, voice: str = "Cherry", language: str = "English"):
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

    def generate_image(text: str, width: int = None, height: int = None):
        response = dashscope.ImageSynthesis.call(
            api_key=envs.AI_PLATFORM_KEY,
            model="qwen-image-plus",
            messages=[{"role": "user", "content": [{"type": "text", "text": text}]}],
            result_format="message",
            stream=False,
            size=f"{width}*{height}" if width and height else None,
        )

        if response.status_code != 200 or not response.code:
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

        return response.output.choices[0].message.content.image
