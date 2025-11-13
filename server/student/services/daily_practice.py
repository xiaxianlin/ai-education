"""今日练习服务"""


import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from core.database import (
    DailyPracticeSession,
    Question,
    StudentWrongQuestion,
    StudentProfile,
    StudyRecord,
    Task,
    StudentStats,
)
from admin.schema import DailyPracticeSessionSchema
from shared.utils.time import now
from shared.services.task import TaskService
from shared.services.daily_practice_generation import DailyPracticeGenerationService


class DailyPracticeService:
    """今日练习服务"""

    @staticmethod
    async def create_daily_practice(
        db: AsyncSession, student_id: str, count: int = 10, practice_type: str = "daily"
    ) -> DailyPracticeSessionSchema:
        """
        创建今日练习会话

        步骤：
        1. 获取学生学习档案
        2. 分析错题情况
        3. 识别薄弱知识点
        4. 智能选择题目（30%错题 + 40%巩固 + 20%挑战 + 10%新知）
        5. 创建练习会话
        """
        logger.info(f"为学生 {student_id} 创建今日练习，题目数：{count}")

        # 获取当前日期（YYYYMMDD格式）
        today = int(datetime.now().strftime("%Y%m%d"))

        # 检查今天是否已有未完成的练习
        existing_result = await db.execute(
            select(DailyPracticeSession).where(
                and_(
                    DailyPracticeSession.student_id == student_id,
                    DailyPracticeSession.date == today,
                    DailyPracticeSession.status == "in_progress",
                )
            )
        )
        existing_session = existing_result.scalar_one_or_none()

        if existing_session:
            logger.info(f"今天已存在未完成的练习会话: {existing_session.id}")
            return DailyPracticeSessionSchema.model_validate(existing_session)

        # 获取学生教材信息
        profile_result = await db.execute(select(StudentProfile).where(StudentProfile.student_id == student_id))
        profile = profile_result.scalar_one_or_none()

        if not profile or not profile.current_textbook_id:
            raise ValueError("请先在设置中选择当前学习教材")

        textbook_id = profile.current_textbook_id

        # 智能选择题目
        question_ids = await DailyPracticeService._select_daily_questions(db, student_id, textbook_id, count)

        if not question_ids:
            raise ValueError("暂无可用题目，请先添加题目")

        # 统计题目分布
        distribution = await DailyPracticeService._calculate_distribution(db, student_id, question_ids)

        # 创建会话
        session = DailyPracticeSession(
            student_id=student_id,
            date=today,
            practice_type=practice_type,
            total_questions=len(question_ids),
            question_ids=json.dumps(question_ids),
            question_distribution=json.dumps(distribution),
            status="in_progress",
        )

        db.add(session)
        await db.commit()
        await db.refresh(session)

        logger.info(f"今日练习会话创建成功，会话ID：{session.id}，题目分布：{distribution}")
        return DailyPracticeSessionSchema.model_validate(session)

    @staticmethod
    async def _select_daily_questions(db: AsyncSession, student_id: str, textbook_id: int, count: int) -> List[int]:
        """
        智能选择今日练习题目（优先召回数据库题目，再调用生成流程）
        """
        question_ids = await DailyPracticeGenerationService.generate_daily_practice_questions(
            db, student_id, textbook_id, count
        )

        logger.info(f"基于单元掌握度选择了 {len(question_ids)} 道题目")
        return question_ids

    @staticmethod
    async def _get_wrong_questions(db: AsyncSession, student_id: str, textbook_id: int, count: int) -> List[int]:
        """获取错题"""
        result = await db.execute(
            select(StudentWrongQuestion.question_id)
            .join(Question, Question.id == StudentWrongQuestion.question_id)
            .where(
                and_(
                    StudentWrongQuestion.student_id == student_id,
                    StudentWrongQuestion.is_mastered == 0,
                    Question.textbook_id == textbook_id,
                    Question.status == 1,
                )
            )
            .order_by(StudentWrongQuestion.last_wrong_time.desc())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def _get_consolidate_questions(
        db: AsyncSession, student_id: str, textbook_id: int, count: int, exclude_ids: List[int]
    ) -> List[int]:
        """获取巩固题目（最近答对的题目）"""
        # 获取最近答对的题目
        result = await db.execute(
            select(StudyRecord.question_id)
            .join(Question, Question.id == StudyRecord.question_id)
            .where(
                and_(
                    StudyRecord.student_id == student_id,
                    StudyRecord.is_correct == 1,
                    StudyRecord.question_id.not_in(exclude_ids) if exclude_ids else True,
                    Question.textbook_id == textbook_id,
                    Question.status == 1,
                    Question.difficulty.in_(["简单", "普通"]),
                )
            )
            .group_by(StudyRecord.question_id)
            .order_by(func.max(StudyRecord.study_date).desc())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def _get_challenge_questions(
        db: AsyncSession, textbook_id: int, count: int, exclude_ids: List[int]
    ) -> List[int]:
        """获取挑战题目（困难题）"""
        result = await db.execute(
            select(Question.id)
            .where(
                and_(
                    Question.textbook_id == textbook_id,
                    Question.difficulty == "困难",
                    Question.status == 1,
                    Question.id.not_in(exclude_ids) if exclude_ids else True,
                )
            )
            .order_by(func.random())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def _get_new_questions(
        db: AsyncSession, student_id: str, textbook_id: int, count: int, exclude_ids: List[int]
    ) -> List[int]:
        """获取新题目（从未练习过的）"""
        # 获取学生已练习过的题目ID
        practiced_result = await db.execute(
            select(StudyRecord.question_id).where(StudyRecord.student_id == student_id).distinct()
        )
        practiced_ids = [row[0] for row in practiced_result.all()]

        all_exclude_ids = list(set(exclude_ids + practiced_ids))

        result = await db.execute(
            select(Question.id)
            .where(
                and_(
                    Question.textbook_id == textbook_id,
                    Question.status == 1,
                    Question.id.not_in(all_exclude_ids) if all_exclude_ids else True,
                )
            )
            .order_by(func.random())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def _get_random_questions(
        db: AsyncSession, textbook_id: int, count: int, exclude_ids: List[int]
    ) -> List[int]:
        """获取随机题目（补充用）"""
        result = await db.execute(
            select(Question.id)
            .where(
                and_(
                    Question.textbook_id == textbook_id,
                    Question.status == 1,
                    Question.id.not_in(exclude_ids) if exclude_ids else True,
                )
            )
            .order_by(func.random())
            .limit(count)
        )
        return [row[0] for row in result.all()]

    @staticmethod
    async def _calculate_distribution(db: AsyncSession, student_id: str, question_ids: List[int]) -> Dict[str, int]:
        """计算题目来源分布"""
        # 获取错题列表
        wrong_result = await db.execute(
            select(StudentWrongQuestion.question_id).where(
                and_(
                    StudentWrongQuestion.student_id == student_id,
                    StudentWrongQuestion.question_id.in_(question_ids),
                )
            )
        )
        wrong_ids = {row[0] for row in wrong_result.all()}

        # 获取已练习题目列表
        practiced_result = await db.execute(
            select(StudyRecord.question_id)
            .where(
                and_(
                    StudyRecord.student_id == student_id,
                    StudyRecord.question_id.in_(question_ids),
                )
            )
            .distinct()
        )
        practiced_ids = {row[0] for row in practiced_result.all()}

        # 获取困难题列表
        challenge_result = await db.execute(
            select(Question.id).where(
                and_(
                    Question.id.in_(question_ids),
                    Question.difficulty == "困难",
                )
            )
        )
        challenge_ids = {row[0] for row in challenge_result.all()}

        # 统计分布
        wrong_count = len(wrong_ids)
        consolidate_count = len(practiced_ids - wrong_ids)
        challenge_count = len(challenge_ids - practiced_ids)
        new_count = len(question_ids) - len(practiced_ids)

        return {
            "wrong": wrong_count,
            "consolidate": consolidate_count,
            "challenge": challenge_count,
            "new": new_count,
        }

    @staticmethod
    async def get_practice_session(db: AsyncSession, session_id: int, student_id: str) -> Optional[Dict[str, Any]]:
        """获取练习会话详情"""
        result = await db.execute(
            select(DailyPracticeSession).where(
                and_(
                    DailyPracticeSession.id == session_id,
                    DailyPracticeSession.student_id == student_id,
                )
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            return None

        # 获取题目列表
        question_ids = json.loads(session.question_ids)
        questions_result = await db.execute(select(Question).where(Question.id.in_(question_ids)))
        questions = questions_result.scalars().all()

        # 按question_ids的顺序排序题目
        questions_dict = {q.id: q for q in questions}
        ordered_questions = [questions_dict[qid] for qid in question_ids if qid in questions_dict]

        # 获取已答题目的答案
        answers = json.loads(session.answers)

        return {
            "session": DailyPracticeSessionSchema.model_validate(session),
            "questions": [
                {
                    "id": q.id,
                    "type": q.type,
                    "subtype": q.subtype,
                    "content": q.content,
                    "options": q.options,
                    "difficulty": q.difficulty,
                    "knowledge": q.knowledge,
                    "resource": q.resource,
                    "resource_type": q.resource_type,
                    "resource_content": q.resource_content,
                    "answer": answers.get(str(q.id), {}).get("answer"),
                    "is_correct": answers.get(str(q.id), {}).get("is_correct"),
                }
                for q in ordered_questions
            ],
        }

    @staticmethod
    async def submit_answer(
        db: AsyncSession,
        student_id: str,
        session_id: int,
        question_id: int,
        answer: str,
        time_spent: int = 0,
        audio_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        提交答案
        
        如果是口语题且有 audio_url，则通过 ASR 解析录音后再对比答案
        """
        # 获取会话
        result = await db.execute(
            select(DailyPracticeSession).where(
                and_(
                    DailyPracticeSession.id == session_id,
                    DailyPracticeSession.student_id == student_id,
                )
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            raise ValueError("练习会话不存在")

        if session.status == "completed":
            raise ValueError("练习已完成，无法继续答题")

        # 获取题目
        question_result = await db.execute(select(Question).where(Question.id == question_id))
        question = question_result.scalar_one_or_none()

        if not question:
            raise ValueError("题目不存在")

        # 如果是口语题且有录音文件，通过 ASR 解析
        actual_answer = answer
        if question.type == "口语题" and audio_url:
            try:
                from shared.ai.services.aliyun import AliyunAIService
                # 通过 ASR 解析录音
                asr_text = AliyunAIService.asr(audio_url, language="zh")
                actual_answer = asr_text.strip()
                logger.info(f"口语题 ASR 解析结果: {actual_answer}")
            except Exception as e:
                logger.error(f"ASR 解析失败: {e}")
                raise ValueError(f"语音识别失败: {str(e)}")

        # 批改答案
        is_correct = DailyPracticeService._check_answer(question, actual_answer)

        # 更新会话的答案记录
        answers = json.loads(session.answers)
        answers[str(question_id)] = {
            "answer": actual_answer,
            "is_correct": is_correct,
            "time_spent": time_spent,
            "submit_time": now(),
            "audio_url": audio_url if audio_url else None,
        }
        session.answers = json.dumps(answers)
        session.update_time = now()

        await db.commit()

        logger.info(f"学生 {student_id} 提交答案，会话 {session_id}，题目 {question_id}，" f"正确：{is_correct}")

        return {
            "is_correct": is_correct,
            "correct_answer": question.answer,
            "explanation": "",
        }

    @staticmethod
    def _check_answer(question: Question, user_answer: str) -> bool:
        """检查答案是否正确"""
        if not user_answer:
            return False

        correct_answer = question.answer.strip().lower()
        user_answer = user_answer.strip().lower()

        if question.type in ["选择题", "判断题"]:
            return user_answer == correct_answer

        if question.type == "填空题":
            possible_answers = [ans.strip().lower() for ans in correct_answer.split("|")]
            return user_answer in possible_answers

        return user_answer == correct_answer

    @staticmethod
    async def complete_practice(db: AsyncSession, student_id: str, session_id: int) -> Dict[str, Any]:
        """完成练习并生成报告"""
        # 获取会话
        result = await db.execute(
            select(DailyPracticeSession).where(
                and_(
                    DailyPracticeSession.id == session_id,
                    DailyPracticeSession.student_id == student_id,
                )
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            raise ValueError("练习会话不存在")

        if session.status == "completed":
            return await DailyPracticeService._generate_report(db, session)

        # 计算统计信息
        answers = json.loads(session.answers)
        correct_count = sum(1 for ans in answers.values() if ans.get("is_correct"))
        total_time = sum(ans.get("time_spent", 0) for ans in answers.values())
        score = (correct_count / session.total_questions * 100) if session.total_questions > 0 else 0

        # 更新会话
        session.correct_questions = correct_count
        session.total_time = total_time
        session.score = score
        session.status = "completed"
        session.update_time = now()

        # 记录学习记录并更新错题库
        question_ids = json.loads(session.question_ids)

        # 统计知识点掌握情况（用于单元掌握度更新）
        knowledge_breakdown = {}
        unit_questions = {}  # 按单元分组统计

        for qid in question_ids:
            answer_data = answers.get(str(qid), {})
            if answer_data:
                # 获取题目信息
                q_result = await db.execute(select(Question).where(Question.id == qid))
                question = q_result.scalar_one_or_none()

                if question:
                    # 记录学习记录
                    study_record = StudyRecord(
                        student_id=student_id,
                        textbook_id=question.textbook_id,
                        unit_id=question.unit_id,
                        knowledge=question.knowledge,
                        question_id=qid,
                        is_correct=1 if answer_data.get("is_correct") else 0,
                        score=1.0 if answer_data.get("is_correct") else 0.0,
                        time_spent=answer_data.get("time_spent", 0),
                        study_date=now(),
                    )
                    db.add(study_record)

                    # 统计知识点掌握情况
                    if question.knowledge:
                        knowledge = question.knowledge
                        if knowledge not in knowledge_breakdown:
                            knowledge_breakdown[knowledge] = {"total": 0, "correct": 0}
                        knowledge_breakdown[knowledge]["total"] += 1
                        if answer_data.get("is_correct"):
                            knowledge_breakdown[knowledge]["correct"] += 1

                    # 按单元分组统计
                    if question.unit_id:
                        if question.unit_id not in unit_questions:
                            unit_questions[question.unit_id] = {"total": 0, "correct": 0, "knowledge_breakdown": {}}
                        unit_questions[question.unit_id]["total"] += 1
                        if answer_data.get("is_correct"):
                            unit_questions[question.unit_id]["correct"] += 1

                        # 单元内的知识点分解
                        if question.knowledge:
                            if question.knowledge not in unit_questions[question.unit_id]["knowledge_breakdown"]:
                                unit_questions[question.unit_id]["knowledge_breakdown"][question.knowledge] = {
                                    "total": 0,
                                    "correct": 0,
                                }
                            unit_questions[question.unit_id]["knowledge_breakdown"][question.knowledge]["total"] += 1
                            if answer_data.get("is_correct"):
                                unit_questions[question.unit_id]["knowledge_breakdown"][question.knowledge][
                                    "correct"
                                ] += 1

        await db.commit()

        # 更新单元掌握度（按单元分组更新）
        from shared.services.unit_mastery_service import UnitMasteryService

        for unit_id, unit_stats in unit_questions.items():
            unit_score = (unit_stats["correct"] / unit_stats["total"] * 100) if unit_stats["total"] > 0 else 0
            await UnitMasteryService.update_mastery(
                db,
                student_id=student_id,
                unit_id=unit_id,
                score=unit_score,
                total_questions=unit_stats["total"],
                correct_count=unit_stats["correct"],
                knowledge_breakdown=unit_stats["knowledge_breakdown"],
            )

        await db.refresh(session)

        logger.info(
            f"学生 {student_id} 完成今日练习，会话 {session_id}，"
            f"正确率：{correct_count}/{session.total_questions}，得分：{score:.1f}"
        )

        return await DailyPracticeService._generate_report(db, session)

    @staticmethod
    async def _generate_report(db: AsyncSession, session: DailyPracticeSession) -> Dict[str, Any]:
        """生成练习报告"""
        answers = json.loads(session.answers)
        question_ids = json.loads(session.question_ids)
        distribution = json.loads(session.question_distribution)

        # 获取题目详情
        questions_result = await db.execute(select(Question).where(Question.id.in_(question_ids)))
        questions = {q.id: q for q in questions_result.scalars().all()}

        # 统计各知识点的掌握情况
        knowledge_stats = {}
        for qid_str, answer_data in answers.items():
            qid = int(qid_str)
            if qid not in questions:
                continue

            question = questions[qid]
            knowledge = question.knowledge or "未分类"

            if knowledge not in knowledge_stats:
                knowledge_stats[knowledge] = {"total": 0, "correct": 0}

            knowledge_stats[knowledge]["total"] += 1
            if answer_data.get("is_correct"):
                knowledge_stats[knowledge]["correct"] += 1

        knowledge_coverage = {
            k: {
                "total": v["total"],
                "correct": v["correct"],
                "rate": v["correct"] / v["total"] if v["total"] > 0 else 0,
            }
            for k, v in knowledge_stats.items()
        }

        # 更新会话的知识点覆盖
        session.knowledge_coverage = json.dumps(knowledge_coverage)
        await db.commit()

        return {
            "session_id": session.id,
            "date": session.date,
            "total_questions": session.total_questions,
            "correct_questions": session.correct_questions,
            "score": session.score,
            "total_time": session.total_time,
            "knowledge_coverage": knowledge_coverage,
            "question_distribution": distribution,
            "status": session.status,
        }

    @staticmethod
    async def get_practice_history(db: AsyncSession, student_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        """获取练习历史"""
        result = await db.execute(
            select(DailyPracticeSession)
            .where(DailyPracticeSession.student_id == student_id)
            .order_by(DailyPracticeSession.date.desc())
            .limit(limit)
        )
        sessions = result.scalars().all()

        return [
            {
                "id": s.id,
                "date": s.date,
                "total_questions": s.total_questions,
                "correct_questions": s.correct_questions,
                "score": s.score,
                "total_time": s.total_time,
                "practice_type": s.practice_type,
                "status": s.status,
            }
            for s in sessions
        ]

    @staticmethod
    async def check_or_create_today_practice(db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """
        检查或创建今日练习（30道题）

        逻辑：
        1. 检查今天是否已有30道题的练习
        2. 如果有以前生成的但未完成，则更新为今日练习，重置进度
        3. 如果没有，则在后台任务生成
        """
        today = int(datetime.now().strftime("%Y%m%d"))

        # 检查今天是否已有30道题的练习
        today_result = await db.execute(
            select(DailyPracticeSession)
            .where(
                and_(
                    DailyPracticeSession.student_id == student_id,
                    DailyPracticeSession.date == today,
                    DailyPracticeSession.total_questions == 30,
                )
            )
            .order_by(DailyPracticeSession.create_time.desc())
        )
        today_session = today_result.scalars().first()

        if today_session:
            # 如果已完成，直接返回
            if today_session.status == "completed":
                return {
                    "session": DailyPracticeSessionSchema.model_validate(today_session),
                    "task_id": None,
                    "status": "ready",
                    "progress": 100,
                }
            # 如果进行中，返回会话信息
            return {
                "session": DailyPracticeSessionSchema.model_validate(today_session),
                "task_id": None,
                "status": "ready",
                "progress": 100,
            }

        # 检查是否有以前生成的但未完成的练习（非今日，且未完成）
        old_result = await db.execute(
            select(DailyPracticeSession)
            .where(
                and_(
                    DailyPracticeSession.student_id == student_id,
                    DailyPracticeSession.date != today,
                    DailyPracticeSession.status == "in_progress",
                    DailyPracticeSession.total_questions == 30,
                )
            )
            .order_by(DailyPracticeSession.date.desc())
        )
        old_session = old_result.scalars().first()

        if old_session:
            # 更新为今日练习，重置进度
            old_session.date = today
            old_session.status = "in_progress"
            old_session.correct_questions = 0
            old_session.total_time = 0
            old_session.score = 0.0
            old_session.answers = "{}"
            old_session.update_time = now()
            await db.commit()
            await db.refresh(old_session)

            logger.info(f"更新旧练习为今日练习: {old_session.id}")
            return {
                "session": DailyPracticeSessionSchema.model_validate(old_session),
                "task_id": None,
                "status": "ready",
                "progress": 100,
            }

        # 检查是否已有正在生成的任务（今日的）
        import json

        task_result = await db.execute(
            select(Task)
            .where(
                and_(
                    Task.task_type == "daily_practice",
                    Task.status.in_(["pending", "running"]),
                )
            )
            .order_by(Task.create_time.desc())
        )
        all_tasks = task_result.scalars().all()

        # 检查是否有今日的任务
        for task in all_tasks:
            try:
                task_params = json.loads(task.params)
                task_student_id = task_params.get("student_id")
                task_date = task_params.get("date", 0)

                if task_student_id == student_id and task_date == today:
                    # 已有今日的生成任务
                    return {
                        "session": None,
                        "task_id": task.id,
                        "status": task.status,
                        "progress": task.progress,
                    }
            except:
                continue

        # 创建后台任务生成今日练习
        task = await TaskService.create_task(
            db,
            task_type="daily_practice",
            task_name=f"为学生 {student_id} 生成今日练习（30道题）",
            params={
                "student_id": student_id,
                "date": today,
                "count": 30,
            },
            handler_module="student.services.daily_practice",
            handler_function="generate_daily_practice_task",
        )

        logger.info(f"创建今日练习生成任务: {task.id} for student {student_id}")

        return {
            "session": None,
            "task_id": task.id,
            "status": task.status,
            "progress": task.progress,
        }

    @staticmethod
    async def get_generation_progress(db: AsyncSession, student_id: str, task_id: int) -> Dict[str, Any]:
        """获取今日练习生成进度"""
        task = await TaskService.get_task(db, task_id)

        if not task:
            return {
                "status": "not_found",
                "progress": 0,
            }

        # 如果任务完成，检查是否已创建会话
        if task.status == "completed":
            import json

            task_result = json.loads(task.result)
            session_id = task_result.get("session_id")

            if session_id:
                session_result = await db.execute(
                    select(DailyPracticeSession).where(DailyPracticeSession.id == session_id)
                )
                session = session_result.scalar_one_or_none()

                if session:
                    return {
                        "status": "completed",
                        "progress": 100,
                        "session": DailyPracticeSessionSchema.model_validate(session),
                    }

        return {
            "status": task.status,
            "progress": task.progress,
            "error_message": task.error_message,
        }

    @staticmethod
    async def get_today_stats(db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """
        获取今日练习统计数据
        
        返回：
        - today_progress: 今日进度（百分比）
        - daily_questions: 今日题目总数
        - completed_questions: 已完成题目数
        - consecutive_days: 连续天数
        - total_practice: 累计练习次数
        """
        today = int(datetime.now().strftime("%Y%m%d"))
        
        # 获取今日练习会话
        today_result = await db.execute(
            select(DailyPracticeSession)
            .where(
                and_(
                    DailyPracticeSession.student_id == student_id,
                    DailyPracticeSession.date == today,
                )
            )
            .order_by(DailyPracticeSession.create_time.desc())
        )
        today_session = today_result.scalar_one_or_none()
        
        # 计算今日进度
        daily_questions = 0
        completed_questions = 0
        today_progress = 0
        
        if today_session:
            daily_questions = today_session.total_questions or 0
            # 从 answers 中计算已完成题目数
            if today_session.answers:
                try:
                    answers = json.loads(today_session.answers)
                    completed_questions = len(answers)
                except:
                    completed_questions = 0
            
            # 如果已完成，已完成数等于总题目数
            if today_session.status == "completed":
                completed_questions = daily_questions
            
            # 计算进度百分比
            if daily_questions > 0:
                today_progress = round((completed_questions / daily_questions) * 100)
        
        # 获取学生统计信息
        stats_result = await db.execute(
            select(StudentStats).where(StudentStats.student_id == student_id)
        )
        stats = stats_result.scalar_one_or_none()
        
        consecutive_days = stats.current_streak if stats else 0
        total_practice = stats.total_practice if stats else 0
        
        return {
            "today_progress": today_progress,
            "daily_questions": daily_questions,
            "completed_questions": completed_questions,
            "consecutive_days": consecutive_days,
            "total_practice": total_practice,
        }


# ============================================================================
# 模块级别的任务处理器函数（供task_worker调用）
# 注意：这个函数会被task_worker在协程中调用，需要确保所有依赖都正确导入
# 不使用类型注解，避免在导入时的类型解析问题
# ============================================================================
async def generate_daily_practice_task(db, params):
    """
    后台任务：生成今日练习（30道题）

    注意：这个函数会被task_executor在协程中调用，params中可能包含task_id
    
    Args:
        db: AsyncSession 数据库会话
        params: Dict 包含 student_id, date, count, task_id 等参数
    
    Returns:
        Dict 包含 session_id, student_id, date, total_questions
    """
    # 确保所有必要的导入在函数内部可用（避免导入时的问题）
    # 这样可以避免模块级别的导入问题，特别是 from __future__ import annotations 的影响
    # 注意：DailyPracticeService 已经在模块级别可用，不需要重新导入
    import json
    from sqlalchemy import select
    from core.database import DailyPracticeSession, StudentProfile
    from shared.services.task import TaskService
    from loguru import logger
    
    student_id = params.get("student_id")
    date = params.get("date")
    count = params.get("count", 30)
    task_id = params.get("task_id")  # 从任务参数中获取task_id

    if not student_id or not date:
        raise ValueError("缺少必要参数: student_id 或 date")

    logger.info(f"开始生成今日练习: student_id={student_id}, date={date}, count={count}, task_id={task_id}")

    # 更新任务进度
    if task_id:
        await TaskService.update_task_progress(db, task_id, 10)

    # 获取学生教材信息
    profile_result = await db.execute(select(StudentProfile).where(StudentProfile.student_id == student_id))
    profile = profile_result.scalar_one_or_none()

    if not profile or not profile.current_textbook_id:
        raise ValueError("请先在设置中选择当前学习教材")

    textbook_id = profile.current_textbook_id

    if task_id:
        await TaskService.update_task_progress(db, task_id, 30)

    # 智能选择题目
    question_ids = await DailyPracticeService._select_daily_questions(db, student_id, textbook_id, count)

    if not question_ids:
        raise ValueError("暂无可用题目，请先添加题目")

    if task_id:
        await TaskService.update_task_progress(db, task_id, 70)

    # 统计题目分布
    distribution = await DailyPracticeService._calculate_distribution(db, student_id, question_ids)

    # 创建会话
    session = DailyPracticeSession(
        student_id=student_id,
        date=date,
        practice_type="daily",
        total_questions=len(question_ids),
        question_ids=json.dumps(question_ids),
        question_distribution=json.dumps(distribution),
        status="in_progress",
    )

    db.add(session)
    await db.commit()
    await db.refresh(session)

    if task_id:
        await TaskService.update_task_progress(db, task_id, 100)

    logger.info(f"今日练习生成成功，会话ID：{session.id}")

    return {
        "session_id": session.id,
        "student_id": student_id,
        "date": date,
        "total_questions": len(question_ids),
    }
