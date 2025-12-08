"""题目生成 Worker"""
from typing import Dict, Any
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from ai.services.question import generate_questions
from shared.core.database import AsyncSessionLocal


class QuestionWorker:
    """题目生成 Worker"""
    
    async def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        生成题目
        
        Args:
            payload: 包含以下字段：
                - type: 生成类型 (unit, textbook, daily_practice, unit_practice, assessment)
                - count: 生成题目数量
                - textbook_id: 教材ID
                - unit_id: 单元ID（可选）
                - student_id: 学生ID（可选，每日练习时需要）
                
        Returns:
            Dict: 生成的题目数据
        """
        logger.info(f"开始生成题目: type={payload.get('type')}, count={payload.get('count')}")
        
        try:
            # 获取数据库会话
            session = AsyncSessionLocal()
            try:
                # 直接调用 AI 服务生成题目
                questions = await generate_questions(
                    db=session,
                    type=payload.get("type"),
                    count=payload.get("count"),
                    textbook_id=payload.get("textbook_id"),
                    unit_id=payload.get("unit_id"),
                    student_id=payload.get("student_id"),
                )
                
                logger.info(
                    f"题目生成完成: type={payload.get('type')}, "
                    f"generated_count={len(questions)}"
                )
                
                return {
                    "questions": [q.model_dump() for q in questions],
                    "count": len(questions),
                }
            finally:
                await session.close()
                
        except Exception as e:
            logger.error(f"题目生成异常: {e}", exc_info=True)
            raise

