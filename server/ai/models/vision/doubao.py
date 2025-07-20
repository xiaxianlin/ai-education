import base64
from typing import List, Dict
from volcenginesdkarkruntime import Ark
from ..interfaces import VisionProvider


class DoubaoVisionProvider(VisionProvider):
    """豆包/火山引擎 Vision供应商"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        
        # 根据官方DEMO，初始化Ark客户端
        self.client = Ark(
            api_key=config.get('api_key')
        )
        
        # 多模态模型的Model ID
        self.model_name = config.get('model_name')
        if not self.model_name:
            raise ValueError("model_name is required for Doubao Vision")
    
    def get_required_config_keys(self) -> List[str]:
        return ['api_key', 'model_name']
    
    async def call(self, **kwargs):
        """通用调用接口"""
        if 'image_data' in kwargs and 'prompt' in kwargs:
            return await self.analyze_image(kwargs['image_data'], kwargs['prompt'], **kwargs)
        elif 'image_data' in kwargs:
            return await self.ocr(kwargs['image_data'], **kwargs)
        else:
            raise ValueError("缺少必要的参数")
    
    async def analyze_image(self, image_data: bytes, prompt: str, **kwargs) -> str:
        """图像分析"""
        try:
            # 将图像数据转为base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # 构建多模态消息
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
            
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                **kwargs
            )
            
            if completion.choices and len(completion.choices) > 0:
                return completion.choices[0].message.content
            else:
                raise Exception("豆包Vision返回结果为空")
                
        except Exception as e:
            raise Exception(f"豆包Vision调用失败: {str(e)}")
    
    async def ocr(self, image_data: bytes, **kwargs) -> str:
        """光学字符识别"""
        try:
            return await self.analyze_image(
                image_data,
                "请识别这张图片中的所有文字内容，返回原始文字即可。",
                **kwargs
            )
        except Exception as e:
            raise Exception(f"豆包OCR调用失败: {str(e)}")