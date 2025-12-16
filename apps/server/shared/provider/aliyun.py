"""
阿里云 DashScope Provider 实现
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


class AliyunProvider(BaseProvider):
    """阿里云 DashScope Provider 实现"""
    
    def __init__(self, api_key: str, base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"):
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
        default_params = {
            "model_name": kwargs.get("model_name", "qwen3-max"),
            "temperature": kwargs.get("temperature", 0.7),
            "api_key": self.api_key,
            "base_url": self.base_url
        }
        return ChatOpenAI(**default_params)
    
    def get_provider_client(self) -> Optional[Any]:
        """返回阿里云 DashScope SDK 实例"""
        try:
            from dashscope import MultiModalConversation
            return MultiModalConversation
        except ImportError:
            logger.warning("DashScope SDK 未安装")
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
            from dashscope import MultiModalConversation
            
            size_param = None
            if width and height:
                size_param = f"{width}*{height}"
            
            logger.info(f"开始生成图片，提示词长度: {len(prompt)}, 尺寸: {size_param}")
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: MultiModalConversation.call(
                    api_key=self.api_key,
                    model=kwargs.get("model", "qwen-image-plus"),
                    messages=[{"role": "user", "content": [{"text": prompt}]}],
                    result_format="message",
                    prompt_extend=kwargs.get("prompt_extend", True),
                    negative_prompt=kwargs.get("negative_prompt", ""),
                    stream=False,
                    size=size_param,
                )
            )
            
            if response.status_code != 200:
                logger.error(f"图片生成失败: {response.message}")
                raise ProviderError(f"图片生成失败: {response.message}")
            
            image_url = response.output.choices[0].message.content[0].get("image")
            logger.info(f"图片生成成功: {image_url}")
            return image_url
            
        except ImportError:
            raise ProviderNotSupportedError("图片生成", "aliyun")
        except Exception as e:
            logger.error(f"图片生成异常: {e}")
            raise ProviderError(f"图片生成失败: {str(e)}")
    
    async def invoke_video_generate(self, prompt: str, **kwargs) -> str:
        """视频生成 - 暂不支持"""
        raise ProviderNotSupportedError("视频生成", "aliyun")
    
    async def invoke_text_generate(self, prompt: str, **kwargs) -> str:
        """文本生成"""
        try:
            client = self.get_openai_client()
            
            request_params = {
                "model": kwargs.get("model", "qwen3-max"),
                "messages": [{"role": "user", "content": prompt}],
                "temperature": kwargs.get("temperature", 0.7),
                "max_tokens": kwargs.get("max_tokens", 2000),
            }
            
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
            
            if parser:
                chain = prompt | client | parser
            else:
                chain = prompt | client
            
            logger.info(f"开始链式调用，输入: {list(inputs.keys())}")
            
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: chain.invoke(inputs)
            )
            
            logger.info(f"链式调用成功")
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
        try:
            from dashscope import MultiModalConversation
            
            default_voice = voice or "Cherry"
            default_language = language or "Chinese"
            
            logger.info(f"开始语音合成，文本长度: {len(text)}, 语音: {default_voice}")
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: MultiModalConversation.call(
                    api_key=self.api_key,
                    model=kwargs.get("model", "qwen3-tts-flash"),
                    text=text,
                    voice=default_voice,
                    language_type=default_language,
                    stream=False,
                )
            )
            
            if response.status_code != 200:
                logger.error(f"语音合成失败: {response.message}")
                raise ProviderError(f"语音合成失败: {response.message}")
            
            audio_url = response.output.audio.url
            logger.info(f"语音合成成功: {audio_url}")
            return audio_url
            
        except ImportError:
            raise ProviderNotSupportedError("语音合成", "aliyun")
        except Exception as e:
            logger.error(f"语音合成异常: {e}")
            raise ProviderError(f"语音合成失败: {str(e)}")
    
    async def invoke_asr(self, audio_url: str, **kwargs) -> str:
        """语音识别"""
        try:
            from dashscope import MultiModalConversation
            
            system_prompt = kwargs.get(
                "prompt", "请准确转写音频中的内容，直接返回文本，不要添加任何解释。"
            )
            
            logger.info(f"开始语音识别，音频: {audio_url}")
            
            messages = [
                {"role": "system", "content": [{"text": system_prompt}]},
                {"role": "user", "content": [{"audio": audio_url}, {"text": "请转写音频内容。"}]},
            ]
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: MultiModalConversation.call(
                    api_key=self.api_key,
                    model=kwargs.get("model", "qwen3-omni-flash"),
                    messages=messages,
                    result_format="message",
                )
            )
            
            if response.status_code != 200:
                logger.error(f"语音识别失败: {response.message}")
                raise ProviderError(f"语音识别失败: {response.message}")
            
            content = response.output.choices[0].message.content
            if isinstance(content, list) and len(content) > 0:
                result_text = content[0].get("text", "")
            elif isinstance(content, str):
                result_text = content
            else:
                result_text = str(content)
            
            logger.info(f"语音识别成功，长度: {len(result_text)}")
            return result_text.strip()
            
        except ImportError:
            raise ProviderNotSupportedError("语音识别", "aliyun")
        except Exception as e:
            logger.error(f"语音识别异常: {e}")
            raise ProviderError(f"语音识别失败: {str(e)}")
