import time
from typing import List
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import Textbook, Unit, Question
from generation.question.schema import QuestionGenerationState
from .graph import create_question_generation_graph

app = create_question_generation_graph()


async def invoke_generate_workflow(
    *,
    db: AsyncSession,
    count: int,
    type: str,
    textbook: Textbook,
    student_id: str | None = None,  # 学生练习需要
    unit: Unit | None = None,  # 单元练习需要
) -> List[Question]:
    """执行问题生成流程"""

    start_time = time.time()

    initial_state = QuestionGenerationState(
        db=db,
        count=count,
        type=type,
        textbook=textbook,
        student_id=student_id,
        unit=unit,
    )

    try:
        result = await app.ainvoke(initial_state)
        questions = result.get("questions", [])

        # 计算生成时长
        elapsed_time = time.time() - start_time

        logger.info(
            "题目生成完成 | type={type} | subject={subject} | grade={grade} | "
            "生成题目数={question_count} | 耗时={elapsed_time:.2f}秒",
            type=type,
            subject=textbook.subject,
            grade=textbook.grade,
            question_count=len(questions),
            elapsed_time=elapsed_time,
        )

        return questions
    except Exception as e:

        elapsed_time = time.time() - start_time

        logger.error(
            "题目生成失败 | type={type} | subject={subject} | grade={grade} | "
            "耗时={elapsed_time:.2f}秒 | 错误={error}",
            type=type,
            subject=textbook.subject,
            grade=textbook.grade,
            elapsed_time=elapsed_time,
            error=str(e),
        )
        raise e


__all__ = ["invoke_generate_workflow"]
