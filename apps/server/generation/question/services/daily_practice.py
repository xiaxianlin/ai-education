"""日常练习服务

本模块负责个性化日常练习题目生成的业务逻辑：
- 参数验证
- 数据加载（学生学习数据）
- Prompt 构建（基于教材和学生学习数据）
"""

from typing import Any, Dict
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.output_parsers import JsonOutputParser

from shared.core.database import Textbook
from shared.services.prompt import get_daily_practice_prompt
from generation.question.schema import QuestionGenerationState, QuestionGenerationResult
from generation.question.utils import (
    build_common_prompt,
    build_knowledges_prompt,
    build_units_prompt,
    build_question_distribution,
    recall_for_daily_practice,
)


class DailyPracticeGenerateService:

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证日常练习的状态参数"""
        if state.get("student_id") is None:
            raise ValueError("学生 ID (student_id) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载日常练习所需的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            student_id: str = state["student_id"]
            textbook: Textbook = state["textbook"]

            # 召回历史题目（用于避免重复）
            recalled_questions = await recall_for_daily_practice(db, student_id, textbook.id)

            logger.info(
                f"✓ 日常练习数据加载完成: student_id={student_id}, textbook_id={textbook.id}, "
                f"subject={textbook.subject}, grade={textbook.grade}, "
                f"召回题目={len(recalled_questions)}道"
            )

            return {
                "textbook": textbook,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"✗ 加载日常练习数据失败: {e}")
            raise

    @classmethod
    async def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建日常练习的 Prompt"""
        db: AsyncSession = state["db"]
        count = state["count"]
        textbook = state["textbook"]
        recall_questions = state.get("recall_questions", [])

        subject = textbook.subject
        grade = textbook.grade

        # 构建 JSON 输出解析器
        parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
        format_instructions = parser.get_format_instructions()

        # 构建公共提示词组件
        grade_text, question_types_text, avoid_duplicate_hint = build_common_prompt(subject, grade, recall_questions)

        # 简化学生学习数据获取（server-ai 中可能没有 StudentService）
        # 这里先使用空列表，后续可以通过 API 调用 server-api 获取
        weak_knowledge_points = []
        mastered_knowledge_points = []
        challenge_knowledge_points = []
        new_knowledge_points = []
        review_units = []

        # 计算题目分布（扣除召回的题目数量）
        remain_count = count - len(recall_questions)
        distribution = build_question_distribution(remain_count)

        prompt = await get_daily_practice_prompt(db, grade, subject, avoid_duplicate_hint)
        prompt = prompt.partial(format_instructions=format_instructions)

        # 构建 prompt 输入参数（format_instructions 已通过 partial 填充，无需在此传入）
        prompt_input = {
            "grade": grade_text,
            "count": remain_count,
            "question_types": question_types_text,
            "weak_knowledge_points": build_knowledges_prompt(weak_knowledge_points),
            "mastered_knowledge_points": build_knowledges_prompt(mastered_knowledge_points),
            "challenge_knowledge_points": build_knowledges_prompt(challenge_knowledge_points),
            "new_knowledge_points": build_knowledges_prompt(new_knowledge_points),
            "review_units": build_units_prompt(review_units),
            **distribution,  # 包含 wrong_count, mastered_count, challenge_count, new_count
        }

        return {
            "prompt": prompt,
            "prompt_input": prompt_input,
            "parser": parser,
        }
