import secrets

from loguru import logger
from shared.core.database import PracticeSession, Question
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import GeneratedQuestion, QuestionGenerationState


async def recall_questions(db: AsyncSession, session: PracticeSession):
    """为日常练习召回题目"""
    recall_count = session.parameters.get("recall_count", 0)
    if recall_count == 0:
        return []

    # 构建查询：从教材随机选择
    stmt = (
        select(Question)
        .where(Question.textbook_id == session.textbook_id)
        .order_by(func.random())
        .limit(session.recall_count)
    )

    result = await db.scalars(stmt)

    return result.all()


def get_difficulty_distribution(
    count: int, simple_ratio: float = 0.3, medium_ratio: float = 0.5, hard_ratio: float = 0.2
):
    """计算题目难度分布"""
    if abs(simple_ratio + medium_ratio + hard_ratio - 1.0) > 0.01:
        raise ValueError("难度比例之和必须为1.0")

    simple_count = max(1, int(count * simple_ratio))
    medium_count = max(1, int(count * medium_ratio))
    hard_count = count - simple_count - medium_count

    return {"simple_count": simple_count, "medium_count": medium_count, "hard_count": hard_count}


def get_question_distribution(
    count: int,
    wrong_ratio: float = 0.3,
    mastered_ratio: float = 0.4,
    challenge_ratio: float = 0.2,
    new_ratio: float = 0.1,
):
    """计算日常练习题目类型分布"""
    if abs(wrong_ratio + mastered_ratio + challenge_ratio + new_ratio - 1.0) > 0.01:
        raise ValueError("题目类型比例之和必须为1.0")

    wrong_count = max(1, int(count * wrong_ratio))
    mastered_count = int(count * mastered_ratio)
    challenge_count = int(count * challenge_ratio)
    new_count = count - wrong_count - mastered_count - challenge_count

    return {
        "wrong_count": wrong_count,
        "mastered_count": mastered_count,
        "challenge_count": challenge_count,
        "new_count": new_count,
    }


def handle_llm_questions(
    state: QuestionGenerationState, llm_questions: list[dict]
) -> list[Question]:
    """验证大模型返回的结果"""
    db: AsyncSession = state["db"]
    textbook = state["textbook"]
    unit = state.get("units", [])

    questions = []
    for question in llm_questions:
        if not isinstance(question, dict):
            logger.warning(f"题目项类型错误: {type(question)}, 跳过处理")
            continue
        item = GeneratedQuestion.model_validate(question)
        questions.append(
            Question(
                id=secrets.token_hex(16),
                subject=textbook.subject,
                grade=textbook.grade,
                type=item.question_type,
                subtype=item.question_subtype,
                content=item.question,
                resource_type=item.resource_type,
                resource_content=item.resource_content,
                options=item.options,
                answer=item.answer,
                difficulty=item.difficulty,
                textbook_id=textbook.id,
                unit_id=unit.id if unit else None,
                knowledge="、".join(item.knowledge),
            )
        )

    db.add_all(questions)

    return questions
