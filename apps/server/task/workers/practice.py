"""练习生成 Worker"""

from typing import Dict, Any
from loguru import logger

from shared.core.database import AsyncSessionLocal
from student.services.practice_generate import generate_practice_session


class PracticeWorker:
    """练习生成 Worker"""

    async def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        执行练习生成任务
        
        Args:
            payload: 包含 type, textbook_id, student_id, unit_id(可选)
            
        Returns:
            Dict: 包含 session_id 的结果
        """
        practice_type = payload.get("type")
        textbook_id = payload.get("textbook_id")
        student_id = payload.get("student_id")
        unit_id = payload.get("unit_id")
        
        logger.info(
            f"开始生成练习: type={practice_type}, student_id={student_id}, "
            f"textbook_id={textbook_id}, unit_id={unit_id}"
        )

        try:
            # 使用 async with 确保会话正确关闭和连接清理
            async with AsyncSessionLocal() as db:
                session = await generate_practice_session(
                    db=db,
                    type=practice_type,
                    student_id=student_id,
                    textbook_id=textbook_id,
                    unit_id=unit_id,
                )
                
                logger.info(f"练习生成完成: session_id={session.id}")
                return {"session_id": session.id, "question_count": session.question_count}
                
        except Exception as e:
            logger.error(f"练习生成异常: {e}", exc_info=True)
            raise
