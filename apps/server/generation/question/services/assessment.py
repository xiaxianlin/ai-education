"""能力评估服务

本模块负责IRT能力评估题目生成的业务逻辑：
- 参数验证
- 数据加载（教材、全部知识点）
- Prompt 构建（基于教材和知识点）
"""

from loguru import logger
from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload
from langchain_core.output_parsers import JsonOutputParser

from shared.core.database import Knowledge, Textbook
from shared.services.prompt import get_assessment_prompt
from generation.question.schema import QuestionGenerationState, QuestionGenerationResult
from generation.question.utils import (
    recall_for_assessment,
    build_difficulty_distribution,
    build_common_prompt,
    build_knowledges_prompt,
)


class AssessmentGenerateService:

    def validate_state(state: QuestionGenerationState) -> None:
        """验证能力评估的状态参数"""
        if state.get("student_id") is None:
            raise ValueError("学生 ID (student_id) 不能为空")

    async def load_data(state: QuestionGenerationState) -> Dict[str, Any]:
        """加载能力评估所需的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            student_id: str = state["student_id"]
            textbook: Textbook = state["textbook"]

            knowledge_rows = await db.scalars(
                select(Knowledge)
                .options(noload(Knowledge.textbook), noload(Knowledge.unit))
                .where(Knowledge.textbook_id == textbook.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            recalled_questions = await recall_for_assessment(db, textbook.id)

            logger.info(
                f"✓ 能力评估数据加载完成: student_id={student_id}, textbook_id={textbook.id}, "
                f"subject={textbook.subject}, version={textbook.version}, "
                f"grade={textbook.grade}, semester={textbook.semester}, "
                f"知识点={len(knowledges)}个, 召回题目={len(recalled_questions)}道"
            )

            return {
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"✗ 加载能力评估数据失败: {e}")
            raise

    @classmethod
    async def build_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
        """构建能力评估的 Prompt"""
        db: AsyncSession = state["db"]
        count = state["count"]
        textbook = state["textbook"]
        subject = textbook.subject
        grade = textbook.grade
        knowledges = state.get("knowledges", [])
        recall_questions = state.get("recall_questions", [])

        # 构建 JSON 输出解析器
        parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
        format_instructions = parser.get_format_instructions()

        remain_count = count - len(recall_questions)
        # 计算难度分布
        distribution = build_difficulty_distribution(remain_count)

        # 构建公共提示词组件
        grade_text, question_types_text, avoid_duplicate_hint = build_common_prompt(subject, grade, recall_questions)

        prompt = await get_assessment_prompt(db, grade, subject, avoid_duplicate_hint)

        prompt = prompt.partial(format_instructions=format_instructions)

        # 构建 prompt 输入参数（format_instructions 已通过 partial 填充，无需在此传入）
        prompt_input = {
            "grade": grade_text,
            "count": remain_count,
            "question_types": question_types_text,
            "knowledge_text": build_knowledges_prompt(knowledges),
            **distribution,  # 包含 simple_count, medium_count, hard_count
        }

        return {
            "prompt": prompt,
            "prompt_input": prompt_input,
            "parser": parser,
        }
