import base64
import dashscope
from typing import List, Dict
from ..interfaces import VisionProvider


class AliVisionProvider(VisionProvider):
    """?Ì‘ÆÉ!‹›”F"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        dashscope.api_key = self.config['api_key']
        self.model_name = self.config.get('model_name', 'qwen-vl-plus')
    
    def get_required_config_keys(self) -> List[str]:
        return ['api_key']
    
    async def call(self, **kwargs):
        """((¥ã"""
        if 'image_data' in kwargs and 'prompt' in kwargs:
            return await self.analyze_image(kwargs['image_data'], kwargs['prompt'], **kwargs)
        elif 'image_data' in kwargs:
            return await self.ocr(kwargs['image_data'], **kwargs)
        else:
            raise ValueError(":Å„Âp")
    
    async def analyze_image(self, image_data: bytes, prompt: str, **kwargs) -> str:
        """şÏ"""
        try:
            # şÏpnl:base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"image": f"data:image/jpeg;base64,{image_base64}"},
                        {"text": prompt}
                    ]
                }
            ]
            
            response = dashscope.MultiModalConversation.call(
                model=self.model_name,
                messages=messages,
                **kwargs
            )
            
            if response.status_code == 200:
                return response.output.choices[0].message.content[0]['text']
            else:
                raise Exception(f"şÏ1%: {response.message}")
                
        except Exception as e:
            raise Exception(f"?Ì‘Vision(1%: {str(e)}")
    
    async def ocr(self, image_data: bytes, **kwargs) -> str:
        """IfW&Æ+"""
        try:
            # (şÏŸı°OCR
            return await self.analyze_image(
                image_data, 
                "÷Æ+Ù şG-„@	‡W…¹ÔŞŸË‡Wsï",
                **kwargs
            )
        except Exception as e:
            raise Exception(f"?Ì‘OCR(1%: {str(e)}")
