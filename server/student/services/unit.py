"""单元相关服务（学生端）"""

from typing import Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import noload
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Knowledge, Unit, StudentTextbook, PracticeSession
from core.schema import KnowledgeSchema, PracticeSessionSchema


async def get_unit_knowledges(
    db: AsyncSession, student_id: str, unit_id: int
) -> list:
    """
    获取单元的知识点列表
    
    需要验证：
    1. 单元存在
    2. 单元所属的教材是学生的教材
    
    Args:
        db: 数据库会话
        student_id: 学生ID
        unit_id: 单元ID
        
    Returns:
        知识点列表
        
    Raises:
        ValueError: 单元不存在或学生无权访问
    """
    # 查询单元信息
    unit = await db.scalar(select(Unit).where(Unit.id == unit_id))
    if not unit:
        raise ValueError("单元不存在")
    
    # 验证学生是否有权限访问该单元（检查单元所属教材是否是学生的教材）
    student_textbook = await db.scalar(
        select(StudentTextbook).where(
            StudentTextbook.student_id == student_id,
            StudentTextbook.textbook_id == unit.textbook_id
        )
    )
    if not student_textbook:
        raise ValueError("无权访问该单元")
    
    # 查询知识点列表
    knowledges = await db.scalars(
        select(Knowledge)
        .options(noload(Knowledge.textbook), noload(Knowledge.unit))
        .where(Knowledge.unit_id == unit_id)
        .order_by(Knowledge.order, Knowledge.id)
    )
    
    return [KnowledgeSchema.model_validate(knowledge) for knowledge in knowledges.all()]


async def get_in_progress_unit_practice(
    db: AsyncSession, student_id: str
) -> Optional[dict]:
    """
    获取进行中的单元练习会话
    
    返回学生当前进行中的第一个单元练习会话（按创建时间倒序）
    
    Args:
        db: 数据库会话
        student_id: 学生ID
        
    Returns:
        练习会话信息，如果没有则返回 None
    """
    # 查询进行中的单元练习（status != 2 表示未完成）
    session = await db.scalar(
        select(PracticeSession)
        .where(
            PracticeSession.student_id == student_id,
            PracticeSession.session_type == "unit_practice",
            PracticeSession.status != 2,  # 未完成的练习
        )
        .order_by(desc(PracticeSession.create_time))
        .limit(1)
    )
    
    if not session:
        return None
    
    # 转换为字典格式
    session_dict = PracticeSessionSchema.model_validate(session).model_dump()
    session_dict["session_id"] = session_dict.pop("id", session.id)
    
    return session_dict

