"""练习策略模块

自动导入并注册所有策略实现。
"""

from .base import BasePracticeStrategy
from .registry import STRATEGY_REGISTRY, get_strategy, list_strategies, register_strategy

# 导入所有策略实现以触发自动注册
from .daily import DailyPracticeStrategy
from .unit import UnitPracticeStrategy
from .assess import AssessPracticeStrategy

__all__ = [
    "BasePracticeStrategy",
    "STRATEGY_REGISTRY",
    "get_strategy",
    "list_strategies",
    "register_strategy",
    "DailyPracticeStrategy",
    "UnitPracticeStrategy",
    "AssessPracticeStrategy",
]
