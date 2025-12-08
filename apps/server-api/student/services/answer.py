"""答题服务"""

from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import PracticeSession, PracticeAnswer, PracticeWrongRecord, Question
from student.schema import AnswerQuestionSchema, AnswerResultSchema
from shared.utils.time import now


async def submit_answer(db: AsyncSession, student_id: str, params: AnswerQuestionSchema) -> dict:
    """提交答题答案"""
    try:
        # 1. 查询练习会话
        session = await db.scalar(
            select(PracticeSession).where(PracticeSession.id == params.session_id)
        )
        if not session:
            raise ValueError("练习会话不存在")

        if session.student_id != student_id:
            raise ValueError("无权操作此练习")

        # 2. 查询题目信息
        question = await db.scalar(select(Question).where(Question.id == params.question_id))
        if not question:
            raise ValueError("题目不存在")

        # 3. 查询答题记录
        answer_record = await db.scalar(
            select(PracticeAnswer).where(
                PracticeAnswer.session_id == params.session_id,
                PracticeAnswer.question_id == params.question_id,
            )
        )
        if not answer_record:
            raise ValueError("答题记录不存在")

        # 4. 使用传入的文本答案（口语题已在单独接口中完成 ASR 解析）
        text_answer = params.answer

        # 5. 判断答案是否正确并生成分析
        # 对于口语题，如果已有音频理解结果，直接使用
        if params.is_audio_answer and params.audio_match is not None:
            # 口语题：直接使用音频理解结果
            is_correct = params.audio_match
            # 如果错误，使用音频理解返回的 reason 作为分析
            if not is_correct:
                analysis = params.audio_reason or "答案不符合题目要求"
                # 添加错题记录
                wrong_record = PracticeWrongRecord(
                    student_id=student_id,
                    session_id=params.session_id,
                    question_id=params.question_id,
                    unit_id=question.unit_id,
                    textbook_id=question.textbook_id,
                    knowledge=question.knowledge,
                    user_answer=text_answer,
                    correct_answer=question.answer,
                    analysis=analysis,
                    time_spent=params.time_spent,
                    is_corrected=0,
                    corrected_time=0,
                    create_time=now(),
                    update_time=now(),
                )
                db.add(wrong_record)
                logger.info(
                    f"添加错题记录: student_id={student_id}, question_id={params.question_id}, "
                    f"session_id={params.session_id}"
                )
            else:
                analysis = None
        else:
            # 非口语题：使用简单的字符串比较判断答案
            is_correct = text_answer.strip() == question.answer.strip()
            if not is_correct:
                # 答案错误，添加错题记录
                analysis = "答案不正确，请仔细检查"
                wrong_record = PracticeWrongRecord(
                    student_id=student_id,
                    session_id=params.session_id,
                    question_id=params.question_id,
                    unit_id=question.unit_id,
                    textbook_id=question.textbook_id,
                    knowledge=question.knowledge,
                    user_answer=text_answer,
                    correct_answer=question.answer,
                    analysis=analysis,
                    time_spent=params.time_spent,
                    is_corrected=0,
                    corrected_time=0,
                    create_time=now(),
                    update_time=now(),
                )
                db.add(wrong_record)
                logger.info(
                    f"添加错题记录: student_id={student_id}, question_id={params.question_id}, "
                    f"session_id={params.session_id}"
                )
            else:
                analysis = None

        # 6. 更新答题记录
        answer_record.text_answer = text_answer
        answer_record.status = 1 if is_correct else 2
        answer_record.time_spent = params.time_spent
        answer_record.submit_time = now()
        if params.audio_data:
            answer_record.audio_answer = params.audio_data

        # 7. 更新练习会话统计
        session.answer_count += 1
        if is_correct:
            session.correct_count += 1

        session.update_time = now()

        await db.commit()

        logger.info(
            f"答题提交成功: student_id={student_id}, session_id={params.session_id}, "
            f"question_id={params.question_id}, is_correct={is_correct}"
        )

        return AnswerResultSchema(
            is_correct=is_correct,
            correct_answer=question.answer,
            user_answer=text_answer,
            analysis=analysis if not is_correct else None,
        )

    except ValueError:
        raise

    except Exception as e:
        # 发生异常时回滚事务
        await db.rollback()
        logger.error(
            f"答题提交失败: student_id={student_id}, session_id={params.session_id}, "
            f"question_id={params.question_id}, error={str(e)}",
            exc_info=e,
        )
        raise ValueError(f"答题提交失败: {str(e)}")
