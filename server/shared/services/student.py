from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Unit


class StudentService:
    """学生服务"""

    async def get_weak_knowledges(db: AsyncSession, student_id: str) -> List[str]:
        """获取学生薄弱知识点"""
        return []

    async def get_mastered_knowledges(db: AsyncSession, student_id: str) -> List[str]:
        """获取学生已掌握知识点"""
        return []

    async def get_new_knowledges(db: AsyncSession, student_id: str) -> List[str]:
        """获取学生新知识点"""
        return []

    async def get_challenge_knowledges(db: AsyncSession, student_id: str) -> List[str]:
        """获取学生挑战知识点"""
        return []

    async def get_review_units(db: AsyncSession, student_id: str) -> List[Unit]:
        """获取学生需要复习的单元"""
        return []
