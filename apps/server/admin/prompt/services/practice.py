"""
练习场景的提示词优化服务
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger

from shared.core.database import Practice
from shared.provider import get_provider

# 优化提示词模板
OPTIMIZE_PRACTICE_PROMPT = """你是一名专业的AI提示词优化工程师，专门优化教育场景下的练习生成提示词。

请根据以下原始提示词，优化其表达，使其更加清晰、准确、有效。

原始提示词：
{prompt}

优化要求：
1. **保持原有意图**：确保优化后的提示词与原始提示词的核心意图完全一致
2. **提高清晰度**：使用更清晰、更具体的表达方式，避免歧义
3. **优化结构**：合理组织提示词结构，使其更易理解
4. **符合教育场景**：确保提示词适合教育场景，能够生成高质量的练习题目
5. **保持完整性**：不要遗漏原始提示词中的任何重要信息

{user_suggestion}

请直接返回优化后的提示词，不要添加任何解释或说明。"""


async def optimize_prompt(
    db: AsyncSession,
    code: str,
    suggestion: str | None = None,
) -> str:
    """优化练习的提示词

    Args:
        db: 数据库会话
        code: 练习标识（slug）
        suggestion: 用户提供的优化建议（可选）

    Returns:
        str: 优化后的提示词

    Raises:
        ValueError: 如果练习不存在或提示词为空
    """
    # 获取练习信息
    result = await db.execute(select(Practice).where(Practice.slug == code))
    practice = result.scalar_one_or_none()

    if not practice:
        raise ValueError(f"练习不存在: slug={code}")

    # 获取原始提示词
    original_prompt = practice.prompt
    if not original_prompt:
        raise ValueError(f"练习的提示词为空: slug={code}")

    logger.info(f"开始优化练习提示词，slug={code}")

    # 构建优化提示词
    user_suggestion_text = ""
    if suggestion and suggestion.strip():
        user_suggestion_text = f"\n用户优化建议：\n{suggestion}\n\n请根据以上建议进行优化。"
    else:
        user_suggestion_text = "\n请根据上述要求进行优化。"

    optimize_prompt_template = OPTIMIZE_PRACTICE_PROMPT.format(
        prompt=original_prompt,
        user_suggestion=user_suggestion_text,
    )

    # 构建 LangChain 提示词
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一名专业的AI提示词优化工程师。"),
            ("user", optimize_prompt_template),
        ]
    )

    # 调用 LLM 优化
    provider = get_provider()
    optimized_prompt = await provider.invoke_chain(prompt)

    if not optimized_prompt or not isinstance(optimized_prompt, str):
        raise ValueError("LLM 返回的优化结果格式错误")

    logger.info(f"练习提示词优化完成，slug={code}")
    return optimized_prompt.strip()

