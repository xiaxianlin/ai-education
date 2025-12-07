"""AI 服务客户端 - 与 server-ai 通信"""
import httpx
import asyncio
from typing import Dict, Any, Optional
from loguru import logger
from core.settings import envs


class AIServiceClient:
    """AI 服务客户端
    
    注意：由于 RQ Worker 是同步的，这个客户端提供了同步和异步两种调用方式。
    在 Worker 中使用同步方法，在异步环境中使用异步方法。
    """
    
    def __init__(self):
        self.base_url = envs.AI_SERVICE_URL  # http://server-ai:7892
        self.timeout = 120.0  # AI 调用可能需要较长时间
    
    def _create_client(self) -> httpx.Client:
        """创建同步 HTTP 客户端"""
        return httpx.Client(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={"Content-Type": "application/json"}
        )
    
    def _create_async_client(self) -> httpx.AsyncClient:
        """创建异步 HTTP 客户端"""
        return httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={"Content-Type": "application/json"}
        )
    
    def generate_text(
        self,
        prompt: str,
        model: str = "qwen3-max",
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        """生成文本（同步）"""
        try:
            with self._create_client() as client:
                response = client.post(
                    "/api/v1/llm/generate",
                    json={
                        "prompt": prompt,
                        "model": model,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["content"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"LLM 文本生成失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"LLM 文本生成失败: {e.response.text}")
        except Exception as e:
            logger.error(f"LLM 文本生成异常: {e}")
            raise
    
    async def generate_text_async(
        self,
        prompt: str,
        model: str = "qwen3-max",
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        """生成文本（异步）"""
        try:
            async with self._create_async_client() as client:
                response = await client.post(
                    "/api/v1/llm/generate",
                    json={
                        "prompt": prompt,
                        "model": model,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["content"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"LLM 文本生成失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"LLM 文本生成失败: {e.response.text}")
        except Exception as e:
            logger.error(f"LLM 文本生成异常: {e}")
            raise
    
    async def generate_image_async(
        self,
        text: str,
        width: int = 1328,
        height: int = 1328,
        optimize_prompt: bool = True,
    ) -> str:
        """生成图片（异步）"""
        try:
            async with self._create_async_client() as client:
                response = await client.post(
                    "/api/v1/image/generate",
                    json={
                        "text": text,
                        "width": width,
                        "height": height,
                        "optimize_prompt": optimize_prompt,
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["image_url"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"图片生成失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"图片生成失败: {e.response.text}")
        except Exception as e:
            logger.error(f"图片生成异常: {e}")
            raise
    
    async def generate_audio_async(
        self,
        text: str,
        voice: str = "Cherry",
        language: str = "Chinese",
    ) -> str:
        """生成语音（异步）"""
        try:
            async with self._create_async_client() as client:
                response = await client.post(
                    "/api/v1/audio/tts",
                    json={
                        "text": text,
                        "voice": voice,
                        "language": language,
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["audio_url"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"语音生成失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"语音生成失败: {e.response.text}")
        except Exception as e:
            logger.error(f"语音生成异常: {e}")
            raise
    
    async def analyze_answer_async(
        self,
        content: str,
        options: str,
        knowledge: str,
        question_answer: str,
        student_answer: str,
        model_name: str = "qwen3-max-preview",
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """分析答题情况（异步）"""
        try:
            async with self._create_async_client() as client:
                response = await client.post(
                    "/api/v1/analysis/answer",
                    json={
                        "content": content,
                        "options": options,
                        "knowledge": knowledge,
                        "question_answer": question_answer,
                        "student_answer": student_answer,
                        "model_name": model_name,
                        "temperature": temperature,
                    }
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                f"答题分析失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"答题分析失败: {e.response.text}")
        except Exception as e:
            logger.error(f"答题分析异常: {e}")
            raise
    
    def generate_structured(
        self,
        prompt: str,
        schema: Dict[str, Any],
        model: str = "qwen3-max",
    ) -> Dict[str, Any]:
        """结构化输出（同步）"""
        try:
            with self._create_client() as client:
                response = client.post(
                    "/api/v1/llm/generate/structured",
                    json={
                        "prompt": prompt,
                        "schema": schema,
                        "model": model,
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["result"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"LLM 结构化输出失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"LLM 结构化输出失败: {e.response.text}")
        except Exception as e:
            logger.error(f"LLM 结构化输出异常: {e}")
            raise
    
    async def generate_structured_async(
        self,
        prompt: str,
        schema: Dict[str, Any],
        model: str = "qwen3-max",
    ) -> Dict[str, Any]:
        """结构化输出（异步）"""
        try:
            async with self._create_async_client() as client:
                response = await client.post(
                    "/api/v1/llm/generate/structured",
                    json={
                        "prompt": prompt,
                        "schema": schema,
                        "model": model,
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["result"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"LLM 结构化输出失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"LLM 结构化输出失败: {e.response.text}")
        except Exception as e:
            logger.error(f"LLM 结构化输出异常: {e}")
            raise
    
    def generate_image(
        self,
        text: str,
        width: int = 1328,
        height: int = 1328,
        optimize_prompt: bool = True,
    ) -> str:
        """生成图片（同步）"""
        try:
            with self._create_client() as client:
                response = client.post(
                    "/api/v1/image/generate",
                    json={
                        "text": text,
                        "width": width,
                        "height": height,
                        "optimize_prompt": optimize_prompt,
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["image_url"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"图片生成失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"图片生成失败: {e.response.text}")
        except Exception as e:
            logger.error(f"图片生成异常: {e}")
            raise
    
    def generate_audio(
        self,
        text: str,
        voice: str = "Cherry",
        language: str = "Chinese",
    ) -> str:
        """生成语音（同步）"""
        try:
            with self._create_client() as client:
                response = client.post(
                    "/api/v1/audio/tts",
                    json={
                        "text": text,
                        "voice": voice,
                        "language": language,
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["audio_url"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"语音生成失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"语音生成失败: {e.response.text}")
        except Exception as e:
            logger.error(f"语音生成异常: {e}")
            raise
    
    def analyze_answer(
        self,
        content: str,
        options: str,
        knowledge: str,
        question_answer: str,
        student_answer: str,
        model_name: str = "qwen3-max-preview",
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """分析答题情况（同步）"""
        try:
            with self._create_client() as client:
                response = client.post(
                    "/api/v1/analysis/answer",
                    json={
                        "content": content,
                        "options": options,
                        "knowledge": knowledge,
                        "question_answer": question_answer,
                        "student_answer": student_answer,
                        "model_name": model_name,
                        "temperature": temperature,
                    }
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                f"答题分析失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"答题分析失败: {e.response.text}")
        except Exception as e:
            logger.error(f"答题分析异常: {e}")
            raise

