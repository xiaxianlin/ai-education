"""答题分析 Worker"""
from typing import Dict, Any
from loguru import logger

from services.analysis_service import AnalysisService


class AnalysisWorker:
    """答题分析 Worker"""
    
    async def analyze(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        分析答题情况
        
        Args:
            payload: 包含以下字段：
                - content: 题目内容
                - options: 选项（可选）
                - knowledge: 知识点（可选）
                - question_answer: 参考答案
                - student_answer: 学生答案
                - model_name: 模型名称（可选，默认 qwen3-max-preview）
                - temperature: 温度参数（可选，默认 0.7）
                
        Returns:
            Dict: 包含 is_correct 和 analysis 的字典
        """
        logger.info(f"开始分析答题情况: content_length={len(payload.get('content', ''))}")
        
        content = payload.get("content", "")
        options = payload.get("options", "")
        knowledge = payload.get("knowledge", "")
        question_answer = payload.get("question_answer", "")
        student_answer = payload.get("student_answer", "")
        model_name = payload.get("model_name", "qwen3-max-preview")
        temperature = payload.get("temperature", 0.7)
        
        if not content:
            raise ValueError("content 字段不能为空")
        if not question_answer:
            raise ValueError("question_answer 字段不能为空")
        if not student_answer:
            raise ValueError("student_answer 字段不能为空")
        
        result = await AnalysisService.analyze_answer(
            content=content,
            options=options,
            knowledge=knowledge,
            question_answer=question_answer,
            student_answer=student_answer,
            model_name=model_name,
            temperature=temperature,
        )
        
        logger.info(f"答题分析完成: is_correct={result.get('is_correct')}")
        
        return result

