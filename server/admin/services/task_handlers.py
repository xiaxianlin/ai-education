"""任务处理器"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from ai.graphs.generate_question import generate_question_graph
from loguru import logger


async def generate_question_handler(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    """生成题目的任务处理器"""
    unit_id = params.get("unit_id")
    count = params.get("count")

    if not unit_id or not count:
        raise ValueError("缺少必要参数: unit_id 或 count")

    logger.info(f"开始执行生成题目任务: unit_id={unit_id}, count={count}")

    # 执行题目生成流程
    result = await generate_question_graph(db, unit_id, count)

    # 提取保存的题目
    saved_questions = result.get("saved_questions", [])
    question_ids = [q.id for q in saved_questions]

    logger.info(f"题目生成完成: 共生成 {len(question_ids)} 道题目")

    return {
        "unit_id": unit_id,
        "count": count,
        "generated_count": len(question_ids),
        "question_ids": question_ids,
    }

