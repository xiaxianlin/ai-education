"""单元练习服务

本模块负责单元练习题目生成的业务逻辑：
- 参数验证
- 数据加载（单元、知识点）
- Prompt 构建（基于教材和单元知识点）

"""

from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from shared.core.database import Knowledge, Unit, Textbook
from shared.services.prompt import get_unit_practice_prompt
from generation.question.utils import recall_for_unit_practice, build_common_prompt, build_knowledges_prompt
from generation.question.schema import QuestionGenerationState, QuestionGenerationResult
from langchain_core.output_parsers import JsonOutputParser


class UnitPracticeGenerateService:

    @classmethod
    def validate_state(cls, state: QuestionGenerationState) -> None:
        """验证单元练习的状态参数"""
        if state.get("student_id") is None:
            raise ValueError("学生 ID (student_id) 不能为空")

        if state.get("unit") is None:
            raise ValueError("单元 (unit) 不能为空")

    @classmethod
    async def load_data(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """加载单元练习所需的上下文数据"""
        try:
            db: AsyncSession = state["db"]
            unit: Unit = state["unit"]
            textbook: Textbook = state["textbook"]

            knowledge_rows = await db.scalars(
                select(Knowledge).where(Knowledge.unit_id == unit.id).order_by(Knowledge.id)
            )
            knowledges = [k.name for k in knowledge_rows.all()]

            # 召回历史题目（用于避免重复）
            recalled_questions = await recall_for_unit_practice(db, unit.id)

            logger.info(
                f"✓ 单元练习数据加载完成: unit_id={unit.id}, unit_name={unit.name}, "
                f"textbook_id={textbook.id}, subject={textbook.subject}, grade={textbook.grade}, "
                f"知识点={len(knowledges)}个, 召回题目={len(recalled_questions)}道"
            )

            return {
                "unit": unit,
                "textbook": textbook,
                "knowledges": knowledges,
                "recall_questions": recalled_questions,
            }
        except Exception as e:
            logger.error(f"✗ 加载单元练习数据失败: {e}")
            raise

    @classmethod
    async def build_prompt(cls, state: QuestionGenerationState) -> Dict[str, Any]:
        """构建单元练习的 Prompt"""
        db: AsyncSession = state["db"]
        unit = state["unit"]
        count = state["count"]
        textbook = state["textbook"]
        knowledges = state.get("knowledges", [])
        recall_questions = state.get("recall_questions", [])

        subject = textbook.subject
        grade = textbook.grade

        # 构建 JSON 输出解析器
        parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
        format_instructions = parser.get_format_instructions()

        # 构建公共提示词组件
        grade_text, question_types_text, avoid_duplicate_hint = build_common_prompt(subject, grade, recall_questions)

        prompt = await get_unit_practice_prompt(db, grade, subject, avoid_duplicate_hint)
        prompt = prompt.partial(format_instructions=format_instructions)

        # 构建 prompt 输入参数（format_instructions 已通过 partial 填充，无需在此传入）
        prompt_input = {
            "grade": grade_text,
            "unit_name": unit.name,
            "unit_summary": unit.content or "本单元的练习题目",
            "count": count - len(recall_questions),
            "question_types": question_types_text,
            "knowledge_text": build_knowledges_prompt(knowledges),
        }

        return {
            "prompt": prompt,
            "prompt_input": prompt_input,
            "parser": parser,
        }
