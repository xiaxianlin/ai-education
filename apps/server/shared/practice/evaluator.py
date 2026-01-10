"""答案评判器模块

根据 answer.type 选择不同的评判策略：
- exact: 精确匹配（选择题、判断题）
- fuzzy: 模糊匹配（填空题、简答题）
- rubric: 评分标准（主观题）
- ai: AI 评分（口语题、开放题）
- composite: 复合题（递归评判子题）
"""

from abc import ABC, abstractmethod
from typing import Any, Optional

from pydantic import BaseModel, Field
from shared.core.database import Question


class CorrectAnswerData(BaseModel):
    """结构化正确答案"""

    type: str = Field(..., description="与 interaction_type 对应")
    value: Optional[Any] = Field(default=None, description="单值答案")
    values: Optional[list] = Field(default=None, description="多值答案")
    options: Optional[list] = Field(default=None, description="选项详情（含文本）")
    sub_answers: Optional[list] = Field(default=None, description="复合题子答案")


class EvaluateResult(BaseModel):
    """评判结果"""

    is_correct: bool = Field(..., description="是否正确")
    score: float = Field(default=0, description="得分")
    full_score: float = Field(default=10, description="满分")
    correct_answer: CorrectAnswerData = Field(..., description="结构化正确答案")
    sub_results: Optional[list] = Field(default=None, description="子题评判结果（复合题）")


class BaseEvaluator(ABC):
    """评判器基类"""

    @abstractmethod
    def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        """评判答案

        Args:
            question: 题目对象
            user_answer: 用户答案

        Returns:
            EvaluateResult: 评判结果
        """
        pass

    def _get_scoring(self, question: Question) -> dict:
        """获取评分配置"""
        answer_config = question.answer or {}
        return answer_config.get("scoring", {})

    def _get_full_score(self, question: Question) -> float:
        """获取满分"""
        scoring = self._get_scoring(question)
        return scoring.get("full_score", 10)

    def _get_correct_answers(self, question: Question) -> list:
        """获取正确答案列表"""
        answer_config = question.answer or {}
        return answer_config.get("correct_answers", [])

    def _build_correct_answer_data(
        self, question: Question, correct_answers: list
    ) -> CorrectAnswerData:
        """构建结构化正确答案

        根据题目的 interaction_type 和 options 构建前端需要的结构化数据
        """
        answer_config = question.answer or {}
        interaction_type = getattr(question, "question_type_code", "unknown")

        # 尝试从题型配置获取交互类型
        # 如果没有，使用 answer.type 作为备选
        answer_type = answer_config.get("type", "exact")

        # 构建选项详情（如果有选项）
        options_detail = None
        if question.options and correct_answers:
            options_detail = []
            for opt in question.options:
                opt_id = opt.get("id", "")
                if str(opt_id) in [str(a) for a in correct_answers]:
                    options_detail.append(
                        {"id": opt_id, "text": opt.get("text", str(opt))}
                    )

        # 根据答案数量决定使用 value 还是 values
        if len(correct_answers) == 1:
            return CorrectAnswerData(
                type=interaction_type,
                value=correct_answers[0],
                options=options_detail,
            )
        else:
            return CorrectAnswerData(
                type=interaction_type,
                values=correct_answers,
                options=options_detail,
            )


class ExactEvaluator(BaseEvaluator):
    """精确匹配评判器

    适用于：单选题、多选题、判断题等
    """

    def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        correct_answers = self._get_correct_answers(question)
        full_score = self._get_full_score(question)

        # 标准化用户答案
        user_answer_str = str(user_answer).strip()

        # 精确匹配
        is_correct = user_answer_str in [str(a).strip() for a in correct_answers]

        return EvaluateResult(
            is_correct=is_correct,
            score=full_score if is_correct else 0,
            full_score=full_score,
            correct_answer=self._build_correct_answer_data(question, correct_answers),
        )


class FuzzyEvaluator(BaseEvaluator):
    """模糊匹配评判器

    适用于：填空题、简答题等
    支持：大小写忽略、accept_answers 可接受答案
    """

    def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        answer_config = question.answer or {}
        correct_answers = self._get_correct_answers(question)
        accept_answers = answer_config.get("accept_answers", [])
        full_score = self._get_full_score(question)

        # 标准化用户答案（忽略大小写和首尾空格）
        user_answer_normalized = str(user_answer).strip().lower()

        # 所有可接受的答案
        all_acceptable = [str(a).strip().lower() for a in correct_answers + accept_answers]

        is_correct = user_answer_normalized in all_acceptable

        return EvaluateResult(
            is_correct=is_correct,
            score=full_score if is_correct else 0,
            full_score=full_score,
            correct_answer=self._build_correct_answer_data(question, correct_answers),
        )


class CompositeEvaluator(BaseEvaluator):
    """复合题评判器

    适用于：包含多个子题的复合题
    支持：部分得分策略 (sum / all_or_nothing)
    """

    def evaluate(
        self, question: Question, user_answer: Any, sub_answers: Optional[list] = None
    ) -> EvaluateResult:
        stem = question.stem or {}
        sub_questions = stem.get("sub_questions", [])
        answer_config = question.answer or {}
        scoring = answer_config.get("scoring", {})
        partial_strategy = scoring.get("partial_strategy", "sum")

        if not sub_questions:
            # 没有子题，退回到精确匹配
            return ExactEvaluator().evaluate(question, user_answer)

        # 构建子答案映射
        sub_answer_map = {}
        if sub_answers:
            for sa in sub_answers:
                if isinstance(sa, dict):
                    sub_answer_map[sa.get("sub_question_id")] = sa.get("answer")
                else:
                    sub_answer_map[sa.sub_question_id] = sa.answer

        total_score = 0
        full_score = 0
        sub_results = []
        all_correct = True
        sub_correct_answers = []

        for sub_q in sub_questions:
            sub_id = sub_q.get("id")
            sub_answer_config = sub_q.get("answer", {})
            sub_full_score = sub_answer_config.get("scoring", {}).get("full_score", 10)
            full_score += sub_full_score

            user_sub_answer = sub_answer_map.get(sub_id)
            correct_answers = sub_answer_config.get("correct_answers", [])

            if user_sub_answer is None:
                is_sub_correct = False
                sub_score = 0
            else:
                is_sub_correct = str(user_sub_answer).strip() in [
                    str(a).strip() for a in correct_answers
                ]
                sub_score = sub_full_score if is_sub_correct else 0

            total_score += sub_score
            all_correct = all_correct and is_sub_correct

            sub_results.append(
                {
                    "sub_question_id": sub_id,
                    "is_correct": is_sub_correct,
                    "score": sub_score,
                    "full_score": sub_full_score,
                    "correct_answer": correct_answers[0] if correct_answers else None,
                }
            )

            # 收集子题正确答案
            sub_correct_answers.append(
                {
                    "sub_id": sub_id,
                    "is_correct": is_sub_correct,
                    "value": correct_answers[0] if correct_answers else None,
                }
            )

        # 根据策略计算最终得分
        if partial_strategy == "all_or_nothing":
            final_score = full_score if all_correct else 0
        else:  # sum
            final_score = total_score

        return EvaluateResult(
            is_correct=all_correct,
            score=final_score,
            full_score=full_score,
            correct_answer=CorrectAnswerData(
                type="composite",
                sub_answers=sub_correct_answers,
            ),
            sub_results=sub_results,
        )


class RubricEvaluator(BaseEvaluator):
    """评分标准评判器

    适用于：需要预定义评分规则的主观题
    根据 rubric 配置进行评分
    """

    def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        answer_config = question.answer or {}
        rubric = answer_config.get("rubric", {})
        correct_answers = self._get_correct_answers(question)
        full_score = self._get_full_score(question)

        # 如果有 rubric 配置，尝试匹配评分
        # 简单实现：检查是否包含关键词
        score = 0
        is_correct = False

        if rubric:
            keywords = rubric.get("keywords", [])
            min_score = rubric.get("min_score", 0)
            user_answer_str = str(user_answer).lower()

            matched = 0
            for keyword in keywords:
                if keyword.lower() in user_answer_str:
                    matched += 1

            if keywords:
                score = (matched / len(keywords)) * full_score
                is_correct = score >= (full_score * 0.6)  # 60% 及格
            else:
                # 没有关键词配置，默认给一半分
                score = full_score * 0.5
                is_correct = True
        else:
            # 没有 rubric，退回到模糊匹配
            return FuzzyEvaluator().evaluate(question, user_answer)

        return EvaluateResult(
            is_correct=is_correct,
            score=score,
            full_score=full_score,
            correct_answer=self._build_correct_answer_data(question, correct_answers),
        )


class AIEvaluator(BaseEvaluator):
    """AI 评判器

    适用于：口语题、开放题等需要 AI 评分的题型
    注意：此评判器只做占位，实际 AI 评分在 answer.py 中异步完成
    """

    def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        correct_answers = self._get_correct_answers(question)
        full_score = self._get_full_score(question)

        # AI 评判需要异步调用，这里返回待评判状态
        # 实际的 AI 评判在 answer.py 中处理
        return EvaluateResult(
            is_correct=False,  # 待 AI 评判
            score=0,
            full_score=full_score,
            correct_answer=self._build_correct_answer_data(question, correct_answers),
        )


# 评判器映射
EVALUATOR_MAP: dict[str, type[BaseEvaluator]] = {
    "exact": ExactEvaluator,
    "fuzzy": FuzzyEvaluator,
    "rubric": RubricEvaluator,
    "ai": AIEvaluator,
    "composite": CompositeEvaluator,
}


class AnswerEvaluator:
    """答案评判器 - 根据 answer.type 选择策略"""

    @staticmethod
    def evaluate(
        question: Question,
        user_answer: Any,
        sub_answers: Optional[list] = None,
    ) -> EvaluateResult:
        """评判答案

        Args:
            question: 题目对象
            user_answer: 用户答案
            sub_answers: 子题答案列表（复合题使用）

        Returns:
            EvaluateResult: 评判结果
        """
        answer_config = question.answer or {}
        answer_type = answer_config.get("type", "exact")

        evaluator_class = EVALUATOR_MAP.get(answer_type, ExactEvaluator)
        evaluator = evaluator_class()

        if answer_type == "composite" and sub_answers:
            return evaluator.evaluate(question, user_answer, sub_answers)

        return evaluator.evaluate(question, user_answer)


__all__ = [
    "AnswerEvaluator",
    "EvaluateResult",
    "CorrectAnswerData",
    "BaseEvaluator",
    "ExactEvaluator",
    "FuzzyEvaluator",
    "CompositeEvaluator",
    "RubricEvaluator",
    "AIEvaluator",
    "EVALUATOR_MAP",
]
