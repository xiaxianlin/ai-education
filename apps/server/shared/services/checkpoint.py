"""练习生成检查点服务

提供简化的检查点机制，用于记录生成流程的进度，
支持失败后从断点恢复（在有限条件下）。

注意：由于工作流状态包含不可序列化的对象（如 AsyncSession），
完整的 LangGraph Checkpointing 需要额外的序列化处理。
此服务提供一个简化的实现。
"""

import asyncio
from typing import Any, Dict, Optional

import redis.asyncio as redis
from loguru import logger
from shared.core.settings import envs
import json


class CheckpointService:
    """检查点服务"""

    CHECKPOINT_KEY_PREFIX = "practice_checkpoint:"
    CHECKPOINT_TTL = 7200  # 2小时过期

    def __init__(self):
        self._redis: Optional[redis.Redis] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    async def get_redis(self) -> redis.Redis:
        """获取 Redis 连接

        检查当前事件循环是否与连接创建时的循环相同，
        如果不同则重新创建连接（Celery worker 场景）。
        """
        current_loop = asyncio.get_running_loop()

        # 如果事件循环变了，需要重新创建连接
        if self._redis is not None and self._loop != current_loop:
            try:
                await self._redis.close()
            except Exception:
                pass
            self._redis = None

        if self._redis is None:
            self._redis = redis.from_url(envs.REDIS_URL, decode_responses=True)
            self._loop = current_loop

        return self._redis

    async def save_checkpoint(
        self,
        session_id: str,
        step: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> None:
        """保存检查点

        Args:
            session_id: 练习会话 ID
            step: 当前步骤
            data: 可序列化的检查点数据（可选）
        """
        try:
            r = await self.get_redis()
            key = f"{self.CHECKPOINT_KEY_PREFIX}{session_id}"

            checkpoint = {
                "step": step,
                "data": data or {},
            }

            await r.set(key, json.dumps(checkpoint), ex=self.CHECKPOINT_TTL)
            logger.debug(f"检查点保存: session_id={session_id}, step={step}")
        except Exception as e:
            logger.warning(f"检查点保存失败: session_id={session_id}, error={e}")

    async def get_checkpoint(self, session_id: str) -> Optional[Dict[str, Any]]:
        """获取检查点

        Args:
            session_id: 练习会话 ID

        Returns:
            检查点数据，包含 step 和 data；如果不存在则返回 None
        """
        try:
            r = await self.get_redis()
            key = f"{self.CHECKPOINT_KEY_PREFIX}{session_id}"
            value = await r.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.warning(f"获取检查点失败: session_id={session_id}, error={e}")
            return None

    async def delete_checkpoint(self, session_id: str) -> None:
        """删除检查点

        Args:
            session_id: 练习会话 ID
        """
        try:
            r = await self.get_redis()
            key = f"{self.CHECKPOINT_KEY_PREFIX}{session_id}"
            await r.delete(key)
        except Exception as e:
            logger.warning(f"删除检查点失败: session_id={session_id}, error={e}")


# 全局单例
checkpoint_service = CheckpointService()
