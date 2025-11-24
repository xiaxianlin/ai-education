from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, StudentTextbook
from shared.utils.time import now, today
from shared.question.graph import invoke_generate_workflow


class PracticeService:

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
                select(StudentTextbook).where(
                    StudentTextbook.student_id == student_id, StudentTextbook.active == 1
                )
            )
            if student_textbook:
                session_textbook_id = student_textbook.textbook_id

        # 1. 生成开始前，先创建会话记录
        session = PracticeSession(
            student_id=student_id,
            session_type=type,
            target_id=today(),
            textbook_id=session_textbook_id,
            question_count=0,
        )
        db.add(session)
        await db.flush()
        await db.commit()

        logger.info(f"开始生成练习会话: session_id={session.id}, type={type}")

        try:
            # 2. 调用 invoke_generate_workflow 生成题目
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

            # 3. 题目生成完成，更新状态为"生成完成"（4）
            session.question_count = len(question_ids)
            session.update_time = now()
            db.add(session)
            await db.flush()
            await db.commit()

            logger.info(
                f"题目生成完成: session_id={session.id}, question_count={len(question_ids)}"
            )

            # 4. 预生成答题记录
            await PracticeService.prepare_records(db, session.id, question_ids)

            # 5. 答题记录预生成完成
            session.generate_status = 1
            session.update_time = now()
            db.add(session)
            await db.commit()

            logger.info(
                f"练习会话生成完成: session_id={session.id}, question_count={len(question_ids)}"
            )

        except Exception as e:
            # 6. 生成失败后，更新状态为"生成失败"
            logger.error(f"生成练习会话失败: session_id={session.id}, error={e}")
            try:
                session.generate_status = -1
                db.add(session)
                await db.commit()
            except Exception as commit_error:
                logger.error(f"更新失败状态失败: session_id={session.id}, error={commit_error}")
                await db.rollback()
            raise ValueError(f"会话生成失败: {str(e)}")

        # 7. 返回会话ID
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

        if session.generate_status == 0:
            raise ValueError("当前练习正在生成中，请稍后重试")

        session.generate_status = 0
        session.update_time = now()
        db.add(session)
        await db.commit()

        logger.info(f"开始重新生成练习会话: session_id={session_id}, type={type}")

        try:
            # 2. 调用 invoke_generate_workflow 生成题目
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

            # 3. 题目生成完成，更新状态为"生成完成"（4）
            session.question_count = len(question_ids)
            session.status = 4  # 4表示生成完成
            session.correct_count = 0
            session.start_time = 0
            session.answer_count = 0
            session.update_time = now()
            db.add(session)
            await db.flush()
            await db.commit()

            logger.info(
                f"题目生成完成: session_id={session_id}, question_count={len(question_ids)}"
            )

            # 4. 预生成答题记录
            await PracticeService.prepare_records(db, session.id, question_ids)

            # 5. 答题记录预生成完成，更新状态为"未开始"（0），可以开始答题
            session.status = 0  # 0表示未开始，可以开始答题
            session.update_time = now()
            db.add(session)
            await db.commit()

            logger.info(
                f"练习会话重新生成完成: session_id={session_id}, question_count={len(question_ids)}"
            )

        except Exception as e:
            # 6. 生成失败后，更新状态为"生成失败"（5）
            logger.error(f"重新生成练习会话失败: session_id={session_id}, error={e}")
            try:
                session.status = 5  # 5表示生成失败
                session.update_time = now()
                db.add(session)
                await db.commit()
            except Exception as commit_error:
                logger.error(f"更新失败状态失败: session_id={session_id}, error={commit_error}")
                await db.rollback()
            raise ValueError(f"会话重新生成失败: {str(e)}")

        # 7. 返回会话ID
        return session.id
