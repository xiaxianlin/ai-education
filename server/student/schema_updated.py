"""
学生端接口 Schema
使用共享类型定义，避免重复定义
"""

from typing import Optional
from pydantic import BaseModel

# 从共享类型导入
from shared_types import (
    StudentLoginRequest,
    CreatePracticeRequest,
    SubmitAnswerRequest,
    PracticeSession,
    Question,
    SubmitAnswerResponse,
    UploadRecordingResult
)

# 为了兼容性，保留原有的类型名称映射
class LoginSchema(StudentLoginRequest):
    """登录请求参数（向后兼容）"""
    pass

class CreatePracticeSchema(CreatePracticeRequest):
    """创建练习请求（向后兼容）"""
    pass

class AnswerQuestionSchema(SubmitAnswerRequest):
    """答题请求参数（向后兼容）"""
    pass

class UploadRecordingResultSchema(UploadRecordingResult):
    """录音上传结果（向后兼容）"""
    pass

# 可以添加一些当前项目特有的 Schema
class AudioProcessingResult(BaseModel):
    """音频处理结果"""
    success: bool
    duration: Optional[float] = None
    sample_rate: Optional[int] = None
    channels: Optional[int] = None

# 导出所有类型，方便其他模块使用
__all__ = [
    'LoginSchema',
    'CreatePracticeSchema',
    'AnswerQuestionSchema',
    'UploadRecordingResultSchema',
    'AudioProcessingResult',
    # 共享类型
    'StudentLoginRequest',
    'CreatePracticeRequest',
    'SubmitAnswerRequest',
    'PracticeSession',
    'Question',
    'SubmitAnswerResponse',
    'UploadRecordingResult',
]