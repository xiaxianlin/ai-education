import uuid
import json
from typing import List, Dict, Any, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from store.database.models import (
    UserSubmission, TestSession, TestReport, Question, Knowledge, CourseUnit
)
from schema.user import (
    SubmissionSchema, TestSessionCreateSchema, SubmissionBatchSchema
)
from service.user.answer_validator import AnswerValidator
from core import get_logger
from util import time


logger = get_logger("SubmissionService")


class SubmissionService:
    """用户提交记录服务"""
    
    def __init__(self):
        self.validator = AnswerValidator()
    
    async def create_test_session(self, db: AsyncSession, user_id: str, 
                                params: TestSessionCreateSchema) -> str:
        """创建测试会话"""
        session_id = str(uuid.uuid4())
        
        # 获取问题信息用于统计
        questions = await db.scalars(
            select(Question).where(Question.id.in_(params.question_ids))
        )
        question_list = list(questions.all())
        
        # 计算最大分数（每题100分）
        max_score = len(question_list) * 100
        
        # 创建测试会话
        session = TestSession(
            id=session_id,
            user_id=user_id,
            session_name=params.session_name,
            subject=params.subject,
            grade=params.grade,
            total_questions=len(question_list),
            max_score=max_score,
            status="active"
        )
        
        db.add(session)
        await db.commit()
        
        logger.info(f"Created test session {session_id} for user {user_id}")
        return session_id
    
    async def submit_answer(self, db: AsyncSession, user_id: str, 
                          submission: SubmissionSchema) -> Dict[str, Any]:
        """提交单个答案"""
        # 获取问题信息
        question = await db.scalar(
            select(Question).where(Question.id == submission.question_id)
        )
        
        if not question:
            raise ValueError("问题不存在")
        
        # 验证答案
        validation_result = await self.validator.validate_answer(
            question_type=question.type,
            user_answer=submission.user_answer,
            correct_answer=question.answer,
            question_content=question.content
        )
        
        # 创建提交记录
        submission_id = str(uuid.uuid4())
        user_submission = UserSubmission(
            id=submission_id,
            user_id=user_id,
            question_id=submission.question_id,
            user_answer=submission.user_answer,
            is_correct=validation_result["is_correct"],
            score=validation_result["score"],
            time_spent=submission.time_spent
        )
        
        db.add(user_submission)
        
        # 如果有会话ID，更新会话统计
        if submission.session_id:
            await self._update_session_stats(db, submission.session_id)
        
        await db.commit()
        
        result = {
            "submission_id": submission_id,
            "is_correct": validation_result["is_correct"],
            "score": validation_result["score"],
            "explanation": validation_result["explanation"],
            "correct_answer": question.answer
        }
        
        logger.info(f"User {user_id} submitted answer for question {submission.question_id}")
        return result
    
    async def submit_batch(self, db: AsyncSession, user_id: str, 
                         batch: SubmissionBatchSchema) -> Dict[str, Any]:
        """批量提交答案"""
        results = []
        total_score = 0
        correct_count = 0
        
        for submission in batch.submissions:
            try:
                result = await self.submit_answer(db, user_id, submission)
                results.append({
                    "question_id": submission.question_id,
                    **result
                })
                
                total_score += result["score"]
                if result["is_correct"] == 1:
                    correct_count += 1
                    
            except Exception as e:
                logger.error(f"Error submitting answer for question {submission.question_id}: {str(e)}")
                results.append({
                    "question_id": submission.question_id,
                    "error": str(e)
                })
        
        # 完成测试会话
        if batch.session_id:
            await self._complete_test_session(db, batch.session_id, total_score, correct_count)
        
        return {
            "session_id": batch.session_id,
            "total_submissions": len(batch.submissions),
            "successful_submissions": len([r for r in results if "error" not in r]),
            "total_score": total_score,
            "correct_count": correct_count,
            "results": results
        }
    
    async def _update_session_stats(self, db: AsyncSession, session_id: str):
        """更新会话统计信息"""
        # 获取该会话的所有提交记录
        submissions = await db.scalars(
            select(UserSubmission).join(TestSession).where(
                TestSession.id == session_id
            )
        )
        
        submission_list = list(submissions.all())
        
        if submission_list:
            total_score = sum(s.score for s in submission_list)
            correct_count = sum(1 for s in submission_list if s.is_correct == 1)
            
            # 更新会话统计
            session = await db.scalar(select(TestSession).where(TestSession.id == session_id))
            if session:
                session.total_score = total_score
                session.correct_count = correct_count
    
    async def _complete_test_session(self, db: AsyncSession, session_id: str, 
                                   total_score: int, correct_count: int):
        """完成测试会话"""
        session = await db.scalar(select(TestSession).where(TestSession.id == session_id))
        
        if session and session.status == "active":
            session.status = "completed"
            session.end_time = time.now()
            session.duration = session.end_time - session.start_time
            session.total_score = total_score
            session.correct_count = correct_count
            
            await db.commit()
            logger.info(f"Completed test session {session_id}")
    
    async def get_user_submissions(self, db: AsyncSession, user_id: str, 
                                 session_id: Optional[str] = None,
                                 limit: int = 50) -> List[Dict[str, Any]]:
        """获取用户提交记录"""
        stmt = select(UserSubmission).options(
            joinedload(UserSubmission.question)
        ).where(UserSubmission.user_id == user_id)
        
        if session_id:
            # 通过会话ID过滤（需要先获取该会话的问题ID列表）
            session = await db.scalar(select(TestSession).where(TestSession.id == session_id))
            if session:
                # 这里需要根据实际需求调整，可能需要存储会话-问题关联关系
                pass
        
        stmt = stmt.order_by(UserSubmission.create_time.desc()).limit(limit)
        
        submissions = await db.scalars(stmt)
        
        results = []
        for submission in submissions.all():
            results.append({
                "id": submission.id,
                "question_id": submission.question_id,
                "question_content": submission.question.content if submission.question else "",
                "question_type": submission.question.type if submission.question else "",
                "user_answer": submission.user_answer,
                "correct_answer": submission.question.answer if submission.question else "",
                "is_correct": submission.is_correct,
                "score": submission.score,
                "time_spent": submission.time_spent,
                "submit_time": submission.submit_time,
                "create_time": submission.create_time
            })
        
        return results
    
    async def get_test_sessions(self, db: AsyncSession, user_id: str, 
                              limit: int = 20) -> List[Dict[str, Any]]:
        """获取用户测试会话列表"""
        sessions = await db.scalars(
            select(TestSession)
            .where(TestSession.user_id == user_id)
            .order_by(TestSession.create_time.desc())
            .limit(limit)
        )
        
        results = []
        for session in sessions.all():
            accuracy_rate = 0
            if session.total_questions > 0:
                accuracy_rate = session.correct_count / session.total_questions
            
            score_rate = 0
            if session.max_score > 0:
                score_rate = session.total_score / session.max_score
            
            results.append({
                "id": session.id,
                "session_name": session.session_name,
                "subject": session.subject,
                "grade": session.grade,
                "total_questions": session.total_questions,
                "correct_count": session.correct_count,
                "accuracy_rate": round(accuracy_rate * 100, 2),
                "total_score": session.total_score,
                "max_score": session.max_score,
                "score_rate": round(score_rate * 100, 2),
                "duration": session.duration,
                "status": session.status,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "create_time": session.create_time
            })
        
        return results