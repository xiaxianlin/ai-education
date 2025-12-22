"""练习配置工具函数"""
import json
from typing import Optional
from loguru import logger
from shared.core.database import Practice


def get_practice_config(practice: Practice, grade: Optional[int] = None) -> dict:
    """获取练习配置（支持年级定制）
    
    Args:
        practice: 练习对象
        grade: 年级（可选），如果提供则优先返回年级配置
        
    Returns:
        配置字典，包含 generate_count 和 recall_count 等字段
    """
    config = {"generate_count": 15, "recall_count": 0}
    
    if not practice or not hasattr(practice, "parameters") or not practice.parameters:
        return config
    
    for param in practice.parameters:
        key = param.get("key")
        if key not in ["generate_count", "recall_count"]:
            continue
            
        values = param.get("value")
        if not isinstance(values, list):
            if isinstance(values, (int, float)):
                config[key] = int(values)
            continue
            
        if grade is not None:
            grade_str = str(grade)
            for item in values:
                if isinstance(item, dict) and grade_str in item:
                    config[key] = item[grade_str]
                    break
        else:
            # 如果没有提供年级，尝试取第一个值作为默认值
            if values and isinstance(values[0], dict):
                first_val = list(values[0].values())[0]
                if isinstance(first_val, (int, float)):
                    config[key] = int(first_val)
                    
    return config


def get_generate_count(practice: Practice, grade: Optional[int] = None) -> int:
    """获取生成题目数量"""
    config = get_practice_config(practice, grade)
    return config.get("generate_count", 15)


def get_recall_count(practice: Practice, grade: Optional[int] = None) -> int:
    """获取召回题目数量"""
    config = get_practice_config(practice, grade)
    return config.get("recall_count", 0)

