from typing import List
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeAnswer


class PracticeSerivce:

    def create():
        pass

    @staticmethod
    async def create_answer_records(
        db: AsyncSession,
        session_id: int,
        question_ids: List[int],
    ) -> None:
        """
        预生成答题记录

        Args:
            db: 数据库会话
            session_id: 会话ID
            question_ids: 题目ID列表（按顺序）
        """
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
