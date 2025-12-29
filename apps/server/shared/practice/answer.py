"""答题服务"""

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts.chat import ChatMessagePromptTemplate
from loguru import logger
from shared.core.database import (
    PracticeSession,
    PracticeSessionAnswer,
    Question,
)
from shared.core.schema import PracticeSessionAnswerSchema
from shared.provider import get_provider
from shared.utils.prompt import build_question_prompt
from shared.utils.time import now
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .prompt import ANALYZE_QUESTION_ANSWER_PROMPT
from .schema import AnswerAnalysisSchema, SubmitAnswerSchema


async def _analyze_answer(db: AsyncSession, question: Question, answer_content: str):
    """检查答案是否正确并生成分析

    Args:
        question: 题目对象 (V2)
        answer_content: 答题内容
        db: 数据库会话

    Returns:
        tuple: (is_correct, analysis) - 是否正确和错题分析（如果错误）
    """
    # V2: answer is a dict with correct_answers list
    correct_answers = question.answer.get("correct_answers", [])
    is_correct = answer_content.strip() in [str(a).strip() for a in correct_answers]
    if is_correct:
        return is_correct, None

    prompt_template = ChatMessagePromptTemplate.from_messages(ANALYZE_QUESTION_ANSWER_PROMPT)
    prompt_parser = JsonOutputParser(pydantic_object=AnswerAnalysisSchema)
    prompt_input = {"question_content": build_question_prompt(question)}

    provider = get_provider()
    result = provider.invoke_chain(prompt_template, prompt_parser, prompt_input)

    return result["is_correct"], result["analysis"]


async def submit_answer(db: AsyncSession, student_id: str, params: SubmitAnswerSchema):
    """提交答题答案"""
    # 1. 查询练习会话
    session = await db.scalar(select(PracticeSession).where(PracticeSession.id == params.session_id))
    if not session:
        raise ValueError(f"练习会话不存在: session_id={params.session_id}")

    if session.student_id != student_id:
        raise ValueError("无权操作此练习")

    # 2. 查询题目信息 (V2)
    question = await db.scalar(select(Question).where(Question.id == params.question_id))
    if not question:
        raise ValueError(f"题目不存在: question_id={params.question_id}")

    # 3. 查询答题记录
    answer_record = await db.scalar(
        select(PracticeSessionAnswer).where(
            PracticeSessionAnswer.session_id == params.session_id,
            PracticeSessionAnswer.question_id == params.question_id,
        )
    )
    if not answer_record:
        raise ValueError(f"答题记录不存在: session_id={params.session_id}, question_id={params.question_id}")

    if answer_record.status != 0:
        raise ValueError(f"答题记录已提交: session_id={params.session_id}, question_id={params.question_id}")

    # 4. 检查答案并生成分析
    is_correct, analysis = await _analyze_answer(db, question, params.answer)

    # 5. 更新答题记录
    answer_record.submit_time = now()
    answer_record.text_answer = params.answer
    answer_record.status = 1 if is_correct else 2
    answer_record.time_spent = params.time_spent
    # V2: correct_answer is extracted from answer dict
    correct_answers = question.answer.get("correct_answers", [])
    answer_record.correct_answer = ", ".join(str(a) for a in correct_answers)
    answer_record.analysis = analysis

    # 6. 更新练习会话统计

    session.answer_count += 1
    if is_correct:
        session.correct_count += 1

    session.update_time = now()

    await db.commit()
    await db.refresh(answer_record)

    logger.info(
        f"答题提交成功: student_id={student_id}, session_id={params.session_id}, "
        f"question_id={params.question_id}, is_correct={is_correct}"
    )

    return PracticeSessionAnswerSchema.model_validate(answer_record)


async def asr_audio_answer(db: AsyncSession, audio_data: bytes):
    """语音识别"""
    provider = get_provider()
    text = provider.invoke_asr(audio_data)
    return text
