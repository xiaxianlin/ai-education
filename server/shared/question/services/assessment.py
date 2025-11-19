"""能力评估服务 - 负责能力评估相关的验证、上下文加载、prompt构建和题目召回"""

from typing import Any, Dict, List
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Textbook, Unit, Question
from shared.question.types import QuestionGenerationState


def validate_state(state: QuestionGenerationState) -> None:
    db: AsyncSession = state["db"]
    textbook_id: int = state.get("textbook_id")

    if textbook_id is None:
        raise ValueError("unit_id is required for assessment generation")
        # 加载单元信息（用于获取教材信息）
    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
    if not unit:
        raise ValueError(f"单元不存在: {unit_id}")

    # 加载教材信息
    textbook = await db.scalar(select(Textbook).where(Textbook.id == unit.textbook_id))
    if not textbook:
        raise ValueError(f"教材不存在: {unit.textbook_id}")
    # 其他验证在 load_context 中进行


async def recall_questions(db: AsyncSession, textbook_id: int, count: int) -> List[int]:
    """召回能力评估题目

    策略：均衡从各单元选择题目

    Args:
        db: 数据库会话
        textbook_id: 教材ID
        count: 题目数量

    Returns:
        题目ID列表
    """
    # 获取教材的所有单元
    unit_result = await db.execute(select(Unit.id).where(Unit.textbook_id == textbook_id))
    unit_ids = [row[0] for row in unit_result.all()]

    if not unit_ids:
        return []

    # 从每个单元获取少量题目
    questions_per_unit = max(1, count // len(unit_ids))
    question_ids = []

    for unit_id in unit_ids:
        unit_questions = await db.execute(
            select(Question.id)
            .where(
                and_(
                    Question.unit_id == unit_id,
                    Question.status == 1,
                )
            )
            .order_by(func.random())
            .limit(questions_per_unit)
        )
        question_ids.extend([row[0] for row in unit_questions.all()])

    # 去重并限制数量
    unique_questions = list(dict.fromkeys(question_ids))
    return unique_questions[:count]


async def load_data(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载能力评估的上下文数据，包括题目召回"""
    db: AsyncSession = state["db"]
    unit_id: int = state["unit_id"]
    count: int = state.get("count", 15)  # 默认召回15道题

    # 召回题目
    recalled_question_ids = await recall_questions(db, textbook.id, count)

    # 获取召回题目的详细信息，用于在prompt中避免重复
    recalled_questions_info = ""
    if recalled_question_ids:
        questions = await db.execute(
            select(Question.id, Question.content, Question.knowledge).where(
                Question.id.in_(recalled_question_ids)
            )
        )
        question_list = questions.all()

        if question_list:
            info_lines = []
            for qid, content, knowledge in question_list:
                content_preview = (
                    content[:50] + "..." if content and len(content) > 50 else (content or "")
                )
                knowledge_str = knowledge or "未知知识点"
                info_lines.append(f"- 题目ID {qid}: {content_preview} (知识点: {knowledge_str})")
            recalled_questions_info = "\n".join(info_lines[:10])  # 最多显示10道题的信息

    logger.info(
        f"加载能力评估上下文: unit_id={unit_id}, subject={textbook.subject}, grade={textbook.grade}, 召回题目数量={len(recalled_question_ids)}"
    )

    return {
        "unit": unit,
        "textbook": textbook,
        "recalled_question_ids": recalled_question_ids,
        "recalled_questions_info": recalled_questions_info,
    }
