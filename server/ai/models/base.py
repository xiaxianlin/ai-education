from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseProvider(ABC):
    """AI模型供应商基类"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self._validate_config()
    
    def _validate_config(self):
        """验证配置参数"""
        required_keys = self.get_required_config_keys()
        for key in required_keys:
            if key not in self.config:
                raise ValueError(f"Missing required config key: {key}")
    
    @abstractmethod
    def get_required_config_keys(self) -> list[str]:
        """返回必需的配置键列表"""
        pass
    
    @abstractmethod
    async def call(self, **kwargs) -> Any:
        """通用调用接口"""
        pass