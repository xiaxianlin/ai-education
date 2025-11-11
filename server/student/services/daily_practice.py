"""今日练习服务"""
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from common.database import (
    DailyPracticeSession,
    Question,
    StudentWrongQuestion,
    StudentProfile,
    StudyRecord,
)
from admin.schema import (
    DailyPracticeSessionSchema,
    CreateDailyPracticeSchema,
    SubmitDailyPracticeAnswerSchema,
)
from utils.time import now


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
        profile_result = await db.execute(
            select(StudentProfile).where(StudentProfile.student_id == student_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile or not profile.current_textbook_id:
            raise ValueError("请先在设置中选择当前学习教材")
        
        textbook_id = profile.current_textbook_id
        
        # 智能选择题目
        question_ids = await DailyPracticeService._select_daily_questions(
            db, student_id, textbook_id, count
        )
        
        if not question_ids:
            raise ValueError("暂无可用题目，请先添加题目")
        
        # 统计题目分布
        distribution = await DailyPracticeService._calculate_distribution(
            db, student_id, question_ids
        )
        
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
    async def _select_daily_questions(
        db: AsyncSession, student_id: str, textbook_id: int, count: int
    ) -> List[int]:
        """
        智能选择今日练习题目（基于单元掌握度，优化SQL查询）
        """
        from common.services.unit_based_question_service import UnitBasedQuestionService
        
        question_ids = await UnitBasedQuestionService.generate_daily_practice_questions(
            db, student_id, textbook_id, count
        )
        
        logger.info(f"基于单元掌握度选择了 {len(question_ids)} 道题目")
        return question_ids

    @staticmethod
    async def _get_wrong_questions(
        db: AsyncSession, student_id: str, textbook_id: int, count: int
    ) -> List[int]:
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
            select(StudyRecord.question_id).where(
                StudyRecord.student_id == student_id
            ).distinct()
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
    async def _calculate_distribution(
        db: AsyncSession, student_id: str, question_ids: List[int]
    ) -> Dict[str, int]:
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
            select(StudyRecord.question_id).where(
                and_(
                    StudyRecord.student_id == student_id,
                    StudyRecord.question_id.in_(question_ids),
                )
            ).distinct()
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
    async def get_practice_session(
        db: AsyncSession, session_id: int, student_id: str
    ) -> Optional[Dict[str, Any]]:
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
        questions_result = await db.execute(
            select(Question).where(Question.id.in_(question_ids))
        )
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
    ) -> Dict[str, Any]:
        """提交答案"""
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
        question_result = await db.execute(
            select(Question).where(Question.id == question_id)
        )
        question = question_result.scalar_one_or_none()
        
        if not question:
            raise ValueError("题目不存在")
        
        # 批改答案
        is_correct = DailyPracticeService._check_answer(question, answer)
        
        # 更新会话的答案记录
        answers = json.loads(session.answers)
        answers[str(question_id)] = {
            "answer": answer,
            "is_correct": is_correct,
            "time_spent": time_spent,
            "submit_time": now(),
        }
        session.answers = json.dumps(answers)
        session.update_time = now()
        
        await db.commit()
        
        logger.info(
            f"学生 {student_id} 提交答案，会话 {session_id}，题目 {question_id}，"
            f"正确：{is_correct}"
        )
        
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
    async def complete_practice(
        db: AsyncSession, student_id: str, session_id: int
    ) -> Dict[str, Any]:
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
                            unit_questions[question.unit_id] = {
                                "total": 0,
                                "correct": 0,
                                "knowledge_breakdown": {}
                            }
                        unit_questions[question.unit_id]["total"] += 1
                        if answer_data.get("is_correct"):
                            unit_questions[question.unit_id]["correct"] += 1
                        
                        # 单元内的知识点分解
                        if question.knowledge:
                            if question.knowledge not in unit_questions[question.unit_id]["knowledge_breakdown"]:
                                unit_questions[question.unit_id]["knowledge_breakdown"][question.knowledge] = {
                                    "total": 0,
                                    "correct": 0
                                }
                            unit_questions[question.unit_id]["knowledge_breakdown"][question.knowledge]["total"] += 1
                            if answer_data.get("is_correct"):
                                unit_questions[question.unit_id]["knowledge_breakdown"][question.knowledge]["correct"] += 1
        
        await db.commit()
        
        # 更新单元掌握度（按单元分组更新）
        from common.services.unit_mastery_service import UnitMasteryService
        
        for unit_id, unit_stats in unit_questions.items():
            unit_score = (unit_stats["correct"] / unit_stats["total"] * 100) if unit_stats["total"] > 0 else 0
            await UnitMasteryService.update_mastery(
                db,
                student_id=student_id,
                unit_id=unit_id,
                score=unit_score,
                total_questions=unit_stats["total"],
                correct_count=unit_stats["correct"],
                knowledge_breakdown=unit_stats["knowledge_breakdown"]
            )
        
        await db.refresh(session)
        
        logger.info(
            f"学生 {student_id} 完成今日练习，会话 {session_id}，"
            f"正确率：{correct_count}/{session.total_questions}，得分：{score:.1f}"
        )
        
        return await DailyPracticeService._generate_report(db, session)

    @staticmethod
    async def _generate_report(
        db: AsyncSession, session: DailyPracticeSession
    ) -> Dict[str, Any]:
        """生成练习报告"""
        answers = json.loads(session.answers)
        question_ids = json.loads(session.question_ids)
        distribution = json.loads(session.question_distribution)
        
        # 获取题目详情
        questions_result = await db.execute(
            select(Question).where(Question.id.in_(question_ids))
        )
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
    async def get_practice_history(
        db: AsyncSession, student_id: str, limit: int = 30
    ) -> List[Dict[str, Any]]:
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

