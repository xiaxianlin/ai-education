import secrets

from loguru import logger
from shared.core.database import Practice
from shared.core.database import Question
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..schema import GeneratedQuestion, QuestionGenerationState


def grade_to_stage(grade: int) -> str:
    """根据年级计算学段"""
    if grade <= 3:
        return "primary_low"
    elif grade <= 6:
        return "primary_high"
    elif grade <= 9:
        return "junior"
    return "senior"


async def recall_questions(db: AsyncSession, session: Practice):
    """为日常练习召回题目"""
    recall_count = 0  # recall_count 不再存储在 session 中，默认值为 0
    if recall_count == 0:
        return []

    # 构建查询：根据科目和年级查询
    subject = session.subject
    grade = session.grade
    
    conditions = []
    if subject:
        conditions.append(Question.subject == subject)
    if grade:
        conditions.append(Question.grade == grade)
    
    if not conditions:
        # 如果没有条件，返回空列表
        return []
    
    stmt = (
        select(Question)
        .where(*conditions)
        .order_by(func.random())
        .limit(recall_count)
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


# 难度映射
DIFFICULTY_MAP = {
    "简单": "easy",
    "普通": "medium",
    "困难": "hard",
    "easy": "easy",
    "medium": "medium",
    "hard": "hard",
}


def handle_llm_questions(
    state: QuestionGenerationState, llm_questions: list[dict]
) -> list[Question]:
    """验证大模型返回的结果并创建 Question 实例"""
    db: AsyncSession = state["db"]
    textbook = state["textbook"]
    units = state.get("units", [])
    unit = units[0] if units else None

    questions = []
    for question in llm_questions:
        if not isinstance(question, dict):
            logger.warning(f"题目项类型错误: {type(question)}, 跳过处理")
            continue
        item = GeneratedQuestion.model_validate(question)

        # 构建 V2 格式的选项
        v2_options = []
        for i, opt in enumerate(item.options):
            v2_options.append(
                {
                    "id": chr(65 + i),  # A, B, C, D...
                    "text": opt.text,
                    "is_correct": opt.text == item.answer or chr(65 + i) == item.answer,
                }
            )

        # 映射难度
        difficulty = DIFFICULTY_MAP.get(item.difficulty, "medium")

        questions.append(
            Question(
                id=secrets.token_hex(16),
                question_type_id=1,  # 需要根据 question_type 查找
                question_type_code=f"{item.question_type}_{item.question_subtype}".lower().replace(
                    " ", "_"
                ),
                subject=textbook.subject,
                grade=textbook.grade,
                stage=grade_to_stage(textbook.grade),
                stem={"text": item.question},
                options=v2_options if v2_options else None,
                answer={"type": "exact", "correct_answers": [item.answer]},
                difficulty=difficulty,
                knowledge_points=item.knowledge,
                source="ai",
            )
        )

    db.add_all(questions)

    return questions
