from typing import List, Dict, AsyncGenerator
from volcenginesdkarkruntime import Ark
from ..interfaces import LLMProvider


class DoubaoLLMProvider(LLMProvider):
    """豆包/火山引擎 LLM供应商"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        
        # 根据官方DEMO，初始化Ark客户端
        self.client = Ark(
            api_key=config.get('api_key')
        )
        
        # model_name 就是Model ID
        self.model_name = config.get('model_name')
        if not self.model_name:
            raise ValueError("model_name is required for Doubao LLM")
    
    def get_required_config_keys(self) -> List[str]:
        return ['api_key', 'model_name']
    
    async def call(self, **kwargs):
        """通用调用接口"""
        return await self.chat(kwargs.get('messages', []))
    
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """聊天对话"""
        try:
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                **kwargs
            )
            
            if completion.choices and len(completion.choices) > 0:
                return completion.choices[0].message.content
            else:
                raise Exception("豆包API返回结果为空")
                
        except Exception as e:
            raise Exception(f"豆包LLM调用失败: {str(e)}")
    
    async def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        """流式聊天对话"""
        try:
            stream = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                stream=True,
                **kwargs
            )
            
            for chunk in stream:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        yield delta.content
                        
        except Exception as e:
            raise Exception(f"豆包LLM流式调用失败: {str(e)}")