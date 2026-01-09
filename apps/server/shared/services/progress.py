"""练习生成进度服务

使用 Redis 缓存练习生成进度，支持前端实时查询。
"""

import asyncio
from typing import Optional

import redis.asyncio as redis
from loguru import logger
from shared.core.settings import envs


class ProgressService:
    """练习生成进度服务"""

    PROGRESS_KEY_PREFIX = "practice_progress:"
    PROGRESS_TTL = 3600  # 1小时过期

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

    async def close(self) -> None:
        """关闭 Redis 连接"""
        if self._redis:
            await self._redis.close()
            self._redis = None

    async def update_progress(
        self,
        session_id: str,
        progress: int,
        step: str,
        message: str = "",
    ) -> None:
        """更新生成进度

        Args:
            session_id: 练习会话 ID
            progress: 进度百分比 (0-100)
            step: 当前步骤标识
            message: 进度消息（可选）
        """
        try:
            r = await self.get_redis()
            key = f"{self.PROGRESS_KEY_PREFIX}{session_id}"
            await r.hset(
                key,
                mapping={
                    "progress": str(progress),
                    "step": step,
                    "message": message,
                },
            )
            await r.expire(key, self.PROGRESS_TTL)
            logger.debug(f"进度更新: session_id={session_id}, progress={progress}%, step={step}")
        except Exception as e:
            logger.warning(f"进度更新失败: session_id={session_id}, error={e}")

    async def get_progress(self, session_id: str) -> Optional[dict]:
        """获取生成进度

        Args:
            session_id: 练习会话 ID

        Returns:
            进度信息字典，包含 progress, step, message；如果不存在则返回 None
        """
        try:
            r = await self.get_redis()
            key = f"{self.PROGRESS_KEY_PREFIX}{session_id}"
            data = await r.hgetall(key)
            if not data:
                return None
            return {
                "progress": int(data.get("progress", "0")),
                "step": data.get("step", ""),
                "message": data.get("message", ""),
            }
        except Exception as e:
            logger.warning(f"获取进度失败: session_id={session_id}, error={e}")
            return None

    async def delete_progress(self, session_id: str) -> None:
        """删除进度记录

        Args:
            session_id: 练习会话 ID
        """
        try:
            r = await self.get_redis()
            key = f"{self.PROGRESS_KEY_PREFIX}{session_id}"
            await r.delete(key)
        except Exception as e:
            logger.warning(f"删除进度失败: session_id={session_id}, error={e}")


# 全局单例
progress_service = ProgressService()
