"""
OpenAI Provider 实现（预留）
"""

import asyncio
from typing import Any, Dict, Optional
from loguru import logger

from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import BaseOutputParser

from .base import BaseProvider
from .exceptions import ProviderError, ProviderNotSupportedError


class OpenAIProvider(BaseProvider):
    """OpenAI Provider 实现"""
    
    def __init__(self, api_key: str, base_url: str = "https://api.openai.com/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self._openai_client = None
        self._langchain_client = None
        
    def get_openai_client(self) -> OpenAI:
        """返回 OpenAI 库实例"""
        if self._openai_client is None:
            self._openai_client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
        return self._openai_client
    
    def get_langchain_client(self, **kwargs) -> ChatOpenAI:
        """返回 LangChain ChatOpenAI 实例"""
        if self._langchain_client is None or kwargs:
            default_params = {
                "model_name": "gpt-3.5-turbo",
                "temperature": 0.7,
                "api_key": self.api_key,
                "base_url": self.base_url
            }
            default_params.update(kwargs)
            self._langchain_client = ChatOpenAI(**default_params)
        return self._langchain_client
    
    def get_provider_client(self) -> Optional[Any]:
        """OpenAI 就是使用 OpenAI SDK，直接返回 None"""
        return None
    
    async def invoke_image_generate(
        self, 
        prompt: str, 
        width: Optional[int] = None,
        height: Optional[int] = None,
        **kwargs
    ) -> str:
        """图片生成"""
        try:
            client = self.get_openai_client()
            
            # OpenAI DALL-E 模型参数
            size = "1024x1024"  # 默认尺寸
            if width and height:
                # DALL-E 支持的尺寸: 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792
                if f"{width}x{height}" in ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]:
                    size = f"{width}x{height}"
                else:
                    logger.warning(f"不支持的图片尺寸: {width}x{height}，使用默认尺寸: {size}")
            
            logger.info(f"开始生成图片，提示词: {prompt}, 尺寸: {size}")
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size=size,
                    quality=kwargs.get("quality", "standard"),
                    n=1
                )
            )
            
            image_url = response.data[0].url
            logger.info(f"图片生成成功，URL: {image_url}")
            
            return image_url
            
        except Exception as e:
            logger.error(f"图片生成异常: {e}")
            raise ProviderError(f"图片生成失败: {str(e)}")
    
    async def invoke_video_generate(
        self, 
        prompt: str, 
        **kwargs
    ) -> str:
        """视频生成"""
        # OpenAI 目前不支持视频生成
        raise ProviderNotSupportedError("视频生成", "openai")
    
    async def invoke_text_generate(
        self, 
        prompt: str, 
        **kwargs
    ) -> str:
        """文本生成"""
        try:
            client = self.get_openai_client()
            
            # 构建请求参数
            request_params = {
                "model": kwargs.get("model", "gpt-3.5-turbo"),
                "messages": [{"role": "user", "content": prompt}],
                "temperature": kwargs.get("temperature", 0.7),
                "max_tokens": kwargs.get("max_tokens", 2000),
            }
            
            # 添加其他可选参数
            if "top_p" in kwargs:
                request_params["top_p"] = kwargs["top_p"]
            if "frequency_penalty" in kwargs:
                request_params["frequency_penalty"] = kwargs["frequency_penalty"]
            if "presence_penalty" in kwargs:
                request_params["presence_penalty"] = kwargs["presence_penalty"]
            
            logger.info(f"开始文本生成，模型: {request_params['model']}")
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.chat.completions.create(**request_params)
            )
            
            result = response.choices[0].message.content
            logger.info(f"文本生成成功，长度: {len(result)}")
            
            return result
            
        except Exception as e:
            logger.error(f"文本生成异常: {e}")
            raise ProviderError(f"文本生成失败: {str(e)}")
    
    async def invoke_chain(
        self, 
        prompt: ChatPromptTemplate, 
        inputs: Dict[str, Any],
        parser: Optional[BaseOutputParser] = None,
        **kwargs
    ) -> Any:
        """LangChain 链式调用"""
        try:
            client = self.get_langchain_client(**kwargs)
            
            # 构建调用链
            chain = prompt
            if parser:
                chain = chain | client | parser
            else:
                chain = chain | client
            
            logger.info(f"开始链式调用，输入: {inputs}")
            
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: chain.invoke(inputs)
            )
            
            logger.info(f"链式调用成功，结果类型: {type(result)}")
            
            return result
            
        except Exception as e:
            logger.error(f"链式调用异常: {e}")
            raise ProviderError(f"链式调用失败: {str(e)}")
    
    async def invoke_tts(
        self, 
        text: str, 
        voice: Optional[str] = None,
        language: Optional[str] = None,
        **kwargs
    ) -> str:
        """语音合成"""
        # OpenAI TTS 需要 tts-1 或 tts-1-hd 模型
        try:
            client = self.get_openai_client()
            
            # OpenAI 支持的语音: alloy, echo, fable, onyx, nova, shimmer
            default_voice = voice or "alloy"
            
            logger.info(f"开始语音合成，文本长度: {len(text)}, 语音: {default_voice}")
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.audio.speech.create(
                    model="tts-1",
                    voice=default_voice,
                    input=text
                )
            )
            
            # OpenAI TTS 返回音频数据，需要上传到存储
            # 这里返回音频数据，调用方需要处理上传
            logger.info("语音合成成功，返回音频数据")
            
            # 注意：这里返回的是音频二进制数据，不是 URL
            # 实际使用时需要上传到 OSS 或其他存储服务
            return response.content
            
        except Exception as e:
            logger.error(f"语音合成异常: {e}")
            raise ProviderError(f"语音合成失败: {str(e)}")
    
    async def invoke_asr(
        self, 
        audio_data: bytes, 
        **kwargs
    ) -> str:
        """语音识别"""
        # OpenAI Whisper 需要 audio 文件
        try:
            import tempfile
            import os
            
            client = self.get_openai_client()
            
            # 将音频数据保存到临时文件
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                logger.info(f"开始语音识别，音频大小: {len(audio_data)} bytes")
                
                with open(temp_file_path, "rb") as audio_file:
                    transcript = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: client.audio.transcriptions.create(
                            model="whisper-1",
                            file=audio_file,
                            language=kwargs.get("language")
                        )
                    )
                
                result = transcript.text
                logger.info(f"语音识别成功，识别文本: {result}")
                
                return result
                
            finally:
                # 清理临时文件
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
            
        except Exception as e:
            logger.error(f"语音识别异常: {e}")
            raise ProviderError(f"语音识别失败: {str(e)}")
