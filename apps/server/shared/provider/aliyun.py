"""阿里云百炼AI Provider 实现"""

from typing import Any, Optional

import dashscope
from dashscope import MultiModalConversation
from langchain_core.output_parsers import BaseOutputParser
from langchain_core.prompts import BasePromptTemplate
from langchain_openai import ChatOpenAI
from loguru import logger
from openai import OpenAI
from shared.core.settings import envs

from .base import BaseProvider


class AliyunProvider(BaseProvider):
    """阿里云百炼AI Provider

    实现阿里云百炼AI（DashScope）的具体调用逻辑。
    """

    def __init__(self):
        """初始化阿里云 Provider"""
        self.api_key = envs.AI_PLATFORM_KEY
        self.api_base = envs.AI_PLATFORM_URL
        self.default_model = "qwen-flash"
        self.default_tts_voice = getattr(envs, "AI_TTS_VOICE", "Elias")
        dashscope.api_key = self.api_key

    def get_openai_client(self) -> OpenAI:
        """获取 OpenAI 客户端实例（兼容模式）"""
        return OpenAI(api_key=self.api_key, base_url=self.api_base)

    def get_langchain_client(self, model_name: str = None, **kwargs) -> ChatOpenAI:
        """获取 LangChain ChatOpenAI 客户端实例"""
        return ChatOpenAI(
            model_name=model_name or self.default_model,
            temperature=kwargs.get("temperature", 0.7),
            openai_api_key=self.api_key,
            openai_api_base=self.api_base,
        )

    def get_provider_client(self) -> Optional[Any]:
        """获取平台 SDK 客户端类"""
        return MultiModalConversation

    def invoke_image_generate(self, prompt: str, width: int = 1328, height: int = 1328, **kwargs) -> str:
        """图片生成"""
        model = kwargs.get("model", "qwen-image-plus")
        negative_prompt = kwargs.get("negative_prompt", "")
        prompt_extend = kwargs.get("prompt_extend", False)
        size = f"{width}*{height}" if width and height else None

        logger.info(f"开始生成图片，模型: {model}, 尺寸: {size}, 提示词长度: {len(prompt)}")

        try:
            response = MultiModalConversation.call(
                model=model,
                messages=[{"role": "user", "content": [{"text": prompt}]}],
                result_format="message",
                size=size,
                negative_prompt=negative_prompt,
                stream=False,
                prompt_extend=prompt_extend,
            )

            logger.debug(f"图片生成响应: {response}")

            if response.status_code != 200:
                logger.error(f"图片生成失败，任务 ID: {response.request_id}, " f"错误信息: {response.message}")
                raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

            image_url = response.output.choices[0].message.content[0].get("image")
            logger.info(f"图片生成成功，任务 ID: {response.request_id}, 图片URL: {image_url}")
            return image_url

        except Exception as e:
            logger.error(f"图片生成失败: {e}", exc_info=True)
            raise ValueError(f"图片生成失败: {str(e)}")

    def invoke_video_generate(self, prompt: str, **kwargs) -> str:
        """视频生成（暂不支持）"""
        raise NotImplementedError("阿里云百炼AI暂不支持视频生成功能")

    def invoke_text_generate(self, prompt: str, **kwargs) -> str:
        """文本生成"""
        model_name = kwargs.get("model_name", self.default_model)
        temperature = kwargs.get("temperature", 0.7)

        logger.info(f"开始文本生成，模型: {model_name}, 提示词长度: {len(prompt)}")

        try:
            client = self.get_langchain_client(model_name=model_name, temperature=temperature)
            result = client.invoke(prompt)

            text = result.content.strip()

            logger.info(f"文本生成成功，结果长度: {len(text)}")
            return text

        except Exception as e:
            logger.error(f"文本生成失败: {e}", exc_info=True)
            raise ValueError(f"文本生成失败: {str(e)}")

    async def invoke_chain(
        self,
        prompt: BasePromptTemplate,
        parser: Optional[BaseOutputParser] = None,
        prompt_input: Optional[dict] = None,
        **kwargs,
    ) -> Any:
        """LangChain 链式调用"""
        if prompt_input is None:
            prompt_input = {}
        if parser is None:
            parser = kwargs.get("parser", None)

        try:
            client = self.get_langchain_client(
                model_name=kwargs.get("model_name", self.default_model),
                temperature=kwargs.get("temperature", 0.7),
            )

            if parser:
                chain = prompt | client | parser
            else:
                chain = prompt | client

            result = await chain.ainvoke(prompt_input)

            # 如果有 parser，返回解析后的结果（dict）；否则返回 content
            if parser:
                return result
            return result.content if hasattr(result, "content") else result

        except Exception as e:
            logger.error(f"LangChain 链式调用失败: {e}", exc_info=True)
            raise ValueError(f"LangChain 链式调用失败: {str(e)}")

    def invoke_tts(self, text: str, voice: str = "Elias", language: str = "English", **kwargs) -> str:
        """语音生成（TTS）"""

        model = kwargs.get("model", "qwen3-tts-flash")
        voice = voice or self.default_tts_voice

        logger.info(f"开始文本转语音，文本长度: {len(text)}, 语音: {voice}, 语言: {language}")

        try:
            response = MultiModalConversation.call(
                model=model,
                text=text,
                voice=voice,
                language_type=language,
                stream=False,
            )

            logger.debug(f"语音生成响应: {response}")

            if response.status_code != 200:
                logger.error(f"文本转语音失败，任务 ID: {response.request_id}, " f"错误信息: {response.message}")
                raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

            audio_url = response.output.audio.url
            logger.info(f"文本转语音成功，任务 ID: {response.request_id}, 音频URL: {audio_url}")
            return audio_url

        except Exception as e:
            logger.error(f"文本转语音失败: {e}", exc_info=True)
            raise ValueError(f"文本转语音失败: {str(e)}")

    def invoke_asr(self, audio_url: str, **kwargs) -> str:
        """语音识别（ASR）"""
        model = kwargs.get("model", "qwen3-asr-flash")
        language = kwargs.get("language", "en")
        system_prompt = kwargs.get("prompt", "请准确转写音频中的内容，直接返回文本，不要添加任何解释。")

        logger.info(f"开始语音识别，音频地址: {audio_url}, 模型: {model}")

        try:
            messages = [
                {"role": "system", "content": [{"text": system_prompt}]},
                {"role": "user", "content": [{"audio": audio_url}]},
            ]

            response = MultiModalConversation.call(
                api_key=self.api_key,
                model=model,
                messages=messages,
                result_format="message",
                asr_options={"language": language, "enable_itn": False},
            )

            if response.status_code != 200:
                logger.error(f"语音识别失败，任务 ID: {response.request_id}, " f"错误信息: {response.message}")
                raise ValueError(f"任务 ID：{response.request_id} \n 错误信息：{response.message}")

            # 提取响应文本
            result_text = response.output.choices[0].message.content[0].get("text")
            logger.info(f"语音识别成功，结果长度: {len(result_text)}")
            return result_text.strip()

        except Exception as e:
            logger.error(f"语音识别失败: {e}", exc_info=True)
            raise ValueError(f"语音识别失败: {str(e)}")
