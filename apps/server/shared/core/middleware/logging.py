import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from shared.core.logger import clear_request_context, log_request, log_response, set_request_context


class LoggingMiddleware(BaseHTTPMiddleware):
    """请求日志中间件"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 生成请求ID
        request_id = str(uuid.uuid4())
        start_time = time.time()

        # 获取用户ID（如果已认证）
        user_id = None
        if hasattr(request.state, "user_id"):
            user_id = request.state.user_id
        elif hasattr(request.state, "user") and hasattr(request.state.user, "id"):
            user_id = str(request.state.user.id)

        # 设置请求上下文
        set_request_context(
            request_id=request_id,
            user_id=user_id,
            path=request.url.path,
            method=request.method,
        )

        # 将 request_id 添加到请求状态，方便在响应中使用
        request.state.request_id = request_id

        # 记录请求开始
        log_request(
            path=request.url.path,
            method=request.method,
            request_id=request_id,
            user_id=user_id,
            client_ip=request.client.host if request.client else None,
            query_params=dict(request.query_params) if request.query_params else None,
        )

        try:
            # 处理请求
            response = await call_next(request)

            # 计算耗时
            duration = time.time() - start_time

            # 记录响应
            log_response(
                path=request.url.path,
                method=request.method,
                status_code=response.status_code,
                duration=duration,
                request_id=request_id,
                user_id=user_id,
            )

            # 在响应头中添加 request_id（可选）
            response.headers["X-Request-ID"] = request_id

            return response
        except Exception as e:
            # 计算耗时
            duration = time.time() - start_time

            # 记录异常响应
            log_response(
                path=request.url.path,
                method=request.method,
                status_code=500,
                duration=duration,
                request_id=request_id,
                user_id=user_id,
                error=str(e),
            )

            # 清除上下文
            clear_request_context()

            # 重新抛出异常，让异常处理器处理
            raise
        finally:
            # 清除上下文
            clear_request_context()
