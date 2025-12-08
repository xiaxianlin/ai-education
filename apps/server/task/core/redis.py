"""Redis 客户端"""

import redis
from loguru import logger

from shared.core.settings import envs


class RedisClient:
    """Redis 客户端单例"""

    _instance: redis.Redis = None

    @classmethod
    def get_connection(cls) -> redis.Redis:
        """获取 Redis 连接"""
        if cls._instance is None:
            try:
                cls._instance = redis.Redis(
                    host=envs.REDIS_HOST,
                    port=envs.REDIS_PORT,
                    password=envs.REDIS_PASSWORD if envs.REDIS_PASSWORD else None,
                    db=envs.REDIS_DB,
                    decode_responses=False,  # RQ 需要 bytes
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                # 测试连接
                cls._instance.ping()
                logger.info(f"Redis 连接成功: {envs.REDIS_HOST}:{envs.REDIS_PORT}")
            except Exception as e:
                logger.error(f"Redis 连接失败: {e}")
                raise
        return cls._instance

    @classmethod
    def close(cls):
        """关闭连接"""
        if cls._instance:
            cls._instance.close()
            cls._instance = None
            logger.info("Redis 连接已关闭")


# 导出便捷函数
def get_redis_connection() -> redis.Redis:
    """获取 Redis 连接的便捷函数"""
    return RedisClient.get_connection()
