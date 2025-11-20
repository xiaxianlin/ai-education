from typing import List
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeAnswer, PracticeSession
from shared.utils.time import today
from shared.question.graph import invoke_generate_workflow
from shared.question.types import GenerationType


class PracticeService:

    @staticmethod
    async def create_answer_records(db: AsyncSession, session_id: int, question_ids: List[int]):
        """预生成答题记录"""
        try:
            # 先删除可能存在的旧记录（避免重复）
            await db.execute(
                PracticeAnswer.__table__.delete().where(PracticeAnswer.session_id == session_id)
            )

            # 创建新的答题记录
            answer_records = []
            for order, question_id in enumerate(question_ids, 1):
                answer_record = PracticeAnswer(
                    session_id=session_id,
                    question_id=question_id,
                    question_order=order,
                    is_correct=0,  # 0表示未答
                )
                answer_records.append(answer_record)

            db.add_all(answer_records)
            await db.commit()

            logger.info(f"预生成答题记录: session_id={session_id}, count={len(answer_records)}")

        except Exception as e:
            logger.error(f"预生成答题记录失败: session_id={session_id}, error={e}")
            await db.rollback()
            raise

    @staticmethod
    async def create_daily_practice_session(
        db: AsyncSession,
        student_id: str,
        subject: str,
        grade: int,
        textbook_id: int,
        count: int = 30,
        recall_count: int = 15,
    ) -> PracticeSession:
        # 1. 调用 invoke_generate_workflow 生成题目
        result = await invoke_generate_workflow(
            db=db,
            count=count,
            generation_type=GenerationType.DAILY_PRACTICE.value,
            subject=subject,
            grade=grade,
            textbook_id=textbook_id,
            student_id=student_id,
            recall_count=recall_count,
        )

        generated_questions = result.get("saved_questions", [])
        question_ids = [q.id for q in generated_questions]

        # 2. 创建会话
        session = PracticeSession(
            student_id=student_id,
            session_type="daily",
            target_id=today(),
            textbook_id=textbook_id,
            question_count=len(question_ids),
            status="in_progress",
        )
        db.add(session)
        await db.flush()

        # 3. 预生成答题记录
        await PracticeService.create_answer_records(db, session.id, question_ids)

        # 4. 返回会话
        return session
