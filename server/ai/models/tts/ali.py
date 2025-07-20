import dashscope
from typing import List, Dict
from ..interfaces import TTSProvider


class AliTTSProvider(TTSProvider):
    """?Ì‘íó›”F"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        dashscope.api_key = self.config['api_key']
        self.model_name = self.config.get('model_name', 'sambert-zhichu-v1')
    
    def get_required_config_keys(self) -> List[str]:
        return ['api_key']
    
    async def call(self, **kwargs):
        """((¥ã"""
        return await self.synthesize(kwargs.get('text', ''), **kwargs)
    
    async def synthesize(self, text: str, **kwargs) -> bytes:
        """‡Wlíó"""
        try:
            synthesizer = dashscope.audio.tts.SpeechSynthesizer()
            result = synthesizer.call(
                model=self.model_name,
                text=text,
                format='wav',  # “ú<
                voice=kwargs.get('voice', 'zhichu'),  # ðó{‹
                **kwargs
            )
            
            if result.status_code == 200:
                # ÔÞó‘pn
                return result.get_audio_data()
            else:
                raise Exception(f"TTS(1%: {result.message}")
                
        except Exception as e:
            raise Exception(f"?Ì‘TTS(1%: {str(e)}")
