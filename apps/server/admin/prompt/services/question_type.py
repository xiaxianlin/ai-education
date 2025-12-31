"""
题型场景的提示词优化服务
"""

from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from shared.core.database import QuestionType
from shared.provider import get_provider
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# 优化提示词模板
OPTIMIZE_QUESTION_TYPE_PROMPT = """
你是一名专业的AI提示词优化工程师，专门优化教育场景下的题目生成提示词。

## 原始提示词

```markdown
{original_prompt}
```

## 用户优化建议

{user_suggestion}

请直接返回优化后的提示词，不要添加任何解释或说明。
"""


def _format_config(config: dict | None) -> str:
    """格式化配置信息为可读文本"""
    if not config:
        return "无"
    try:
        import json

        return json.dumps(config, ensure_ascii=False, indent=2)
    except Exception:
        return str(config)


def _format_list(items: list | None) -> str:
    """格式化列表为可读文本"""
    if not items:
        return "无"
    return "、".join(str(item) for item in items)


async def optimize_question_type_prompt(db: AsyncSession, code: str, suggestion: str = "无优化建议") -> str:
    """优化题型的提示词

    Args:
        db: 数据库会话
        code: 题型编码
        suggestion: 用户提供的优化建议（可选）

    Returns:
        str: 优化后的提示词

    Raises:
        ValueError: 如果题型不存在或提示词为空
    """
    # 获取题型信息
    result = await db.execute(select(QuestionType).where(QuestionType.code == code))
    question_type = result.scalar_one_or_none()

    if not question_type or not question_type.ai_prompt:
        raise ValueError(f"题型不存在或提示词为空: code={code}")

    logger.info(f"开始优化题型提示词，code={code}, name={question_type.name}")

    prompt = ChatPromptTemplate.from_template(OPTIMIZE_QUESTION_TYPE_PROMPT)
    prompt_input = {
        "original_prompt": question_type.ai_prompt,
        "user_suggestion": suggestion,
    }
    # 打印完整的提示词文本，便于调试核查
    prompt_text = prompt.format(**prompt_input)
    logger.info(f"完整提示词文本（用于优化）:\n{prompt_text}")

    # 调用 LLM 优化
    provider = get_provider()
    llm = provider.get_langchain_client()

    client = prompt | llm
    result = await client.ainvoke(prompt_input)

    logger.info(f"题型提示词优化完成，code={code}, 优化后长度={len(result.content)}")
    return result.content
