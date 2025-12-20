"""练习配置工具函数"""
import json
from typing import Optional
from shared.core.database import Practice


def get_practice_config(practice: Practice, grade: Optional[int] = None) -> dict:
    """获取练习配置（支持年级定制）
    
    Args:
        practice: 练习对象
        grade: 年级（可选），如果提供则优先返回年级配置
        
    Returns:
        配置字典，包含 generate_count 和 recall_count 等字段
    """
    config = json.loads(practice.config) if practice.config else {}
    
    # 如果提供了年级，优先返回年级配置
    if grade is not None:
        grade_specific = config.get("grade_specific", {})
        grade_key = str(grade)
        if grade_key in grade_specific:
            return grade_specific[grade_key]
    
    # 返回默认配置
    default_config = config.get("default", {})
    if not default_config:
        # 如果没有配置，返回默认值
        return {"generate_count": 15, "recall_count": 0}
    
    return default_config


def get_generate_count(practice: Practice, grade: Optional[int] = None) -> int:
    """获取生成题目数量"""
    config = get_practice_config(practice, grade)
    return config.get("generate_count", 15)


def get_recall_count(practice: Practice, grade: Optional[int] = None) -> int:
    """获取召回题目数量"""
    config = get_practice_config(practice, grade)
    return config.get("recall_count", 0)

