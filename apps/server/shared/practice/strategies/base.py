"""练习生成策略基类

定义统一的练习生成策略接口，支持扩展和自动注册。
"""

from abc import ABC, abstractmethod
from typing import Any, Dict

from shared.generation.question.schema import QuestionGenerationState


class BasePracticeStrategy(ABC):
    """练习生成策略基类

    所有练习类型（日常练习、单元练习、综合评估等）都应继承此类并实现相应方法。
    """

    @classmethod
    @abstractmethod
    def get_slug(cls) -> str:
        """返回练习标识（如 'daily_practice'）

        用于策略注册和路由匹配。
        """
        raise NotImplementedError

    @abstractmethod
    async def load_context(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载练习所需的上下文数据

        Args:
            state: 包含 db, session, textbook, units 等基础信息

        Returns:
            额外的上下文数据，将合并到 state 中
        """
        pass

    @abstractmethod
    async def build_prompt(self, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建 Prompt

        Args:
            state: 包含完整上下文的状态对象

        Returns:
            包含 prompt, prompt_input, prompt_parser 的字典
        """
        pass

    async def validate_parameters(self, state: QuestionGenerationState) -> None:
        """验证练习参数（可选覆盖）

        Args:
            state: 状态对象

        Raises:
            ValueError: 参数验证失败时抛出
        """
        pass

    def get_difficulty_distribution(self, count: int) -> Dict[str, int]:
        """获取难度分布（可选覆盖）

        Args:
            count: 总题目数量

        Returns:
            难度分布字典，如 {"easy": 3, "medium": 5, "hard": 2}
        """
        easy = max(1, int(count * 0.3))
        medium = max(1, int(count * 0.5))
        hard = count - easy - medium
        return {"easy": easy, "medium": medium, "hard": hard}
