from typing import List, Dict
from ..interfaces import ASRProvider


class DoubaoASRProvider(ASRProvider):
    """豆包/火山引擎 ASR供应商 (暂不可用)"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        raise NotImplementedError("豆包ASR功能暂不可用，请使用阿里云ASR")
    
    def get_required_config_keys(self) -> List[str]:
        return []
    
    async def call(self, **kwargs):
        """通用调用接口"""
        _ = kwargs  # 忽略未使用参数
        raise NotImplementedError("豆包ASR功能暂不可用")
    
    async def transcribe(self, audio_data: bytes, **kwargs) -> str:
        """语音转文字"""
        _ = audio_data, kwargs  # 忽略未使用参数
        raise NotImplementedError("豆包ASR功能暂不可用")