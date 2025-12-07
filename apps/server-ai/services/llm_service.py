"""LLM 调用服务"""
from typing import Any, Dict
from loguru import logger
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.settings import envs


class LLMService:
    """LLM 服务"""
    
    @staticmethod
    async def call_llm(
        prompt: ChatPromptTemplate,
        prompt_input: Dict[str, Any],
        parser: JsonOutputParser,
        model_name: str = "qwen3-max",
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        调用大模型结构化输出内容
        
        Args:
            prompt: LangChain prompt 模板
            prompt_input: Prompt 输入数据
            parser: JSON 输出解析器
            model_name: 模型名称
            temperature: 温度参数
            
        Returns:
            Dict: 解析后的结果字典
        """
        logger.info(f"✓ LLM 调用开始: model={model_name}, input_keys={list(prompt_input.keys())}")
        
        llm = ChatOpenAI(
            model_name=model_name,
            temperature=temperature,
            openai_api_key=envs.AI_PLATFORM_KEY,
            openai_api_base=envs.AI_PLATFORM_URL,
        )
        
        chain = prompt | llm | parser
        
        try:
            result = await chain.ainvoke(prompt_input)
            logger.info(f"✓ LLM 调用成功: result_keys={list(result.keys()) if isinstance(result, dict) else 'N/A'}")
            
            # 检查结果是否为 None
            if result is None:
                logger.error("LLM 返回结果为 None")
                raise ValueError("大模型返回结果为空，请检查 prompt 或重试")
            
            # 确保 result 是字典类型
            if not isinstance(result, dict):
                logger.error(f"LLM 返回结果类型错误: {type(result)}, 内容: {result}")
                raise ValueError(f"大模型返回结果格式错误，期望字典类型，实际为: {type(result).__name__}")
            
            return result
            
        except Exception as e:
            logger.error(f"LLM 调用失败: {e}")
            raise ValueError(f"大模型调用失败: {str(e)}")
    
    @staticmethod
    async def generate_text(
        prompt_text: str,
        model_name: str = "qwen3-max",
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        """
        生成文本内容
        
        Args:
            prompt_text: 提示词文本
            model_name: 模型名称
            temperature: 温度参数
            max_tokens: 最大 token 数
            
        Returns:
            str: 生成的文本
        """
        logger.info(f"✓ 文本生成开始: model={model_name}")
        
        llm = ChatOpenAI(
            model_name=model_name,
            temperature=temperature,
            openai_api_key=envs.AI_PLATFORM_KEY,
            openai_api_base=envs.AI_PLATFORM_URL,
            max_tokens=max_tokens,
        )
        
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("user", prompt_text),
            ])
            chain = prompt | llm
            result = await chain.ainvoke({})
            
            if hasattr(result, 'content'):
                text = result.content.strip()
            elif isinstance(result, dict) and 'content' in result:
                text = result['content'].strip()
            elif isinstance(result, str):
                text = result.strip()
            else:
                raise ValueError(f"LLM 返回结果格式错误: {type(result).__name__}")
            
            logger.info(f"✓ 文本生成成功: length={len(text)}")
            return text
            
        except Exception as e:
            logger.error(f"文本生成失败: {e}")
            raise ValueError(f"文本生成失败: {str(e)}")
    
    @staticmethod
    async def generate_structured(
        prompt_text: str,
        schema: Dict[str, Any],
        model_name: str = "qwen3-max",
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        生成结构化输出
        
        Args:
            prompt_text: 提示词文本
            schema: JSON Schema 定义
            model_name: 模型名称
            temperature: 温度参数
            
        Returns:
            Dict: 结构化结果
        """
        logger.info(f"✓ 结构化输出开始: model={model_name}")
        
        try:
            # 创建 JSON 输出解析器
            parser = JsonOutputParser(pydantic_object=None)
            parser.json_schema = schema
            
            # 创建 prompt
            prompt = ChatPromptTemplate.from_messages([
                ("user", prompt_text + "\n\n请严格按照以下 JSON Schema 格式返回：\n{format_instructions}"),
            ])
            
            # 获取格式说明
            format_instructions = parser.get_format_instructions()
            prompt = prompt.partial(format_instructions=format_instructions)
            
            llm = ChatOpenAI(
                model_name=model_name,
                temperature=temperature,
                openai_api_key=envs.AI_PLATFORM_KEY,
                openai_api_base=envs.AI_PLATFORM_URL,
            )
            
            chain = prompt | llm | parser
            result = await chain.ainvoke({})
            
            if not isinstance(result, dict):
                raise ValueError(f"结构化输出格式错误，期望字典类型，实际为: {type(result).__name__}")
            
            logger.info(f"✓ 结构化输出成功: result_keys={list(result.keys())}")
            return result
            
        except Exception as e:
            logger.error(f"结构化输出失败: {e}")
            raise ValueError(f"结构化输出失败: {str(e)}")

