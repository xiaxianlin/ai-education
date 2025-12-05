"""题目生成 Worker"""
from typing import Dict, Any
from loguru import logger

from services.llm_service import LLMService


class QuestionWorker:
    """题目生成 Worker"""
    
    async def generate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        生成题目
        
        Args:
            payload: 包含以下字段：
                - prompt: LangChain ChatPromptTemplate（需要序列化后传递，或传递 prompt 配置）
                - prompt_input: Prompt 输入数据
                - parser_config: Parser 配置（用于重建 JsonOutputParser）
                - model_name: 模型名称（可选）
                - temperature: 温度参数（可选）
                
        Returns:
            Dict: 生成的题目数据
        """
        logger.info(f"开始生成题目: payload_keys={list(payload.keys())}")
        
        # 注意：由于 LangChain 的 prompt 和 parser 对象无法直接序列化，
        # 实际使用时需要通过配置重建这些对象
        # 这里提供一个简化的实现示例
        
        # 从 payload 中提取数据
        prompt_text = payload.get("prompt_text", "")
        prompt_input = payload.get("prompt_input", {})
        model_name = payload.get("model_name", "qwen3-max")
        temperature = payload.get("temperature", 0.7)
        
        # 调用 LLM 生成文本
        result_text = await LLMService.generate_text(
            prompt_text=prompt_text,
            model_name=model_name,
            temperature=temperature,
        )
        
        logger.info(f"题目生成完成: result_length={len(result_text)}")
        
        return {
            "result": result_text,
            "model": model_name,
        }

