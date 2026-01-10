import json
import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from shared.core.logger import clear_request_context, log_request, log_response, set_request_context


class LoggingMiddleware(BaseHTTPMiddleware):
    """请求日志中间件"""

    async def _get_request_body(self, request: Request) -> tuple[dict | None, bytes | None]:
        """
        获取请求体参数（JSON格式）
        返回: (body_params, body_bytes)
        body_bytes 用于重新设置到 request 中
        """
        # 只处理 POST、PUT、PATCH 等有请求体的方法
        if request.method not in ("POST", "PUT", "PATCH", "DELETE"):
            return None, None

        # 检查 Content-Type
        content_type = request.headers.get("content-type", "").lower()
        
        # 跳过文件上传
        if "multipart/form-data" in content_type:
            return None, None
        
        # 跳过二进制内容
        if "application/octet-stream" in content_type or "image/" in content_type or "video/" in content_type:
            return None, None

        try:
            # 读取请求体
            body = await request.body()
            
            # 如果请求体为空，返回 None
            if not body:
                return None, body

            # 对于 JSON 格式
            if "application/json" in content_type:
                try:
                    body_data = json.loads(body.decode("utf-8"))
                    # 脱敏处理敏感字段
                    return self._sanitize_body(body_data), body
                except (json.JSONDecodeError, UnicodeDecodeError):
                    # JSON 解析失败，返回原始字符串的前100个字符
                    body_str = body.decode("utf-8", errors="ignore")
                    return {"_raw": body_str[:100] + "..." if len(body_str) > 100 else body_str}, body
            
            # 对于表单数据
            elif "application/x-www-form-urlencoded" in content_type:
                # FastAPI 会自动解析表单数据，这里我们只记录有参数的情况
                # 注意：表单数据在 request.form() 中，但读取后需要重新设置
                return None, body  # 返回 body 以便重新设置，但不解析内容
            
            # 其他格式，返回原始字符串的前100个字符
            else:
                body_str = body.decode("utf-8", errors="ignore")
                if len(body_str) > 1000:  # 如果内容太长，只记录前100个字符
                    return {"_raw": body_str[:100] + "..."}, body
                return {"_raw": body_str}, body
        
        except Exception:
            # 读取请求体失败，返回 None
            return None, None

    def _sanitize_body(self, body_data: dict) -> dict:
        """脱敏处理请求体中的敏感信息"""
        if not isinstance(body_data, dict):
            return body_data
        
        sensitive_keys = [
            "password", "pwd", "secret", "token", "key", 
            "api_key", "access_key", "secret_key", "access_token",
            "refresh_token", "authorization", "auth"
        ]
        
        sanitized = {}
        for k, v in body_data.items():
            key_lower = k.lower()
            # 检查是否包含敏感关键词
            if any(sensitive in key_lower for sensitive in sensitive_keys):
                sanitized[k] = "***"
            elif isinstance(v, dict):
                # 递归处理嵌套字典
                sanitized[k] = self._sanitize_body(v)
            elif isinstance(v, list):
                # 处理列表
                sanitized[k] = [
                    self._sanitize_body(item) if isinstance(item, dict) else item
                    for item in v
                ]
            else:
                sanitized[k] = v
        
        return sanitized

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

        # 获取请求体参数
        body_params, body_bytes = await self._get_request_body(request)
        
        # 如果读取了请求体，需要重新设置到 request 中（因为 body 只能读取一次）
        if body_bytes is not None:
            # 创建一个新的接收器来重新设置 body，这样后续的路由处理可以正常读取
            async def receive():
                return {"type": "http.request", "body": body_bytes}
            request._receive = receive

        # 记录请求开始
        log_request(
            path=request.url.path,
            method=request.method,
            request_id=request_id,
            user_id=user_id,
            client_ip=request.client.host if request.client else None,
            query_params=dict(request.query_params) if request.query_params else None,
            body_params=body_params,
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
