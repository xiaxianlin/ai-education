"""
提示词模型
"""

from .base import BaseModel, Mapped, mapped_column, String, Text, JSON, now


class Prompt(BaseModel):
    """提示词表"""

    __tablename__ = "ah_prompt"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), comment="Prompt 名称")
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True, comment="唯一短名")
    type: Mapped[str] = mapped_column(String(64), comment="类型：system/user")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="描述")
    template_content: Mapped[str] = mapped_column(Text, comment="模版内容")
    negative_content: Mapped[str] = mapped_column(Text, nullable=True, comment="用于图像生成类")
    model_params: Mapped[dict] = mapped_column(JSON, default=dict, comment="模型参数")
    create_time: Mapped[int] = mapped_column(default=now, comment="创建时间")
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now, comment="更新时间")


__all__ = ["Prompt"]
