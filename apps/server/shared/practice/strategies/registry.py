"""练习策略注册器

提供装饰器和工具函数，支持策略的自动注册和获取。
"""

from typing import Dict, Type

from .base import BasePracticeStrategy

# 策略注册表
STRATEGY_REGISTRY: Dict[str, Type[BasePracticeStrategy]] = {}


def register_strategy(cls: Type[BasePracticeStrategy]) -> Type[BasePracticeStrategy]:
    """装饰器：自动注册练习策略

    使用方式：
        @register_strategy
        class DailyPracticeStrategy(BasePracticeStrategy):
            @classmethod
            def get_slug(cls) -> str:
                return "daily_practice"
    """
    slug = cls.get_slug()
    if slug in STRATEGY_REGISTRY:
        raise ValueError(f"策略 '{slug}' 已注册，请检查是否重复定义")
    STRATEGY_REGISTRY[slug] = cls
    return cls


def get_strategy(slug: str) -> BasePracticeStrategy:
    """根据练习标识获取策略实例

    Args:
        slug: 练习标识（如 'daily_practice'）

    Returns:
        对应的策略实例

    Raises:
        ValueError: 未找到对应策略时抛出
    """
    if slug not in STRATEGY_REGISTRY:
        available = ", ".join(STRATEGY_REGISTRY.keys()) or "无"
        raise ValueError(f"未知练习类型: '{slug}'，可用类型: {available}")
    return STRATEGY_REGISTRY[slug]()


def list_strategies() -> Dict[str, Type[BasePracticeStrategy]]:
    """列出所有已注册的策略

    Returns:
        策略注册表的副本
    """
    return dict(STRATEGY_REGISTRY)
