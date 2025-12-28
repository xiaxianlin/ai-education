"""
管理员模型
"""

from .base import BaseModel, Mapped, mapped_column, String, now


class Manager(BaseModel):
    """管理员表"""

    __tablename__ = "ah_manager"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    token: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    type: Mapped[int] = mapped_column(default=0)
    status: Mapped[int] = mapped_column(default=0)
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)


__all__ = ["Manager"]
