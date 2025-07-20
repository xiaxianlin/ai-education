import importlib
from typing import Dict, Any, Optional
from core.settings import settings
from .interfaces import LLMProvider, ASRProvider, TTSProvider, VisionProvider, MultiModalProvider


class ModelFactory:
    """AI模型工厂类，用于根据配置创建对应的模型供应商实例"""
    
    # 供应商映射表
    _providers = {
        'ali': {
            'llm': 'ai.models.llm.ali.AliLLMProvider',
            'asr': 'ai.models.asr.ali.AliASRProvider', 
            'tts': 'ai.models.tts.ali.AliTTSProvider',
            'vision': 'ai.models.vision.ali.AliVisionProvider',
            'multi': 'ai.models.multi.ali.AliMultiProvider',
        },
        'doubao': {
            'llm': 'ai.models.llm.doubao.DoubaoLLMProvider',
            'asr': 'ai.models.asr.doubao.DoubaoASRProvider',
            'tts': 'ai.models.tts.doubao.DoubaoTTSProvider', 
            'vision': 'ai.models.vision.doubao.DoubaoVisionProvider',
            'multi': 'ai.models.multi.doubao.DoubaoMultiProvider',
        }
    }
    
    # 模型类型到配置的映射
    _model_config_mapping = {
        'llm': {
            'current_model_key': 'LLM_MODEL',
            'providers': {
                'ali': {
                    'base_url': 'ALIYUN_AI_BASE_URL',
                    'api_key': 'ALIYUN_AI_KEY', 
                    'model_name': 'ALIYUN_LLM_MODEL'
                },
                'doubao': {
                    'base_url': 'DOUBAO_AI_BASE_URL',
                    'api_key': 'DOUBAO_AI_KEY',
                    'model_name': 'DOUBAO_LLM_MODEL'
                }
            }
        },
        'asr': {
            'current_model_key': 'ASR_MODEL',
            'providers': {
                'ali': {
                    'base_url': 'ALIYUN_AI_BASE_URL',
                    'api_key': 'ALIYUN_AI_KEY',
                    'model_name': 'ALIYUN_ASR_MODEL'
                },
                'doubao': {
                    'base_url': 'DOUBAO_AI_BASE_URL',
                    'access_key': 'DOUBAO_ACCESS_KEY',
                    'secret_key': 'DOUBAO_SECRET_KEY',
                    'app_id': 'DOUBAO_APP_ID'
                }
            }
        },
        'tts': {
            'current_model_key': 'TTS_MODEL',
            'providers': {
                'ali': {
                    'base_url': 'ALIYUN_AI_BASE_URL',
                    'api_key': 'ALIYUN_AI_KEY',
                    'model_name': 'ALIYUN_TTS_MODEL'
                },
                'doubao': {
                    'base_url': 'DOUBAO_AI_BASE_URL',
                    'access_key': 'DOUBAO_ACCESS_KEY',
                    'secret_key': 'DOUBAO_SECRET_KEY',
                    'app_id': 'DOUBAO_APP_ID'
                }
            }
        },
        'vision': {
            'current_model_key': 'VISION_MODEL',
            'providers': {
                'ali': {
                    'base_url': 'ALIYUN_AI_BASE_URL',
                    'api_key': 'ALIYUN_AI_KEY',
                    'model_name': 'ALIYUN_VISION_MODEL'
                },
                'doubao': {
                    'base_url': 'DOUBAO_AI_BASE_URL',
                    'api_key': 'DOUBAO_AI_KEY',
                    'model_name': 'DOUBAO_VISION_MODEL'  
                }
            }
        },
        'multi': {
            'current_model_key': 'MULTI_MODEL',
            'providers': {
                'ali': {
                    'base_url': 'ALIYUN_AI_BASE_URL',
                    'api_key': 'ALIYUN_AI_KEY',
                    'model_name': 'ALIYUN_MULTI_MODEL'
                },
                'doubao': {
                    'base_url': 'DOUBAO_AI_BASE_URL',
                    'api_key': 'DOUBAO_AI_KEY',
                    'model_name': 'DOUBAO_MULTI_MODEL'
                }
            }
        }
    }
    
    @classmethod
    def get_provider(cls, model_type: str, provider_name: Optional[str] = None):
        """
        根据模型类型获取对应的供应商实例
        
        Args:
            model_type: 模型类型 (llm, asr, tts, vision, multi)
            provider_name: 指定供应商名称，不指定则从配置读取
            
        Returns:
            对应的供应商实例
        """
        if model_type not in cls._model_config_mapping:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        # 如果没有指定供应商，从配置读取当前使用的供应商
        if provider_name is None:
            current_model_key = cls._model_config_mapping[model_type]['current_model_key']
            provider_name = getattr(settings, current_model_key, None)
            if not provider_name:
                raise ValueError(f"No provider configured for model type: {model_type}")
        
        # 获取供应商配置
        provider_config = cls._get_provider_config(model_type, provider_name)
        
        # 创建供应商实例
        return cls._create_provider(model_type, provider_name, provider_config)
    
    @classmethod
    def _get_provider_config(cls, model_type: str, provider_name: str) -> Dict[str, Any]:
        """获取供应商配置"""
        model_config = cls._model_config_mapping[model_type]
        
        if provider_name not in model_config['providers']:
            raise ValueError(f"Unsupported provider '{provider_name}' for model type '{model_type}'")
        
        provider_mapping = model_config['providers'][provider_name]
        config = {}
        
        for config_key, settings_key in provider_mapping.items():
            value = getattr(settings, settings_key, None)
            if value:
                config[config_key] = value
        
        return config
    
    @classmethod
    def _create_provider(cls, model_type: str, provider_name: str, config: Dict[str, Any]):
        """创建供应商实例"""
        if provider_name not in cls._providers:
            raise ValueError(f"Unsupported provider: {provider_name}")
        
        if model_type not in cls._providers[provider_name]:
            raise ValueError(f"Provider '{provider_name}' does not support model type '{model_type}'")
        
        provider_class_path = cls._providers[provider_name][model_type]
        
        # 动态导入Provider类
        module_path, class_name = provider_class_path.rsplit('.', 1)
        try:
            module = importlib.import_module(module_path)
            provider_class = getattr(module, class_name)
            return provider_class(config)
        except (ImportError, AttributeError) as e:
            raise ImportError(f"Failed to import provider class '{provider_class_path}': {e}")
    
    @classmethod
    def get_llm_provider(cls, provider_name: Optional[str] = None) -> LLMProvider:
        """获取LLM供应商实例"""
        return cls.get_provider('llm', provider_name)
    
    @classmethod  
    def get_asr_provider(cls, provider_name: Optional[str] = None) -> ASRProvider:
        """获取ASR供应商实例"""
        return cls.get_provider('asr', provider_name)
    
    @classmethod
    def get_tts_provider(cls, provider_name: Optional[str] = None) -> TTSProvider:
        """获取TTS供应商实例"""
        return cls.get_provider('tts', provider_name)
    
    @classmethod
    def get_vision_provider(cls, provider_name: Optional[str] = None) -> VisionProvider:
        """获取Vision供应商实例"""
        return cls.get_provider('vision', provider_name)
    
    @classmethod
    def get_multi_provider(cls, provider_name: Optional[str] = None) -> MultiModalProvider:
        """获取MultiModal供应商实例"""
        return cls.get_provider('multi', provider_name)
    
    @classmethod
    def list_supported_providers(cls, model_type: Optional[str] = None) -> Dict[str, list]:
        """列出支持的供应商"""
        if model_type:
            if model_type not in cls._model_config_mapping:
                raise ValueError(f"Unsupported model type: {model_type}")
            return {model_type: list(cls._model_config_mapping[model_type]['providers'].keys())}
        
        result = {}
        for mt in cls._model_config_mapping:
            result[mt] = list(cls._model_config_mapping[mt]['providers'].keys())
        return result