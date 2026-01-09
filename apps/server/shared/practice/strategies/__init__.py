"""练习策略模块

自动导入并注册所有策略实现。

练习类型：
- ability_practice: 能力练习 - 基于原子能力 code 列表生成
- unit_practice: 单元练习 - 基于单元 ID 生成
- daily_practice: 日常练习（兼容旧版）
- assess_practice: 综合评估（兼容旧版）
"""

from .base import BasePracticeStrategy
from .registry import STRATEGY_REGISTRY, get_strategy, list_strategies, register_strategy

# 导入所有策略实现以触发自动注册
from .ability import AbilityPracticeStrategy
from .unit import UnitPracticeStrategy
from .daily import DailyPracticeStrategy
from .assess import AssessPracticeStrategy

__all__ = [
    "BasePracticeStrategy",
    "STRATEGY_REGISTRY",
    "get_strategy",
    "list_strategies",
    "register_strategy",
    "AbilityPracticeStrategy",
    "UnitPracticeStrategy",
    "DailyPracticeStrategy",
    "AssessPracticeStrategy",
]
