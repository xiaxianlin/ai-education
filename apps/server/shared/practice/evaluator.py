"""答案评判器模块

根据 answer.type 选择不同的评判策略：
- exact: 精确匹配（选择题、判断题）
- fuzzy: 模糊匹配（填空题、简答题）
- rubric: 评分标准（主观题）
- ai: AI 评分（口语题、开放题）
- composite: 复合题（递归评判子题）
"""

import json
from abc import ABC, abstractmethod
from typing import Any, Optional

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from pydantic import BaseModel, Field

from shared.core.database import Question
from shared.provider import get_provider
from shared.utils.prompt import build_question_prompt

from .prompt import AI_RUBRIC_EVALUATION_PROMPT
from .schema import AIRubricEvaluationSchema


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
    feedback: Optional[str] = Field(default=None, description="AI 评分反馈")


class BaseEvaluator(ABC):
    """评判器基类"""

    @abstractmethod
    async def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
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
        content = question.content or {}
        options = content.get("options", [])
        if options and correct_answers:
            options_detail = []
            for opt in options:
                opt_id = opt.get("id", "")
                if str(opt_id) in [str(a) for a in correct_answers]:
                    options_detail.append({"id": opt_id, "text": opt.get("text", str(opt))})

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

    async def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        correct_answers = self._get_correct_answers(question)
        full_score = self._get_full_score(question)

        # 标准化正确答案集合
        correct_set = set(str(a).strip() for a in correct_answers)

        # 判断用户答案类型并进行匹配
        if isinstance(user_answer, list):
            # 多选题：用户答案为列表，需要完全匹配
            user_set = set(str(a).strip() for a in user_answer)
            is_correct = user_set == correct_set
        elif isinstance(user_answer, dict):
            # 匹配题：用户答案为对象格式 {"A": "1", "B": "2"}
            # 将字典的值转换为集合进行匹配
            user_values = set(str(v).strip() for v in user_answer.values())
            # 对于匹配题，需要检查所有匹配关系是否正确
            # 这里简化处理：检查值集合是否匹配
            is_correct = user_values == correct_set
        else:
            # 单选题/判断题：用户答案为单值，匹配任一正确答案即可
            user_answer_str = str(user_answer).strip()
            is_correct = user_answer_str in correct_set

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

    async def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
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

    async def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        content = question.content or {}
        # sub_questions 可能在 content.sub_questions 或 content.stem.sub_questions 中
        sub_questions = content.get("sub_questions", [])
        if not sub_questions and isinstance(content.get("stem"), dict):
            sub_questions = content.get("stem", {}).get("sub_questions", [])
        
        answer_config = question.answer or {}
        scoring = answer_config.get("scoring", {})
        partial_strategy = scoring.get("partial_strategy", "sum")

        if not sub_questions:
            # 没有子题，退回到精确匹配
            return await ExactEvaluator().evaluate(question, user_answer)

        # 构建子答案映射
        sub_answer_map = {}

        # 从 user_answer 中解析新格式: [{"sub_id": "1", "value": "答案"}]
        if user_answer:
            try:
                # 如果是字符串，尝试解析 JSON
                if isinstance(user_answer, str):
                    ans_list = json.loads(user_answer)
                else:
                    ans_list = user_answer

                # 必须是数组格式
                if isinstance(ans_list, list):
                    for item in ans_list:
                        if isinstance(item, dict) and "sub_id" in item and "value" in item:
                            sub_answer_map[str(item["sub_id"])] = item["value"]
            except (json.JSONDecodeError, Exception):
                pass

        total_score = 0
        total_full_score = 0
        sub_results = []
        all_correct = True
        sub_correct_answers = []

        for sub_q in sub_questions:
            sub_id = sub_q.get("id")
            sub_answer_config = sub_q.get("answer", {})
            sub_full_score = sub_answer_config.get("scoring", {}).get("full_score", 10)
            total_full_score += sub_full_score

            user_sub_answer = sub_answer_map.get(sub_id)

            # 选择对应的评判器
            sub_type = sub_answer_config.get("type", "exact")
            # 延迟获取以处理循环依赖/定义顺序
            evaluator_cls = EVALUATOR_MAP.get(sub_type, ExactEvaluator)
            evaluator = evaluator_cls()

            # 构建子题对象（模拟 Question 模型的核心字段）
            # 由于子题目前在数据库中是嵌套在 JSON 里的，这里手动组装一个 Question 用于评判
            sub_question_content = {
                "stem": sub_q.get("stem", {}).get("text", "") if isinstance(sub_q.get("stem"), dict) else str(sub_q.get("stem", "")),
                "options": sub_q.get("options", []),
            }
            sub_question_obj = Question(
                id=f"{question.id}_{sub_id}",
                question_type_code=sub_q.get("interaction_type", "unknown"),
                subject=question.subject,
                grade=question.grade,
                content=sub_question_content,
                answer=sub_q.get("answer", {}),
                explanation=sub_q.get("explanation", ""),
            )

            # 评判子题（异步）
            sub_res = await evaluator.evaluate(sub_question_obj, user_sub_answer)

            total_score += sub_res.score
            all_correct = all_correct and sub_res.is_correct

            # 收集子题评判详情
            sub_results.append(
                {
                    "sub_question_id": sub_id,
                    "is_correct": sub_res.is_correct,
                    "score": sub_res.score,
                    "full_score": sub_res.full_score,
                    "correct_answer": sub_id,  # 占位，正确答案在 correct_answer.sub_answers 中
                }
            )

            # 收集子题正确答案详情
            sub_correct_answers.append(
                {
                    "sub_id": sub_id,
                    "is_correct": sub_res.is_correct,
                    **sub_res.correct_answer.model_dump(),
                }
            )

        # 根据策略计算最终得分
        if partial_strategy == "all_or_nothing":
            final_score = total_full_score if all_correct else 0
        else:  # sum
            final_score = total_score

        return EvaluateResult(
            is_correct=all_correct,
            score=final_score,
            full_score=total_full_score,
            correct_answer=CorrectAnswerData(
                type="composite",
                sub_answers=sub_correct_answers,
            ),
            sub_results=sub_results,
        )


class RubricEvaluator(BaseEvaluator):
    """AI 评分标准评判器

    适用于：需要预定义评分规则的主观题
    使用 AI 根据 rubric 配置进行语义评分
    """

    def _build_scoring_criteria(self, answer_config: dict) -> tuple[str, float]:
        """构建评分标准文本

        Args:
            answer_config: 答案配置

        Returns:
            tuple[str, float]: (评分标准文本, 满分)
        """
        criteria = answer_config.get("criteria", [])
        total_points = answer_config.get("total_points", 10)

        if not criteria:
            return "根据题目要求进行评分", float(total_points)

        # 构建评分标准文本
        criteria_lines = []
        for item in criteria:
            points = item.get("points", 0)
            description = item.get("description", "")
            criteria_lines.append(f"- {description}（{points}分）")

        return "\n".join(criteria_lines), float(total_points)

    async def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        """AI 评分

        使用 LLM 根据 rubric 配置对主观题进行语义评分。

        Args:
            question: 题目对象
            user_answer: 用户答案

        Returns:
            EvaluateResult: 包含 AI 评分结果
        """
        answer_config = question.answer or {}
        correct_answers = self._get_correct_answers(question)

        # 构建评分标准
        scoring_criteria, full_score = self._build_scoring_criteria(answer_config)

        try:
            # 构建 prompt
            prompt_parser = JsonOutputParser(pydantic_object=AIRubricEvaluationSchema)
            format_instructions = prompt_parser.get_format_instructions()

            prompt_template = ChatPromptTemplate.from_template(AI_RUBRIC_EVALUATION_PROMPT)
            prompt_template = prompt_template.partial(format_instructions=format_instructions)

            # 构建问题内容
            question_content = build_question_prompt(question)

            # 将用户答案转换为字符串
            if isinstance(user_answer, (dict, list)):
                student_answer = json.dumps(user_answer, ensure_ascii=False)
            else:
                student_answer = str(user_answer) if user_answer else "（未作答）"

            prompt_input = {
                "question_content": question_content,
                "scoring_criteria": scoring_criteria,
                "full_score": full_score,
                "student_answer": student_answer,
            }

            # 调用 LLM
            provider = get_provider()
            result = await provider.invoke_chain(prompt_template, prompt_parser, prompt_input)

            # 解析结果
            ai_score = float(result.get("score", 0))
            is_pass = result.get("is_pass", False)
            feedback = result.get("feedback", "")

            # 确保分数在合理范围内
            ai_score = max(0, min(ai_score, full_score))

            logger.info(
                f"AI 评分完成: question_id={question.id}, "
                f"score={ai_score}/{full_score}, is_pass={is_pass}"
            )

            return EvaluateResult(
                is_correct=is_pass,
                score=ai_score,
                full_score=full_score,
                correct_answer=self._build_correct_answer_data(question, correct_answers),
                feedback=feedback,
            )

        except Exception as e:
            logger.error(f"AI 评分失败: {e}")
            # 评分失败时，给予保守分数（40%）
            fallback_score = full_score * 0.4
            return EvaluateResult(
                is_correct=False,
                score=fallback_score,
                full_score=full_score,
                correct_answer=self._build_correct_answer_data(question, correct_answers),
            )


class AIEvaluator(BaseEvaluator):
    """AI 评判器

    适用于：口语题、开放题等需要 AI 评分的题型
    复用 RubricEvaluator 的 AI 评分逻辑
    """

    async def evaluate(self, question: Question, user_answer: Any) -> EvaluateResult:
        """AI 评分，复用 RubricEvaluator 的逻辑"""
        return await RubricEvaluator().evaluate(question, user_answer)


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
    async def evaluate(
        question: Question,
        user_answer: Any,
    ) -> EvaluateResult:
        """评判答案

        Args:
            question: 题目对象
            user_answer: 用户答案

        Returns:
            EvaluateResult: 评判结果
        """
        answer_config = question.answer or {}
        answer_type = answer_config.get("type", "exact")

        # 如果是复合题，则使用复合题评判器
        content = question.content or {}
        sub_questions = content.get("sub_questions", [])
        if not sub_questions and isinstance(content.get("stem"), dict):
            sub_questions = content.get("stem", {}).get("sub_questions", [])
        if sub_questions:
            return await CompositeEvaluator().evaluate(question, user_answer)

        evaluator_class = EVALUATOR_MAP.get(answer_type, ExactEvaluator)
        evaluator = evaluator_class()

        return await evaluator.evaluate(question, user_answer)


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
