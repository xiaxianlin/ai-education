"""语音生成服务"""
import dashscope
from loguru import logger

from core.settings import envs


class AudioService:
    """语音生成服务"""
    
    @staticmethod
    def generate_audio(
        text: str,
        voice: str = "Cherry",
        language: str = "Chinese",
    ) -> str:
        """
        生成语音
        
        Args:
            text: 要转换为语音的文本
            voice: 语音角色（默认 Cherry）
            language: 语言（默认 Chinese）
            
        Returns:
            str: 音频 URL
        """
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
        
        logger.debug(f"语音生成响应: {response}")
        
        if response.status_code != 200:
            logger.error(
                f"文本转语音失败，任务 ID: {response.request_id}, 错误信息: {response.message}"
            )
            raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")
        
        audio_url = response.output.audio.url
        logger.info(f"文本转语音成功，任务 ID: {response.request_id}, 音频URL: {audio_url}")
        return audio_url

