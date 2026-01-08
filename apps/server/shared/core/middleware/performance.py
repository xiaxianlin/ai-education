import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from shared.core.logger import log_performance
from shared.core.settings import envs


class PerformanceMiddleware(BaseHTTPMiddleware):
    """性能监控中间件"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not envs.LOG_PERFORMANCE_ENABLED:
            return await call_next(request)

        start_time = time.time()

        try:
            response = await call_next(request)
            duration = time.time() - start_time
            duration_ms = duration * 1000

            # 记录请求性能
            log_performance(
                metric="request_duration",
                value=round(duration_ms, 2),
                unit="ms",
                path=request.url.path,
                method=request.method,
                status_code=response.status_code,
            )

            # 检测慢请求
            if duration_ms > envs.LOG_SLOW_REQUEST_THRESHOLD:
                log_performance(
                    metric="slow_request",
                    value=round(duration_ms, 2),
                    unit="ms",
                    path=request.url.path,
                    method=request.method,
                    status_code=response.status_code,
                    threshold=envs.LOG_SLOW_REQUEST_THRESHOLD,
                )

            return response
        except Exception as e:
            duration = time.time() - start_time
            duration_ms = duration * 1000

            # 记录异常请求的性能
            log_performance(
                metric="request_duration",
                value=round(duration_ms, 2),
                unit="ms",
                path=request.url.path,
                method=request.method,
                status_code=500,
                error=str(e),
            )

            raise
