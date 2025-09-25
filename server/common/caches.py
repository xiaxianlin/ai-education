from redis import Redis
from common import settings
from core import get_logger


class SimpleCache:
    def __init__(self, prefix: str = "simple"):
        self.redis = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=1,
            decode_responses=True,
        )
        self.prefix = prefix
        self.logger = get_logger("SimpleCache")

    def set(self, key, data, ex=3600):
        self.redis.set(f"{self.prefix}:{key}", data, ex=ex)

    def get(self, key):
        return self.redis.get(f"{self.prefix}:{key}")

    def delete(self, key):
        self.redis.delete(f"{self.prefix}:{key}")

    def exists(self, key):
        return self.redis.exists(f"{self.prefix}:{key}")
