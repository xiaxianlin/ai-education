"""任务服务客户端 - 与 server-task 通信"""
import httpx
from typing import Optional, Dict, Any
from loguru import logger
from shared.core.settings import envs


class TaskServiceClient:
    """任务服务客户端"""
    
    def __init__(self):
        self.base_url = envs.TASK_SERVICE_URL  # http://server-task:7891
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            headers={"Content-Type": "application/json"}
        )
    
    async def submit_task(
        self,
        task_id: str,
        task_type: str,
        payload: Dict[str, Any],
        priority: int = 0,
        timeout: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        提交任务到 server-task
        
        Args:
            task_id: 任务ID
            task_type: 任务类型
            payload: 任务负载
            priority: 优先级
            timeout: 超时时间（秒）
            
        Returns:
            任务响应
        """
        try:
            request_data = {
                "task_id": task_id,
                "task_type": task_type,
                "payload": payload,
                "priority": priority,
            }
            if timeout:
                request_data["timeout"] = timeout
            
            response = await self.client.post(
                "/api/task/submit",
                json=request_data
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            logger.error(
                f"提交任务失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"提交任务失败: {e.response.text}")
        except Exception as e:
            logger.error(f"提交任务异常: {e}")
            raise
    
    async def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取任务状态"""
        try:
            response = await self.client.get(f"/api/task/{task_id}")
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"获取任务状态失败: {e}")
            return None
    
    async def cancel_task(self, task_id: str) -> bool:
        """取消任务"""
        try:
            response = await self.client.post(f"/api/task/{task_id}/cancel")
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"取消任务失败: {e}")
            return False
    
    async def close(self):
        """关闭客户端"""
        await self.client.aclose()

