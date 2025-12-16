from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from shared.core.database import Prompt, PromptVersion


class SharedPromptService:
    """共享 Prompt 服务，提供给 Admin 和 AI 业务使用"""

    @staticmethod
    def validate_required(input_params: dict, variables: Dict[str, Any]):
        """校验必填变量"""
        required = input_params.get("required", []) if isinstance(input_params, dict) else []
        for field in required:
            if field not in variables or variables[field] in (None, ""):
                raise ValueError(f"缺少必填变量: {field}")

    @staticmethod
    def render_template(template_content: str, variables: Dict[str, Any]) -> str:
        """渲染模板"""
        try:
            return template_content.format(**variables)
        except KeyError as e:
            raise ValueError(f"缺少变量: {e.args[0]}") from e

    @classmethod
    async def get_active_prompt_version(cls, db: AsyncSession, slug: str) -> Optional[PromptVersion]:
        """获取指定 slug 的当前发布版本 PromptVersion"""
        stmt = (
            select(PromptVersion)
            .join(Prompt, Prompt.current_version_id == PromptVersion.id)
            .where(Prompt.slug == slug)
            .where(PromptVersion.is_published == 1)
        )
        return await db.scalar(stmt)

    @classmethod
    async def render_prompt(cls, db: AsyncSession, slug: str, variables: Dict[str, Any]) -> Optional[str]:
        """
        渲染指定 Slug 的 Prompt

        Args:
            db: 数据库会话
            slug: Prompt 唯一标识
            variables: 变量字典

        Returns:
            渲染后的 prompt 内容
            如果未找到 active prompt，返回 None
        """
        version = await cls.get_active_prompt_version(db, slug)
        if not version:
            logger.warning(f"Prompt not found or not published: {slug}")
            return None

        # 校验变量
        cls.validate_required(version.input_params or {}, variables)

        # 渲染
        return cls.render_template(version.template_content, variables)
