"""任务数据模型"""
from enum import Enum
from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TaskType(str, Enum):
    """任务类型枚举"""
    QUESTION_GENERATION = "question_generation"  # 题目生成
    IMAGE_GENERATION = "image_generation"       # 图片生成
    AUDIO_GENERATION = "audio_generation"       # 语音生成
    ANSWER_ANALYSIS = "answer_analysis"         # 答题分析


class TaskStatus(str, Enum):
    """任务状态枚举"""
    PENDING = "pending"         # 待处理
    PROCESSING = "processing"   # 处理中
    COMPLETED = "completed"     # 已完成
    FAILED = "failed"           # 失败
    CANCELLED = "cancelled"     # 已取消


class TaskRequest(BaseModel):
    """任务请求模型"""
    task_id: str = Field(..., description="任务ID")
    task_type: TaskType = Field(..., description="任务类型")
    payload: Dict[str, Any] = Field(..., description="任务负载数据")
    priority: int = Field(default=0, description="优先级，数字越大优先级越高")
    timeout: Optional[int] = Field(default=None, description="超时时间（秒）")


class TaskResponse(BaseModel):
    """任务响应模型"""
    task_id: str
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    processing_time: Optional[float] = None  # 处理耗时（秒）

