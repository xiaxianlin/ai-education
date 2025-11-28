from loguru import logger
from sqlalchemy import select, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, Question, StudentTextbook, PracticeAnswer, Unit
from shared.utils.time import now, today
from shared.question.graph import invoke_generate_workflow


class PracticeService:

    @staticmethod
    async def create_answer_records(db: AsyncSession, session_id: int, questions: list[Question]):
        """为练习会话创建答题记录"""

        await db.execute(delete(PracticeAnswer).where(PracticeAnswer.session_id == session_id))
        await db.flush()  # 确保删除操作完成

        # 批量创建答题记录
        answer_records = []
        for question, index in questions:
            answer_record = PracticeAnswer(
                session_id=session_id,
                question_id=question.id,
                question_order=index + 1,
                status=0,
                time_spent=0,
            )
            answer_records.append(answer_record)

        db.add_all(answer_records)

        logger.info(f"预生成答题记录完成: session_id={session_id}, count={len(answer_records)}")

    @staticmethod
    async def generate_practice_session(
        *,
        db: AsyncSession,
        type: str,
        count: int,
        student_id: str,
        texbook_id: int,
        unit_id: int | None = None,
    ):
        student_textbook = await db.scalar(
            select(StudentTextbook).where(
                StudentTextbook.student_id == student_id, StudentTextbook.texbook_id == texbook_id
            )
        )

        if not student_textbook:
            raise ValueError("未找到学生相应的教材")

        textbook_id = student_textbook.textbook_id

        try:
            # 生成开始前，先创建会话记录
            target_id = unit_id if type == "unit_practice" and unit_id else today()
            session = PracticeSession(
                student_id=student_id,
                session_type=type,
                target_id=target_id,
                textbook_id=textbook_id,
            )
            db.add(session)
            await db.flush()

            logger.info(f"开始生成练习会话: session_id={session.id}, type={type}")

            # 调用 invoke_generate_workflow 生成题目
            questions = await invoke_generate_workflow(
                db=db,
                type=type,
                count=count,
                unit_id=unit_id,
                textbook_id=textbook_id,
                student_id=student_id,
            )
            await PracticeService.create_answer_records(db, session.id, questions)

            session.question_count = len(questions)
            session.generate_status = 1
            session.update_time = now()
            await db.commit()

            logger.info(
                f"练习会话生成完成: session_id={session.id}, question_count={session.question_count}"
            )
            return session
        except Exception as e:
            # 生成失败后，更新状态为"生成失败"
            logger.error(f"生成练习会话失败: session_id={session.id}, error={e}")
            await db.rollback()
            raise ValueError(f"会话生成失败: {str(e)}")

    @staticmethod
    async def regenerate_practice_session(db: AsyncSession, session_id: int):
        # 查询练习会话
        session = await db.scalar(select(PracticeSession).where(PracticeSession.id == session_id))
        if not session:
            raise ValueError("当前练习不存在")

        if session.generate_status == 0:
            raise ValueError("当前练习正在生成中，请稍后重试")

        try:
            # 更新练习会话状态
            session.generate_status = 0
            session.question_count = 0
            session.correct_count = 0
            session.start_time = 0
            session.answer_count = 0

            logger.info(f"开始重新生成练习会话: session_id={session_id}, type={type}")

            unit_id = session.target_id if session.session_type == "unit_practice" else None

            questions = await invoke_generate_workflow(
                db=db,
                type=session.session_type,
                count=session.question_count,
                unit_id=unit_id,
                textbook_id=session.textbook_id,
                student_id=session.student_id,
            )
            await PracticeService.create_answer_records(db, session.id, questions)

            session.question_count = len(questions)
            session.generate_status = 1
            await db.commit()

            logger.info(
                f"练习会话重新生成完成: session_id={session_id}, question_count={session.question_count}"
            )
            return session
        except Exception as e:
            logger.error(f"重新生成练习会话失败: session_id={session_id}, error={e}")
            await db.rollback()
            raise ValueError(f"会话重新生成失败: {str(e)}")

    async def create_daily_practice(
        *,
        db: AsyncSession,
        student_id: str,
        texbook_id: int,
        count: int,
    ):
        """为学生生成每日练习"""
        current_date = today()

        session = await db.scalar(
            select(PracticeSession).where(
                PracticeSession.student_id == student_id,
                PracticeSession.texbook_id == texbook_id,
                PracticeSession.session_type == "daily_practice",
                PracticeSession.target_id == current_date,
            )
        )

        if session:
            raise ValueError("当天每日练习已存在")

        uncompleted_session = await db.scalar(
            select(PracticeSession)
            .where(
                PracticeSession.student_id == student_id,
                PracticeSession.texbook_id == texbook_id,
                PracticeSession.session_type == "daily_practice",
                PracticeSession.status != 2,
            )
            .order_by(desc(PracticeSession.create_time))
        )

        if uncompleted_session:

            logger.info(
                f"找到未完成的每日练习，准备重置: student_id={student_id},session_id={uncompleted_session.id}"
            )

            try:
                # 重置所有答题记录的信息
                answer_records = await db.scalars(
                    select(PracticeAnswer).where(
                        PracticeAnswer.session_id == uncompleted_session.id
                    )
                )
                for answer in answer_records.all():
                    answer.text_answer = None
                    answer.status = 0
                    answer.time_spent = 0
                    answer.submit_time = None
                    answer.audio_answer = None

                # 重置进度并更新为当天的每日练习
                uncompleted_session.target_id = current_date
                uncompleted_session.status = 0
                uncompleted_session.answer_count = 0
                uncompleted_session.correct_count = 0
                uncompleted_session.start_time = 0
                uncompleted_session.end_time = None

                await db.commit()

                logger.info(
                    f"未完成每日练习已重置为当天:student_id={student_id}, session_id={uncompleted_session.id}"
                )

                return uncompleted_session.id

            except Exception as e:
                await db.rollback()
                logger.error(
                    f"重置未完成每日练习失败: student_id={student_id}, session_id={uncompleted_session.id}, error={e}"
                )
                raise ValueError(f"重置未完成每日练习失败: {str(e)}")

        logger.info(f"开始创建每日练习: student_id={student_id}")
        session = await PracticeService.generate_practice_session(
            db=db, type="daily_practice", count=count, student_id=student_id, texbook_id=texbook_id
        )

        return session.id

    async def create_unit_practice(
        *,
        db: AsyncSession,
        student_id: str,
        texbook_id: int,
        unit_id: int,
        count: int,
    ):
        """为学生生成单元练习"""

        # 获取单元信息
        unit = await db.scalar(select(Unit).where(Unit.id == unit_id))

        if not unit:
            raise ValueError("单元不存在")

        # 检查是否已存在未完成的单元练习
        session = await db.scalar(
            select(PracticeSession).where(
                PracticeSession.student_id == student_id,
                PracticeSession.texbook_id == texbook_id,
                PracticeSession.session_type == "unit_practice",
                PracticeSession.target_id == unit_id,
                PracticeSession.status != 2,
            )
        )

        if session:
            raise ValueError("还存在未完成的单元练习，请先删除")

        logger.info(f"开始创建单元练习: student_id={student_id}, unit_id={unit_id}")

        session = await PracticeService.generate_practice_session(
            db=db,
            type="unit_practice",
            count=count,
            unit_id=unit_id,
            textbook_id=texbook_id,
            student_id=student_id,
        )

        logger.info(
            f"单元练习创建成功: student_id={student_id}, session_id={session.id}, unit_id={unit_id}"
        )

        return session.id

    async def create_assessment(
        *,
        db: AsyncSession,
        student_id: str,
        texbook_id: int,
        count: int,
    ):
        """为学生生成能力评测"""

        session = await db.scalar(
            select(PracticeSession).where(
                PracticeSession.student_id == student_id,
                PracticeSession.texbook_id == texbook_id,
                PracticeSession.session_type == "assessment",
                PracticeSession.status != 2,
            )
        )

        if session:
            raise ValueError("还存在未完成的能力评测，请先删除")

        logger.info(f"开始创建能力评测: student_id={student_id}")

        session = await PracticeService.generate_practice_session(
            db=db,
            type="assessment",
            count=count,
            student_id=student_id,
            texbook_id=texbook_id,
        )

        return session.id
