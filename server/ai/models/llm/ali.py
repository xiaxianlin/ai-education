import dashscope
from typing import List, Dict, AsyncGenerator
from ..interfaces import LLMProvider


class AliLLMProvider(LLMProvider):
    """?Ì‘ICîLLM›”F"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        dashscope.api_key = self.config['api_key']
        self.model_name = self.config.get('model_name', 'qwen-turbo')
    
    def get_required_config_keys(self) -> List[str]:
        return ['api_key']
    
    async def call(self, **kwargs):
        """((¥ã"""
        return await self.chat(kwargs.get('messages', []))
    
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """J)ùÝ"""
        try:
            response = dashscope.Generation.call(
                model=self.model_name,
                messages=messages,
                result_format='message',
                **kwargs
            )
            
            if response.status_code == 200:
                return response.output.choices[0].message.content
            else:
                raise Exception(f"API(1%: {response.message}")
                
        except Exception as e:
            raise Exception(f"?Ì‘LLM(1%: {str(e)}")
    
    async def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        """AJ)ùÝ"""
        try:
            responses = dashscope.Generation.call(
                model=self.model_name,
                messages=messages,
                result_format='message',
                stream=True,
                **kwargs
            )
            
            for response in responses:
                if response.status_code == 200:
                    if response.output.choices[0].message.content:
                        yield response.output.choices[0].message.content
                else:
                    raise Exception(f"A(1%: {response.message}")
                    
        except Exception as e:
            raise Exception(f"?Ì‘LLMA(1%: {str(e)}")
