from typing import List
from loguru import logger
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeAnswer, PracticeSession, StudentTextbook
from shared.utils.time import now, today
from shared.question.graph import invoke_generate_workflow


class PracticeService:

    @staticmethod
    async def prepare_records(db: AsyncSession, session_id: int, question_ids: List[int]):
        """预生成答题记录"""

        # 先删除可能存在的旧记录（避免重复）
        await db.execute(delete(PracticeAnswer).where(PracticeAnswer.session_id == session_id))

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

        logger.info(f"预生成答题记录: session_id={session_id}, count={len(answer_records)}")

    @staticmethod
    async def generate_practice_session(
        *,
        db: AsyncSession,
        type: str,
        count: int = 30,
        unit_id: int | None = None,
        textbook_id: int | None = None,
        student_id: str | None = None,
    ):
        # 对于能力评估，如果没有传入 textbook_id，从学生的激活教材获取
        # 注意：这个 textbook_id 仅用于创建 PracticeSession，不传递给 invoke_generate_workflow
        session_textbook_id = textbook_id
        if type == "assessment" and session_textbook_id is None and student_id:
            student_textbook = await db.scalar(
                select(StudentTextbook)
                .where(StudentTextbook.student_id == student_id, StudentTextbook.active == 1)
            )
            if student_textbook:
                session_textbook_id = student_textbook.textbook_id
        
        # 1. 调用 invoke_generate_workflow 生成题目
        # 能力评估不传 textbook_id，由工作流内部通过 student_id 获取
        # recall_count 从环境变量读取，能力评估类型不使用召回题目
        questions = await invoke_generate_workflow(
            db=db,
            type=type,
            count=count,
            unit_id=unit_id,
            textbook_id=textbook_id if type != "assessment" else None,
            student_id=student_id,
        )

        question_ids = [q.id for q in questions]

        try:
            # 2. 创建会话
            session = PracticeSession(
                student_id=student_id,
                session_type=type,
                target_id=today(),
                textbook_id=session_textbook_id,
                question_count=len(question_ids),
                status=0,
            )
            db.add(session)
            await db.flush()

            # 3. 预生成答题记录
            await PracticeService.prepare_records(db, session.id, question_ids)
            await db.commit()
        except Exception as e:
            logger.error(f"预生成答题记录失败: session_id={session.id}, error={e}")
            await db.rollback()
            raise ValueError("会话创建失败")
        # 4. 返回会话
        return session.id

    @staticmethod
    async def regenerate_practice_session(
        *,
        session_id: int,
        db: AsyncSession,
        type: str,
        count: int = 30,
        unit_id: int | None = None,
        textbook_id: int | None = None,
        student_id: str | None = None,
    ):

        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))
        if not session:
            raise ValueError("当前练习不存在")

        # recall_count 从环境变量读取，能力评估类型不使用召回题目
        questions = await invoke_generate_workflow(
            db=db,
            type=type,
            count=count,
            unit_id=unit_id,
            textbook_id=textbook_id,
            student_id=student_id,
        )

        question_ids = [q.id for q in questions]

        try:
            session.question_count = len(question_ids)
            session.status = 0
            session.correct_count = 0
            session.start_time = 0
            session.answer_count = 0
            session.update_time = now()
            db.add(session)
            await db.flush()

            # 3. 预生成答题记录
            await PracticeService.prepare_records(db, session.id, question_ids)
            await db.commit()
        except Exception as e:
            logger.error(f"预生成答题记录失败: session_id={session.id}, error={e}")
            await db.rollback()
            raise ValueError("会话创建失败")
        # 4. 返回会话
        return session.id
