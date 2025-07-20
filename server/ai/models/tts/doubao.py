import base64
from typing import List, Dict
import aiohttp
from ..interfaces import TTSProvider


class DoubaoTTSProvider(TTSProvider):
    """豆包/火山引擎 TTS供应商"""
    
    def __init__(self, config: Dict):
        super().__init__(config)
        self.access_key = config.get('access_key')
        self.secret_key = config.get('secret_key')
        self.app_id = config.get('app_id')
        self.cluster = config.get('cluster', 'volcano_tts')
        self.base_url = config.get('base_url', 'https://openspeech.bytedance.com/api/v1/tts')
        
        if not all([self.access_key, self.secret_key, self.app_id]):
            raise ValueError("access_key, secret_key, and app_id are required for Doubao TTS")
    
    def get_required_config_keys(self) -> List[str]:
        return ['access_key', 'secret_key', 'app_id']
    
    async def call(self, **kwargs):
        """通用调用接口"""
        text = kwargs.get('text', '')
        if not text:
            raise ValueError("text is required")
        return await self.synthesize(text, **kwargs)
    
    async def synthesize(self, text: str, **kwargs) -> bytes:
        """文字转语音"""
        try:
            # 构建请求数据
            request_data = {
                "app": {
                    "appid": self.app_id,
                    "token": "access_token",  # 实际使用时需要获取token
                    "cluster": self.cluster
                },
                "user": {
                    "uid": kwargs.get('uid', 'default_user')
                },
                "audio": {
                    "voice_type": kwargs.get('voice_type', 'BV001_streaming'),
                    "encoding": kwargs.get('encoding', 'mp3'),
                    "speed_ratio": kwargs.get('speed_ratio', 1.0),
                    "volume_ratio": kwargs.get('volume_ratio', 1.0),
                    "pitch_ratio": kwargs.get('pitch_ratio', 1.0),
                    "language": kwargs.get('language', 'zh'),
                    "emotion": kwargs.get('emotion', 'happy')
                },
                "request": {
                    "reqid": kwargs.get('reqid', 'default_req_id'),
                    "text": text,
                    "text_type": kwargs.get('text_type', 'plain'),
                    "operation": kwargs.get('operation', 'query'),
                    "with_frontend": kwargs.get('with_frontend', 1),
                    "frontend_type": kwargs.get('frontend_type', 'unitTson')
                }
            }
            
            # 发送HTTP请求
            async with aiohttp.ClientSession() as session:
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {self._generate_token()}',  # 需要实现token生成
                }
                
                async with session.post(
                    self.base_url,
                    json=request_data,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return self._extract_audio_from_response(result)
                    else:
                        error_text = await response.text()
                        raise Exception(f"TTS API调用失败: {response.status} - {error_text}")
                        
        except Exception as e:
            raise Exception(f"豆包TTS调用失败: {str(e)}")
    
    def _generate_token(self) -> str:
        """生成访问token（简化实现）"""
        # 实际实现需要根据火山引擎的鉴权方式生成token
        # 这里返回一个占位符
        return "generated_token_placeholder"
    
    def _extract_audio_from_response(self, response: dict) -> bytes:
        """从响应中提取音频数据"""
        try:
            if 'data' in response:
                # 如果响应中包含base64编码的音频数据
                if isinstance(response['data'], str):
                    return base64.b64decode(response['data'])
                # 如果响应中包含音频URL，需要下载
                elif isinstance(response['data'], dict) and 'url' in response['data']:
                    # 这里需要额外的HTTP请求来下载音频
                    # 为简化，先返回空的音频数据
                    return b""
            
            # 如果直接返回了音频数据
            if 'audio' in response and 'data' in response['audio']:
                audio_base64 = response['audio']['data']
                return base64.b64decode(audio_base64)
            
            return b""
        except Exception:
            return b""