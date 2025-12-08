"""AI 服务客户端 - 与 server-ai 通信"""

import httpx
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from loguru import logger
from shared.core.settings import envs
from shared.core.schema import QuestionSchema


# ==================== 输入输出模型 ====================

# 题目相关模型


class QuestionGenerateRequest(BaseModel):
    """题目生成请求"""

    type: str = Field(description="生成类型: daily_practice, unit_practice, assessment")
    count: int = Field(description="生成题目数量")
    textbook_id: int = Field(description="教材ID")
    unit_id: Optional[int] = Field(None, description="单元ID（单元练习时需要）")
    student_id: Optional[str] = Field(None, description="学生ID（每日练习时需要）")


class TextAnswerAnalysisRequest(BaseModel):
    """文本答题分析请求"""

    text_answer: str = Field(description="学生答案")


class TextAnswerAnalysisResponse(BaseModel):
    """文本答题分析响应"""

    is_correct: bool = Field(description="答案是否正确")
    analysis: str = Field(description="分析内容，如果正确则给予鼓励，如果错误则说明原因和知识点")


class AudioAnswerAnalysisRequest(BaseModel):
    """音频答题分析请求"""

    audio_url: str = Field(description="音频URL")
    audio_type: str = Field(description="音频类型")


class AudioAnswerAnalysisResponse(BaseModel):
    """音频答题分析响应"""

    text: str = Field(description="语音识别结果（转写文本）")
    match: bool = Field(description="是否匹配题目要求")
    analysis: str = Field(description="综合分析（包含原因和改进建议）")


# 教材相关模型


class UnitInfo(BaseModel):
    """单元信息模型（AI解析后）"""

    unit_name: str = Field(description="单元名称")
    unit_content: str = Field(description="单元内容摘要")
    topics: List[Dict[str, str]] = Field(
        description="知识点列表，每个知识点包含topic_name和topic_content"
    )


class TextbookUploadRequest(BaseModel):
    """教材上传请求"""

    file_name: str = Field(description="教材文件名")
    file_path: str = Field(description="教材文件路径")
    old_file_id: Optional[str] = Field(None, description="旧文件ID（如果有的话）")


# 练习相关模型


class PracticeReportAnalysisResponse(BaseModel):
    """练习报告分析响应（待实现，目前返回类型可能不同）"""

    # 注意：根据实际实现可能需要调整
    pass


# ==================== AI 服务客户端 ====================


class AIServiceClient:
    """AI 服务客户端"""

    def __init__(self):
        self.base_url = envs.AI_SERVICE_URL  # http://server-ai:7892
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=3600.0,  # 1 小时超时
            headers={"Content-Type": "application/json"},
        )

    # ==================== 题目相关 API ====================

    async def generate_questions(
        self,
        request: QuestionGenerateRequest,
    ) -> List[QuestionSchema]:
        """生成题目（使用 LangGraph 工作流）"""
        try:
            response = await self.client.post(
                "/api/question/generate", json=request.model_dump(exclude_none=True)
            )
            response.raise_for_status()
            data = response.json()
            return [QuestionSchema.model_validate(item) for item in data]
        except Exception as e:
            logger.error(f"题目生成失败: {e}")
            raise

    async def generate_question_image(self, question_id: int) -> str:
        """为指定题目生成图片，返回 OSS 路径"""
        try:
            response = await self.client.post(f"/api/question/{question_id}/image_generate")
            response.raise_for_status()
            # 返回 OSS 路径字符串
            return response.text.strip('"')
        except Exception as e:
            logger.error(f"题目图片生成失败: question_id={question_id}, error={e}")
            raise

    async def generate_question_audio(self, question_id: int) -> str:
        """为指定题目生成语音，返回 OSS 路径"""
        try:
            response = await self.client.post(f"/api/question/{question_id}/audio_generate")
            response.raise_for_status()
            # 返回 OSS 路径字符串
            return response.text.strip('"')
        except Exception as e:
            logger.error(f"题目语音生成失败: question_id={question_id}, error={e}")
            raise

    async def analyze_question_text_answer(
        self,
        question_id: int,
        text_answer: str,
    ) -> TextAnswerAnalysisResponse:
        """分析题目文本答案是否正确"""
        try:
            request = TextAnswerAnalysisRequest(text_answer=text_answer)
            response = await self.client.post(
                f"/api/question/{question_id}/text_answer_analysis", json=request.model_dump()
            )
            response.raise_for_status()
            data = response.json()
            return TextAnswerAnalysisResponse.model_validate(data)
        except Exception as e:
            logger.error(f"文本答案分析失败: question_id={question_id}, error={e}")
            raise

    async def analyze_question_audio_answer(
        self,
        question_id: int,
        audio_url: str,
        audio_type: str,
    ) -> AudioAnswerAnalysisResponse:
        """分析题目音频答案是否正确"""
        try:
            request = AudioAnswerAnalysisRequest(
                audio_url=audio_url,
                audio_type=audio_type,
            )
            response = await self.client.post(
                f"/api/question/{question_id}/audio_answer_analysis", json=request.model_dump()
            )
            response.raise_for_status()
            data = response.json()
            return AudioAnswerAnalysisResponse.model_validate(data)
        except Exception as e:
            logger.error(f"音频答案分析失败: question_id={question_id}, error={e}")
            raise

    # ==================== 练习相关 API ====================

    async def analyze_practice_report(self, practice_id: int):
        """分析练习报告

        注意：返回类型根据实际实现可能不同，目前 server-ai 中该函数返回 int
        """
        try:
            response = await self.client.post(f"/api/practice/{practice_id}/report")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"练习报告分析失败: practice_id={practice_id}, error={e}")
            raise

    # ==================== 教材相关 API ====================

    async def parse_textbook(self, file_index_id: str) -> List[UnitInfo]:
        """解析教材文件"""
        try:
            response = await self.client.post(f"/api/textbook/{file_index_id}/parse")
            response.raise_for_status()
            data = response.json()
            return [UnitInfo.model_validate(item) for item in data]
        except Exception as e:
            logger.error(f"教材解析失败: file_index_id={file_index_id}, error={e}")
            raise

    async def upload_textbook(
        self,
        request: TextbookUploadRequest,
    ):
        """上传教材文件到 RAG 知识库"""
        try:
            response = await self.client.post(
                "/api/textbook/upload", json=request.model_dump(exclude_none=True)
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"教材上传失败: {e}")
            raise

    # ==================== 兼容旧接口（已废弃，建议使用新接口） ====================

    async def analyze_answer(
        self,
        question_id: int,
        text_answer: str,
    ) -> TextAnswerAnalysisResponse:
        """分析答题情况（兼容旧接口，内部调用新接口）"""
        logger.warning("analyze_answer 方法已废弃，请使用 analyze_question_text_answer")
        return await self.analyze_question_text_answer(question_id, text_answer)

    async def close(self):
        """关闭客户端"""
        await self.client.aclose()
