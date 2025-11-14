"""单元练习服务"""
import json
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from loguru import logger

from core.database import UnitPracticeSession, Question, Unit, Knowledge, StudyRecord
from admin.schema import (
    UnitPracticeSessionSchema,
    CreateUnitPracticeSchema,
    SubmitUnitPracticeAnswerSchema,
)
from admin.services import wrong_question as wrong_question_service
from shared.utils.time import now


class UnitPracticeService:
    """单元练习服务"""

    @staticmethod
    async def create_practice_session(
        db: AsyncSession, student_id: str, unit_id: int, difficulty: str = "adaptive", count: int = 30
    ) -> UnitPracticeSessionSchema:
        """
        创建单元练习会话
        
        步骤：
        1. 检查是否有未完成的练习会话
        2. 如果有，直接返回未完成的会话
        3. 如果没有，验证单元是否存在
        4. 根据难度和数量选择题目
        5. 创建练习会话
        """
        logger.info(f"为学生 {student_id} 创建单元 {unit_id} 练习会话，难度：{difficulty}，题目数：{count}")
        
        # 检查是否有未完成的练习会话
        existing_result = await db.execute(
            select(UnitPracticeSession).where(
                and_(
                    UnitPracticeSession.student_id == student_id,
                    UnitPracticeSession.unit_id == unit_id,
                    UnitPracticeSession.status == "in_progress",
                )
            ).order_by(UnitPracticeSession.create_time.desc())
        )
        existing_session = existing_result.scalar_one_or_none()
        
        if existing_session:
            logger.info(f"发现未完成的单元练习会话: {existing_session.id}，直接返回")
            return UnitPracticeSessionSchema.model_validate(existing_session)
        
        # 验证单元是否存在
        unit_result = await db.execute(select(Unit).where(Unit.id == unit_id))
        unit = unit_result.scalar_one_or_none()
        if not unit:
            raise ValueError(f"单元 {unit_id} 不存在")
        
        # 选择题目（基于单元掌握度）
        from shared.services.unit_based_question_service import UnitBasedQuestionService
        
        question_ids = await UnitBasedQuestionService.generate_unit_practice_questions(
            db, student_id, unit_id, count
        )
        
        if not question_ids:
            raise ValueError(f"单元 {unit_id} 暂无可用题目")
        
        # 创建会话
        session = UnitPracticeSession(
            student_id=student_id,
            unit_id=unit_id,
            difficulty=difficulty,
            total_questions=len(question_ids),
            question_ids=json.dumps(question_ids),
            practice_date=now(),
            status="in_progress",
        )
        
        db.add(session)
        await db.commit()
        await db.refresh(session)
        
        logger.info(f"练习会话创建成功，会话ID：{session.id}，题目数：{len(question_ids)}")
        return UnitPracticeSessionSchema.model_validate(session)

    @staticmethod
    async def _select_questions(
        db: AsyncSession, unit_id: int, difficulty: str, count: int, student_id: str
    ) -> List[int]:
        """
        选择题目
        
        题目分配策略：
        - easy: 只选简单题
        - medium: 只选中等题
        - hard: 只选困难题
        - adaptive: 基础题(30%) + 提高题(40%) + 综合题(20%) + 拓展题(10%)
        """
        # 获取单元的所有可用题目
        base_query = select(Question).where(
            and_(
                Question.unit_id == unit_id,
                Question.status == 1,
            )
        )
        
        if difficulty == "adaptive":
            # 自适应模式：按难度分配
            easy_count = int(count * 0.3)
            medium_count = int(count * 0.4)
            hard_count = int(count * 0.2)
            expert_count = count - easy_count - medium_count - hard_count
            
            question_ids = []
            
            # 选择简单题
            easy_questions = await db.execute(
                base_query.where(Question.difficulty == "简单").limit(easy_count)
            )
            question_ids.extend([q.id for q in easy_questions.scalars().all()])
            
            # 选择中等题
            medium_questions = await db.execute(
                base_query.where(Question.difficulty == "普通").limit(medium_count)
            )
            question_ids.extend([q.id for q in medium_questions.scalars().all()])
            
            # 选择困难题
            hard_questions = await db.execute(
                base_query.where(Question.difficulty == "困难").limit(hard_count)
            )
            question_ids.extend([q.id for q in hard_questions.scalars().all()])
            
            # 如果还不够，随机补充
            if len(question_ids) < count:
                remaining = count - len(question_ids)
                extra_questions = await db.execute(
                    base_query.where(Question.id.not_in(question_ids)).limit(remaining)
                )
                question_ids.extend([q.id for q in extra_questions.scalars().all()])
        else:
            # 固定难度模式
            difficulty_map = {
                "easy": "简单",
                "medium": "普通",
                "hard": "困难",
            }
            target_difficulty = difficulty_map.get(difficulty, "普通")
            
            questions = await db.execute(
                base_query.where(Question.difficulty == target_difficulty).limit(count)
            )
            question_ids = [q.id for q in questions.scalars().all()]
            
            # 如果该难度题目不够，用其他题目补充
            if len(question_ids) < count:
                remaining = count - len(question_ids)
                extra_questions = await db.execute(
                    base_query.where(Question.id.not_in(question_ids)).limit(remaining)
                )
                question_ids.extend([q.id for q in extra_questions.scalars().all()])
        
        return question_ids

    @staticmethod
    async def get_practice_session(
        db: AsyncSession, session_id: int, student_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        获取练习会话详情
        
        返回会话信息和题目列表
        """
        result = await db.execute(
            select(UnitPracticeSession)
            .options(joinedload(UnitPracticeSession.unit))
            .where(
                and_(
                    UnitPracticeSession.id == session_id,
                    UnitPracticeSession.student_id == student_id,
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
            "session": UnitPracticeSessionSchema.model_validate(session),
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
                    "answer": answers.get(str(q.id), {}).get("answer"),  # 如果已答过，返回答案
                    "is_correct": answers.get(str(q.id), {}).get("is_correct"),
                }
                for q in ordered_questions
            ],
            "unit": {
                "id": session.unit.id,
                "name": session.unit.name,
                "content": session.unit.content,
            },
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
        提交单道题目的答案
        
        如果是口语题且有 audio_url，则通过 ASR 解析录音后再对比答案
        
        返回批改结果
        """
        # 获取会话
        result = await db.execute(
            select(UnitPracticeSession).where(
                and_(
                    UnitPracticeSession.id == session_id,
                    UnitPracticeSession.student_id == student_id,
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
        
        # 批改答案（简单的字符串比较，实际可能需要更复杂的逻辑）
        is_correct = UnitPracticeService._check_answer(question, actual_answer)
        
        # 如果答案错误，记录到错题本
        if not is_correct:
            try:
                await wrong_question_service.add_wrong_question(db, student_id, question_id)
            except Exception as e:
                logger.error(f"记录错题失败: {e}")
        
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
        
        logger.info(
            f"学生 {student_id} 提交答案，会话 {session_id}，题目 {question_id}，"
            f"正确：{is_correct}"
        )
        
        return {
            "is_correct": is_correct,
            "correct_answer": question.answer,
            "explanation": "",  # 可以添加解析
        }

    @staticmethod
    def _check_answer(question: Question, user_answer: str) -> bool:
        """
        检查答案是否正确
        
        根据题目类型采用不同的判断逻辑
        """
        if not user_answer:
            return False
        
        correct_answer = question.answer.strip().lower()
        user_answer = user_answer.strip().lower()
        
        # 选择题、判断题等：精确匹配
        if question.type in ["选择题", "判断题"]:
            return user_answer == correct_answer
        
        # 填空题：可能有多个答案，用|分隔
        if question.type == "填空题":
            possible_answers = [ans.strip().lower() for ans in correct_answer.split("|")]
            return user_answer in possible_answers
        
        # 其他题型：包含关键词即可（实际应该用更智能的方式）
        return user_answer == correct_answer

    @staticmethod
    async def complete_practice(
        db: AsyncSession, student_id: str, session_id: int
    ) -> Dict[str, Any]:
        """
        完成练习并生成报告
        
        步骤：
        1. 计算总分和统计信息
        2. 记录学习记录
        3. 更新学生统计信息
        4. 更新错题库
        5. 生成报告
        """
        # 获取会话
        result = await db.execute(
            select(UnitPracticeSession)
            .options(joinedload(UnitPracticeSession.unit))
            .where(
                and_(
                    UnitPracticeSession.id == session_id,
                    UnitPracticeSession.student_id == student_id,
                )
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise ValueError("练习会话不存在")
        
        if session.status == "completed":
            # 已完成，直接返回结果
            return await UnitPracticeService._generate_report(db, session)
        
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
        
        # 记录每道题的学习记录并统计知识点掌握情况
        question_ids = json.loads(session.question_ids)
        knowledge_breakdown = {}  # 知识点分解情况
        
        for qid in question_ids:
            answer_data = answers.get(str(qid), {})
            if answer_data:  # 只记录已答的题
                # 获取题目信息
                q_result = await db.execute(select(Question).where(Question.id == qid))
                question = q_result.scalar_one_or_none()
                
                study_record = StudyRecord(
                    student_id=student_id,
                    textbook_id=session.unit.textbook_id,
                    unit_id=session.unit_id,
                    question_id=qid,
                    knowledge=question.knowledge if question else None,
                    is_correct=1 if answer_data.get("is_correct") else 0,
                    score=1.0 if answer_data.get("is_correct") else 0.0,
                    time_spent=answer_data.get("time_spent", 0),
                    study_date=now(),
                )
                db.add(study_record)
                
                # 统计知识点掌握情况
                if question and question.knowledge:
                    knowledge = question.knowledge
                    if knowledge not in knowledge_breakdown:
                        knowledge_breakdown[knowledge] = {"total": 0, "correct": 0}
                    knowledge_breakdown[knowledge]["total"] += 1
                    if answer_data.get("is_correct"):
                        knowledge_breakdown[knowledge]["correct"] += 1
        
        await db.commit()
        
        # 更新单元掌握度
        from shared.services.unit_mastery_service import UnitMasteryService
        
        await UnitMasteryService.update_mastery(
            db,
            student_id=student_id,
            unit_id=session.unit_id,
            score=score,
            total_questions=session.total_questions,
            correct_count=correct_count,
            knowledge_breakdown=knowledge_breakdown
        )
        
        await db.refresh(session)
        
        logger.info(
            f"学生 {student_id} 完成练习，会话 {session_id}，"
            f"正确率：{correct_count}/{session.total_questions}，得分：{score:.1f}"
        )
        
        return await UnitPracticeService._generate_report(db, session)

    @staticmethod
    async def _generate_report(db: AsyncSession, session: UnitPracticeSession) -> Dict[str, Any]:
        """生成练习报告"""
        answers = json.loads(session.answers)
        question_ids = json.loads(session.question_ids)
        
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
        
        # 计算各知识点掌握率
        knowledge_scores = {
            k: {
                "total": v["total"],
                "correct": v["correct"],
                "rate": v["correct"] / v["total"] if v["total"] > 0 else 0,
            }
            for k, v in knowledge_stats.items()
        }
        
        # 更新会话的知识点分数
        session.knowledge_scores = json.dumps(knowledge_scores)
        await db.commit()
        
        return {
            "session_id": session.id,
            "unit_id": session.unit_id,
            "unit_name": session.unit.name,
            "total_questions": session.total_questions,
            "correct_questions": session.correct_questions,
            "score": session.score,
            "total_time": session.total_time,
            "knowledge_scores": knowledge_scores,
            "status": session.status,
            "practice_date": session.practice_date,
        }

    @staticmethod
    async def get_unit_progress(
        db: AsyncSession, student_id: str, unit_id: int
    ) -> Dict[str, Any]:
        """
        获取单元学习进度
        
        返回：
        - 总体完成度
        - 各知识点掌握情况
        - 练习历史
        """
        # 获取该单元的所有练习会话
        result = await db.execute(
            select(UnitPracticeSession)
            .where(
                and_(
                    UnitPracticeSession.student_id == student_id,
                    UnitPracticeSession.unit_id == unit_id,
                    UnitPracticeSession.status == "completed",
                )
            )
            .order_by(UnitPracticeSession.practice_date.desc())
        )
        sessions = result.scalars().all()
        
        if not sessions:
            return {
                "unit_id": unit_id,
                "total_sessions": 0,
                "average_score": 0,
                "best_score": 0,
                "total_questions": 0,
                "correct_questions": 0,
                "knowledge_progress": {},
                "recent_sessions": [],
            }
        
        # 统计总体情况
        total_sessions = len(sessions)
        total_questions = sum(s.total_questions for s in sessions)
        correct_questions = sum(s.correct_questions for s in sessions)
        average_score = sum(s.score for s in sessions) / total_sessions
        best_score = max(s.score for s in sessions)
        
        # 合并知识点掌握情况
        all_knowledge = {}
        for session in sessions:
            knowledge_scores = json.loads(session.knowledge_scores)
            for knowledge, stats in knowledge_scores.items():
                if knowledge not in all_knowledge:
                    all_knowledge[knowledge] = {"total": 0, "correct": 0}
                all_knowledge[knowledge]["total"] += stats["total"]
                all_knowledge[knowledge]["correct"] += stats["correct"]
        
        knowledge_progress = {
            k: {
                "total": v["total"],
                "correct": v["correct"],
                "rate": v["correct"] / v["total"] if v["total"] > 0 else 0,
            }
            for k, v in all_knowledge.items()
        }
        
        # 最近的练习记录
        recent_sessions = [
            {
                "id": s.id,
                "practice_date": s.practice_date,
                "score": s.score,
                "total_questions": s.total_questions,
                "correct_questions": s.correct_questions,
                "difficulty": s.difficulty,
            }
            for s in sessions[:10]  # 最近10次
        ]
        
        return {
            "unit_id": unit_id,
            "total_sessions": total_sessions,
            "average_score": round(average_score, 1),
            "best_score": round(best_score, 1),
            "total_questions": total_questions,
            "correct_questions": correct_questions,
            "knowledge_progress": knowledge_progress,
            "recent_sessions": recent_sessions,
        }

    @staticmethod
    async def get_practice_history(
        db: AsyncSession, student_id: str, limit: int = 20
    ) -> List[Dict[str, Any]]:
        """获取学生的单元练习历史"""
        result = await db.execute(
            select(UnitPracticeSession)
            .options(joinedload(UnitPracticeSession.unit))
            .where(UnitPracticeSession.student_id == student_id)
            .order_by(UnitPracticeSession.practice_date.desc())
            .limit(limit)
        )
        sessions = result.scalars().all()
        
        return [
            {
                "id": s.id,
                "unit_id": s.unit_id,
                "unit_name": s.unit.name,
                "practice_date": s.practice_date,
                "total_questions": s.total_questions,
                "correct_questions": s.correct_questions,
                "score": s.score,
                "total_time": s.total_time,
                "difficulty": s.difficulty,
                "status": s.status,
            }
            for s in sessions
        ]

