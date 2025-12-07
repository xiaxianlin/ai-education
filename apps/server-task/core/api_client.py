"""API 服务客户端 - 与 server-api 通信"""
import httpx
from typing import Dict, Any, Optional, List
from loguru import logger
from core.settings import envs


class APIServiceClient:
    """API 服务客户端"""
    
    def __init__(self):
        self.base_url = envs.API_SERVICE_URL  # http://server-api:7890
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            headers={"Content-Type": "application/json"}
        )
    
    async def get_question(self, question_id: int) -> Optional[Dict[str, Any]]:
        """获取题目信息"""
        try:
            response = await self.client.get(
                f"/api/admin/question/{question_id}"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(f"题目不存在: question_id={question_id}")
                return None
            logger.error(
                f"获取题目失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"获取题目失败: {e.response.text}")
        except Exception as e:
            logger.error(f"获取题目异常: {e}")
            raise
    
    async def update_question(
        self,
        question_id: int,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """更新题目信息"""
        try:
            response = await self.client.put(
                f"/api/admin/question/{question_id}",
                json=data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                f"更新题目失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"更新题目失败: {e.response.text}")
        except Exception as e:
            logger.error(f"更新题目异常: {e}")
            raise
    
    async def create_questions(self, questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """批量创建题目"""
        try:
            response = await self.client.post(
                "/api/admin/question/batch",
                json={"questions": questions}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                f"批量创建题目失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"批量创建题目失败: {e.response.text}")
        except Exception as e:
            logger.error(f"批量创建题目异常: {e}")
            raise
    
    async def get_textbook(self, textbook_id: int) -> Optional[Dict[str, Any]]:
        """获取教材信息"""
        try:
            response = await self.client.get(
                f"/api/admin/textbook/{textbook_id}"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(f"教材不存在: textbook_id={textbook_id}")
                return None
            logger.error(
                f"获取教材失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"获取教材失败: {e.response.text}")
        except Exception as e:
            logger.error(f"获取教材异常: {e}")
            raise
    
    async def get_unit(self, unit_id: int) -> Optional[Dict[str, Any]]:
        """获取单元信息"""
        try:
            response = await self.client.get(
                f"/api/admin/unit/{unit_id}"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(f"单元不存在: unit_id={unit_id}")
                return None
            logger.error(
                f"获取单元失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"获取单元失败: {e.response.text}")
        except Exception as e:
            logger.error(f"获取单元异常: {e}")
            raise
    
    async def get_student(self, student_id: int) -> Optional[Dict[str, Any]]:
        """获取学生信息"""
        try:
            response = await self.client.get(
                f"/api/admin/student/{student_id}"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(f"学生不存在: student_id={student_id}")
                return None
            logger.error(
                f"获取学生失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"获取学生失败: {e.response.text}")
        except Exception as e:
            logger.error(f"获取学生异常: {e}")
            raise
    
    async def close(self):
        """关闭客户端"""
        await self.client.aclose()

