"""任务数据模型"""

from enum import Enum
from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TaskType(str, Enum):
    """任务类型枚举"""

    PRACTICE = "practice"


class TaskStatus(str, Enum):
    """任务状态枚举"""

    PENDING = "pending"  # 待处理
    PROCESSING = "processing"  # 处理中
    COMPLETED = "completed"  # 已完成
    FAILED = "failed"  # 失败
    CANCELLED = "cancelled"  # 已取消


class TaskRequest(BaseModel):
    """任务请求模型"""

    task_id: str = Field(..., description="任务ID")
    task_type: TaskType = Field(..., description="任务类型")
    payload: Dict[str, Any] = Field(..., description="任务负载数据")
    priority: int = Field(default=0, description="优先级，数字越大优先级越高")
    timeout: Optional[int] = Field(default=None, description="超时时间（秒）")
