"""今日练习服务 - 负责今日练习相关的验证、上下文加载、prompt构建和题目召回"""
from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import Question
from shared.question.types import QuestionGenerationState
from shared.question.prompts.daily_practive import build_daily_prompt
from shared.question.services.recall import RecallService


def validate_state(state: QuestionGenerationState) -> None:
    """验证今日练习的状态参数"""
    if state.get("student_id") is None:
        raise ValueError("student_id is required for daily practice generation")
    if state.get("textbook_id") is None:
        raise ValueError("textbook_id is required for daily practice generation")


async def load_context(state: QuestionGenerationState) -> Dict[str, Any]:
    """加载今日练习的上下文数据，包括题目召回"""
    db: AsyncSession = state["db"]
    student_id: str = state["student_id"]
    textbook_id: int = state["textbook_id"]
    count: int = state.get("count", 15)  # 默认召回15道题
    
    logger.info(f"加载今日练习上下文: student_id={student_id}, textbook_id={textbook_id}")
    
    # 召回题目
    recalled_question_ids = await recall_questions(db, student_id, textbook_id, count)
    
    # 获取召回题目的详细信息，用于在prompt中避免重复
    recalled_questions_info = ""
    if recalled_question_ids:
        questions = await db.execute(
            select(Question.id, Question.content, Question.knowledge)
            .where(Question.id.in_(recalled_question_ids))
        )
        question_list = questions.all()
        
        if question_list:
            info_lines = []
            for qid, content, knowledge in question_list:
                content_preview = content[:50] + "..." if content and len(content) > 50 else (content or "")
                knowledge_str = knowledge or "未知知识点"
                info_lines.append(f"- 题目ID {qid}: {content_preview} (知识点: {knowledge_str})")
            recalled_questions_info = "\n".join(info_lines[:10])  # 最多显示10道题的信息
    
    logger.info(f"今日练习召回题目数量: {len(recalled_question_ids)}")
    
    return {
        "recalled_question_ids": recalled_question_ids,
        "recalled_questions_info": recalled_questions_info,
    }


async def build_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建今日练习的prompt"""
    return await build_daily_prompt(state)


async def recall_questions(
    db: AsyncSession,
    student_id: str,
    textbook_id: int,
    count: int
) -> List[int]:
    """召回今日练习题目

    策略：50% 错题 + 50% 巩固题目

    Args:
        db: 数据库会话
        student_id: 学生ID
        textbook_id: 教材ID
        count: 题目总数

    Returns:
        题目ID列表
    """
    question_ids = []

    # 50% 错题
    wrong_count = count // 2
    wrong_questions = await RecallService.get_wrong_questions(
        db, student_id, textbook_id, wrong_count
    )
    question_ids.extend(wrong_questions)

    # 剩余巩固题目
    consolidate_count = count - len(question_ids)
    if consolidate_count > 0:
        consolidate_questions = await RecallService.get_consolidate_questions(
            db, student_id, textbook_id, consolidate_count, exclude_ids=question_ids
        )
        question_ids.extend(consolidate_questions)

    return question_ids
