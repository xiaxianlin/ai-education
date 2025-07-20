from typing import List, Dict, Any
from volcenginesdkarkruntime import Ark
from ..interfaces import MultiModalProvider


class DoubaoMultiProvider(MultiModalProvider):
    """豆包/火山引擎多模态供应商"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        
        # 根据官方DEMO，初始化Ark客户端
        self.client = Ark(
            api_key=config.get('api_key')
        )
        
        # 多模态模型的Model ID
        self.model_name = config.get('model_name')
        if not self.model_name:
            raise ValueError("model_name is required for Doubao MultiModal")
    
    def get_required_config_keys(self) -> List[str]:
        return ['api_key', 'model_name']
    
    async def call(self, **kwargs):
        """通用调用接口"""
        return await self.process(kwargs.get('inputs', []), **kwargs)
    
    async def process(self, inputs: List[Dict[str, Any]], **kwargs) -> str:
        """多模态处理"""
        try:
            # inputs就是标准的messages格式
            messages = inputs
            
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                **kwargs
            )
            
            if completion.choices and len(completion.choices) > 0:
                return completion.choices[0].message.content
            else:
                raise Exception("豆包MultiModal返回结果为空")
                
        except Exception as e:
            raise Exception(f"豆包MultiModal调用失败: {str(e)}")