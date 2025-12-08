"""任务数据模型"""

from enum import Enum
from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TaskType(str, Enum):
    """任务类型枚举"""

    PRACTICE = "practice"  # 练习生成任务


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


class TaskResponse(BaseModel):
    """任务响应模型"""

    task_id: str = Field(..., description="任务ID")
    status: TaskStatus = Field(..., description="任务状态")
    result: Optional[Dict[str, Any]] = Field(default=None, description="任务结果")
    error: Optional[str] = Field(default=None, description="错误信息")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    processing_time: Optional[float] = Field(default=None, description="处理耗时（秒）")


class PracticeSubmitRequest(BaseModel):
    """练习任务提交请求"""

    type: str = Field(..., description="练习类型: daily_practice/unit_practice/assessment")
    textbook_id: int = Field(..., description="教材ID")
    unit_id: Optional[int] = Field(default=None, description="单元ID（单元练习必填）")
