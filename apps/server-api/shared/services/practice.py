import uuid
import asyncio
from loguru import logger
from sqlalchemy import select, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import PracticeSession, Question, Textbook, PracticeAnswer, Unit
from core.constants import GENERATE_QUESTION_COUNT
from shared.utils.time import now, today
from core.task_client import TaskServiceClient


class PracticeService:

    @staticmethod
    async def create_answer_records(db: AsyncSession, session_id: int, questions: list[Question]):
        """为练习会话创建答题记录"""

        await db.execute(delete(PracticeAnswer).where(PracticeAnswer.session_id == session_id))
        await db.flush()  # 确保删除操作完成

        # 批量创建答题记录
        answer_records = []
        for index, question in enumerate(questions):
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
        student_id: str,
        textbook_id: int,
        unit_id: int | None = None,
    ):

        textbook = await db.scalar(select(Textbook).where(Textbook.id == textbook_id))

        if not textbook:
            raise ValueError("教材不纯粹")
        unit = None
        target_id = today()
        if type == "unit_practice":
            unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
            target_id = unit_id
        # 生成开始前，先创建会话记录
        session = PracticeSession(
            student_id=student_id,
            session_type=type,
            target_id=target_id,
            textbook_id=textbook_id,
        )
        db.add(session)
        await db.flush()

        try:
            count = GENERATE_QUESTION_COUNT[textbook.grade][type]
            if not count:
                raise ValueError("生成数量异常")

            logger.info(f"开始生成练习会话: session_id={session.id}, type={type}")
            
            # 提交任务到 server-task
            task_id = str(uuid.uuid4())
            task_client = TaskServiceClient()
            
            payload = {
                "type": type,
                "count": count,
                "textbook_id": textbook.id,
                "student_id": student_id,
            }
            if unit:
                payload["unit_id"] = unit.id
            
            await task_client.submit_task(
                task_id=task_id,
                task_type="question_generation",
                payload=payload,
                timeout=600,
            )
            
            # 轮询任务状态直到完成
            max_wait_time = 600
            poll_interval = 2
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                status = await task_client.get_task_status(task_id)
                if not status:
                    raise ValueError("任务不存在")
                
                task_status = status.get("status")
                if task_status == "completed":
                    # 从数据库查询生成的题目（根据类型和参数）
                    query = select(Question).where(Question.textbook_id == textbook.id)
                    if unit:
                        query = query.where(Question.unit_id == unit.id)
                    query = query.order_by(Question.id.desc()).limit(count)
                    questions_result = await db.scalars(query)
                    questions = questions_result.all()
                    break
                elif task_status == "failed":
                    error_msg = status.get("error", "未知错误")
                    raise ValueError(f"题目生成失败: {error_msg}")
                
                await asyncio.sleep(poll_interval)
                elapsed_time += poll_interval
            else:
                raise ValueError("题目生成超时")

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
            logger.error(f"生成练习会话失败: session_id={session.id}, error={e}")
            await db.rollback()
            await db.delete(session)
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

            logger.info(f"开始重新生成练习会话: session_id={session_id}, type={session.session_type}")

            unit_id = session.target_id if session.session_type == "unit_practice" else None

            # 提交任务到 server-task
            task_id = str(uuid.uuid4())
            task_client = TaskServiceClient()
            
            payload = {
                "type": session.session_type,
                "count": session.question_count,
                "textbook_id": session.textbook_id,
                "student_id": session.student_id,
            }
            if unit_id:
                payload["unit_id"] = unit_id
            
            await task_client.submit_task(
                task_id=task_id,
                task_type="question_generation",
                payload=payload,
                timeout=600,
            )
            
            # 轮询任务状态直到完成
            max_wait_time = 600
            poll_interval = 2
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                status = await task_client.get_task_status(task_id)
                if not status:
                    raise ValueError("任务不存在")
                
                task_status = status.get("status")
                if task_status == "completed":
                    # 从数据库查询生成的题目
                    query = select(Question).where(Question.textbook_id == session.textbook_id)
                    if unit_id:
                        query = query.where(Question.unit_id == unit_id)
                    query = query.order_by(Question.id.desc()).limit(session.question_count)
                    questions_result = await db.scalars(query)
                    questions = questions_result.all()
                    break
                elif task_status == "failed":
                    error_msg = status.get("error", "未知错误")
                    raise ValueError(f"题目生成失败: {error_msg}")
                
                await asyncio.sleep(poll_interval)
                elapsed_time += poll_interval
            else:
                raise ValueError("题目生成超时")
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
        *, db: AsyncSession, student_id: str, textbook_id: int, **kwargs
    ):
        """为学生生成每日练习"""
        current_date = today()

        session = await db.scalar(
            select(PracticeSession).where(
                PracticeSession.student_id == student_id,
                PracticeSession.textbook_id == textbook_id,
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
                PracticeSession.textbook_id == textbook_id,
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
            db=db,
            type="daily_practice",
            student_id=student_id,
            textbook_id=textbook_id,
        )

        return session.id

    async def create_unit_practice(
        *, db: AsyncSession, student_id: str, textbook_id: int, unit_id: int, **kwargs
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
                PracticeSession.textbook_id == textbook_id,
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
            unit_id=unit_id,
            textbook_id=textbook_id,
            student_id=student_id,
        )

        logger.info(
            f"单元练习创建成功: student_id={student_id}, session_id={session.id}, unit_id={unit_id}"
        )

        return session.id

    async def create_assessment(*, db: AsyncSession, student_id: str, textbook_id: int, **kwargs):
        """为学生生成能力评测"""

        session = await db.scalar(
            select(PracticeSession).where(
                PracticeSession.student_id == student_id,
                PracticeSession.textbook_id == textbook_id,
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
            student_id=student_id,
            textbook_id=textbook_id,
        )

        return session.id
