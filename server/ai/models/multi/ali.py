import dashscope
from typing import List, Dict, Any
from ..interfaces import MultiModalProvider


class AliMultiProvider(MultiModalProvider):
    """?Ì‘!›”F"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        dashscope.api_key = self.config['api_key']
        self.model_name = self.config.get('model_name', 'qwen-vl-plus')
    
    def get_required_config_keys(self) -> List[str]:
        return ['api_key']
    
    async def call(self, **kwargs):
        """((¥ã"""
        return await self.process(kwargs.get('inputs', []), **kwargs)
    
    async def process(self, inputs: List[Dict[str, Any]], **kwargs) -> str:
        """!"""
        try:
            # „ú!ˆo
            messages = []
            
            for input_item in inputs:
                role = input_item.get('role', 'user')
                content = input_item.get('content', [])
                
                message = {
                    "role": role,
                    "content": content
                }
                messages.append(message)
            
            response = dashscope.MultiModalConversation.call(
                model=self.model_name,
                messages=messages,
                **kwargs
            )
            
            if response.status_code == 200:
                return response.output.choices[0].message.content[0]['text']
            else:
                raise Exception(f"!1%: {response.message}")
                
        except Exception as e:
            raise Exception(f"?Ì‘MultiModal(1%: {str(e)}")
