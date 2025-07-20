import dashscope
from typing import List, Dict
from ..interfaces import ASRProvider


class AliASRProvider(ASRProvider):
    """?Ì‘íóÆ+›”F"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        dashscope.api_key = self.config['api_key']
        self.model_name = self.config.get('model_name', 'paraformer-realtime-v1')
    
    def get_required_config_keys(self) -> List[str]:
        return ['api_key']
    
    async def call(self, **kwargs):
        """((¥ã"""
        return await self.transcribe(kwargs.get('audio_data'), **kwargs)
    
    async def transcribe(self, audio_data: bytes, **kwargs) -> str:
        """íól‡W"""
        try:
            # (dashscope„íóÆ+Ÿý
            recognition = dashscope.audio.asr.Recognition()
            result = recognition.call(
                model=self.model_name,
                format='wav',  # /wav, mp3, m4aI<
                audio=audio_data,
                **kwargs
            )
            
            if result.status_code == 200:
                # ÔÞÆ+Óœ‡,
                if result.output and 'sentence' in result.output:
                    return result.output['sentence']
                else:
                    return ""
            else:
                raise Exception(f"ASR(1%: {result.message}")
                
        except Exception as e:
            raise Exception(f"?Ì‘ASR(1%: {str(e)}")
