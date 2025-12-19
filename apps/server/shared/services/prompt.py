"""Prompt 服务 - 提供统一的 Prompt 获取和处理接口

使用 LangChain 进行 prompt 模板处理，支持从数据库动态加载。
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger
from langchain_core.prompts import ChatPromptTemplate

from shared.core.database import PracticePrompt, Prompt, PromptVersion


async def get_prompt_version(db: AsyncSession, slug: str):
    """获取指定 slug 的当前发布版本 PromptVersion

    Args:
        db: 数据库会话
        slug: Prompt 唯一标识

    Returns:
        PromptVersion 对象，如果未找到则返回 None
    """
    stmt = (
        select(PromptVersion)
        .options(joinedload(PromptVersion.prompt))
        .join(Prompt, Prompt.current_version_id == PromptVersion.id)
        .where(Prompt.slug == slug, PromptVersion.is_published == 1)
        .order_by(PromptVersion.id.desc())
    )
    return await db.scalar(stmt)


async def get_chat_prompt_template(
    db: AsyncSession, slug: str, extra_prompt: Optional[str] = None
) -> ChatPromptTemplate:
    """获取 ChatPromptTemplate，优先从数据库加载

    Args:
        db: 数据库会话，如果为 None 则使用默认模板
        slug: Prompt 唯一标识
        extra_prompt: 额外的提示词

    Returns:
        ChatPromptTemplate 对象
    """
    prompt_version = await get_prompt_version(db, slug)
    if not prompt_version:
        raise ValueError(f"Prompt 不存在: {slug}")

    content = prompt_version.template_content
    if extra_prompt:
        content = content + "\n" + extra_prompt

    template = ChatPromptTemplate.from_messages((prompt_version.prompt.type, content))
    logger.info(f"获取 Prompt: {slug}, 内容: {content}")
    return template


# ==================== 业务入口方法 ====================


class PromptService:
    """Prompt 服务类 - 提供统一的 Prompt 获取和处理接口"""

    @staticmethod
    async def get_image_optimize_prompt(db: AsyncSession, input_payload: Optional[dict] = None):
        """获取图片优化提示词模板

        Args:
            db: 数据库会话
            input_payload: 需要预先填充的变量（使用 partial），如果为 None 则返回未填充的模板

        Returns:
            ChatPromptTemplate 对象
        """
        template = await get_chat_prompt_template(db=db, slug="image_prompt_optimize")
        if input_payload:
            return template.partial(**input_payload)
        return template

    @staticmethod
    async def get_answer_analyze_prompt(
        db: AsyncSession, format_instructions: Optional[str] = None, input_payload: Optional[dict] = None
    ):
        """获取答案分析提示词模板

        Args:
            db: 数据库会话
            format_instructions: JSON 格式说明，会通过 partial 填充到模板中
            input_payload: 需要预先填充的其他变量（使用 partial）

        Returns:
            ChatPromptTemplate 对象
        """
        template = await get_chat_prompt_template(db=db, slug="analyze_question_answer")
        
        # 合并所有需要 partial 填充的变量
        partial_vars = {}
        if format_instructions:
            partial_vars["format_instructions"] = format_instructions
        if input_payload:
            partial_vars.update(input_payload)
        
        if partial_vars:
            return template.partial(**partial_vars)
        return template


# 保持向后兼容的函数接口
async def get_image_optimize_prompt(db: AsyncSession, input_payload: Optional[dict] = None):
    """获取图片优化提示词模板（向后兼容函数）"""
    return await PromptService.get_image_optimize_prompt(db, input_payload)


async def get_answer_analyze_prompt(db: AsyncSession, input_payload: Optional[dict] = None):
    """获取答案分析提示词模板（向后兼容函数）"""
    return await PromptService.get_answer_analyze_prompt(db, input_payload=input_payload)


async def get_practice_prompt_slug(db: AsyncSession, practice_type: str, grade: int, subject: str):
    """获取练习提示词模板标识

    Args:
        db: 数据库会话
        practice_type: 练习类型（"daily_practice" 或 "unit_practice"）
        grade: 年级
        subject: 学科（"数学" 或 "英语"）

    Returns:
        Prompt 唯一标识
    """
    practice_prompt = await db.scalar(
        select(PracticePrompt)
        .options(joinedload(PracticePrompt.prompt))
        .where(
            PracticePrompt.practice_type == practice_type,
            PracticePrompt.grade == grade,
            PracticePrompt.subject == subject,
        )
    )
    if not practice_prompt:
        raise ValueError(f"练习提示词不存在: {practice_type} {grade} {subject}")

    return practice_prompt.prompt.slug


async def get_daily_practice_prompt(db: AsyncSession, grade: int, subject: str, extra_prompt: Optional[str] = None):
    """获取每日练习提示词模板

    Args:
        db: 数据库会话
        grade: 年级
        subject: 学科（"数学" 或 "英语"）
        extra_prompt: 额外的提示词

    Returns:
        ChatPromptTemplate 对象
    """

    slug = await get_practice_prompt_slug(db, "daily_practice", grade, subject)
    return await get_chat_prompt_template(db, slug, extra_prompt)


async def get_unit_practice_prompt(db: AsyncSession, grade: int, subject: str, extra_prompt: Optional[str] = None):
    """获取单元练习提示词模板

    Args:
        db: 数据库会话
        grade: 年级
        subject: 学科（"数学" 或 "英语"）
        extra_prompt: 额外的提示词

    Returns:
        ChatPromptTemplate 对象
    """
    slug = await get_practice_prompt_slug(db, "unit_practice", grade, subject)
    return await get_chat_prompt_template(db, slug, extra_prompt)


async def get_assessment_prompt(db: AsyncSession, grade: int, subject: str, extra_prompt: Optional[str] = None):
    """获取能力评估提示词模板

    Args:
        db: 数据库会话
        grade: 年级
        subject: 学科（"数学" 或 "英语"）
        extra_prompt: 额外的提示词

    Returns:
        ChatPromptTemplate 对象
    """
    slug = await get_practice_prompt_slug(db, "assessment", grade, subject)
    return await get_chat_prompt_template(db, slug, extra_prompt)
