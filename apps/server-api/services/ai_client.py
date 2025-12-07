"""AI 服务客户端 - 与 server-ai 通信（同步调用）"""
import httpx
from typing import Dict, Any
from loguru import logger
from core.settings import envs


class AIServiceClient:
    """AI 服务客户端"""
    
    def __init__(self):
        self.base_url = envs.AI_SERVICE_URL  # http://server-ai:7892
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=60.0,
            headers={"Content-Type": "application/json"}
        )
    
    async def analyze_answer(
        self,
        content: str,
        options: str,
        knowledge: str,
        question_answer: str,
        student_answer: str,
    ) -> Dict[str, Any]:
        """分析答题情况"""
        try:
            response = await self.client.post(
                "/api/v1/analysis/answer",
                json={
                    "content": content,
                    "options": options,
                    "knowledge": knowledge,
                    "question_answer": question_answer,
                    "student_answer": student_answer,
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"答题分析失败: {e}")
            raise
    
    async def generate_image(
        self,
        text: str,
        width: int = 1328,
        height: int = 1328,
        optimize_prompt: bool = True,
    ) -> str:
        """生成图片"""
        try:
            response = await self.client.post(
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
            return result.get("image_url")
        except Exception as e:
            logger.error(f"图片生成失败: {e}")
            raise
    
    async def generate_question_image(self, question_id: int) -> Dict[str, Any]:
        """为指定题目生成图片"""
        try:
            response = await self.client.post(
                f"/api/v1/image/generate/question/{question_id}"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"题目图片生成失败: question_id={question_id}, error={e}")
            raise
    
    async def generate_audio(
        self,
        text: str,
        voice: str = "Cherry",
        language: str = "Chinese",
    ) -> str:
        """生成语音"""
        try:
            response = await self.client.post(
                "/api/v1/audio/tts",
                json={
                    "text": text,
                    "voice": voice,
                    "language": language,
                }
            )
            response.raise_for_status()
            result = response.json()
            return result.get("audio_url")
        except Exception as e:
            logger.error(f"语音生成失败: {e}")
            raise
    
    async def generate_question_audio(self, question_id: int) -> Dict[str, Any]:
        """为指定题目生成语音"""
        try:
            response = await self.client.post(
                f"/api/v1/audio/tts/question/{question_id}"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"题目语音生成失败: question_id={question_id}, error={e}")
            raise
    
    async def close(self):
        """关闭客户端"""
        await self.client.aclose()

