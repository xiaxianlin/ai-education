"""资源生成 Worker（图片和语音）"""
from typing import Dict, Any
from loguru import logger

from services.image_service import ImageService
from services.audio_service import AudioService


class ResourceWorker:
    """资源生成 Worker"""
    
    async def generate_image(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        生成图片
        
        Args:
            payload: 包含以下字段：
                - text: 问题内容或图片生成提示词
                - width: 图片宽度（可选，默认 1328）
                - height: 图片高度（可选，默认 1328）
                - optimize_prompt: 是否优化提示词（可选，默认 True）
                
        Returns:
            Dict: 包含 image_url 的字典
        """
        logger.info(f"开始生成图片: text_length={len(payload.get('text', ''))}")
        
        text = payload.get("text", "")
        width = payload.get("width", 1328)
        height = payload.get("height", 1328)
        optimize_prompt = payload.get("optimize_prompt", True)
        
        if not text:
            raise ValueError("text 字段不能为空")
        
        image_url = ImageService.generate_image(
            text=text,
            width=width,
            height=height,
            optimize_prompt=optimize_prompt,
        )
        
        logger.info(f"图片生成完成: image_url={image_url}")
        
        return {
            "image_url": image_url,
            "width": width,
            "height": height,
        }
    
    async def generate_audio(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        生成语音
        
        Args:
            payload: 包含以下字段：
                - text: 要转换为语音的文本
                - voice: 语音角色（可选，默认 Cherry）
                - language: 语言（可选，默认 Chinese）
                
        Returns:
            Dict: 包含 audio_url 的字典
        """
        logger.info(f"开始生成语音: text_length={len(payload.get('text', ''))}")
        
        text = payload.get("text", "")
        voice = payload.get("voice", "Cherry")
        language = payload.get("language", "Chinese")
        
        if not text:
            raise ValueError("text 字段不能为空")
        
        audio_url = AudioService.generate_audio(
            text=text,
            voice=voice,
            language=language,
        )
        
        logger.info(f"语音生成完成: audio_url={audio_url}")
        
        return {
            "audio_url": audio_url,
            "voice": voice,
            "language": language,
        }

