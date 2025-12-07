"""题目生成 Worker"""
from typing import Dict, Any
from loguru import logger
import httpx

from core.settings import envs


class QuestionWorker:
    """题目生成 Worker"""
    
    def __init__(self):
        self.ai_service_url = envs.AI_SERVICE_URL  # http://server-ai:7892
        self.timeout = 600.0  # 题目生成可能需要较长时间
    
    async def generate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
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
            async with httpx.AsyncClient(
                base_url=self.ai_service_url,
                timeout=self.timeout,
                headers={"Content-Type": "application/json"}
            ) as client:
                response = await client.post(
                    "/api/v1/question/generate",
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                
                logger.info(
                    f"题目生成完成: type={payload.get('type')}, "
                    f"generated_count={len(result.get('questions', []))}"
                )
                
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(
                f"题目生成失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"题目生成失败: {e.response.text}")
        except Exception as e:
            logger.error(f"题目生成异常: {e}", exc_info=True)
            raise
