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
        
    Raises:
        ValueError: 当配置格式错误时
    """
    if not practice or not practice.config:
        # 如果没有配置，返回默认值
        return {"generate_count": 15, "recall_count": 0}
    
    try:
        config = json.loads(practice.config)
        if not isinstance(config, dict):
            raise ValueError(f"练习配置格式错误: practice_id={practice.id}, config 不是字典类型")
    except json.JSONDecodeError as e:
        raise ValueError(f"练习配置 JSON 解析失败: practice_id={practice.id}, error={str(e)}")
    
    # 如果提供了年级，优先返回年级配置
    if grade is not None:
        grade_specific = config.get("grade_specific", {})
        if not isinstance(grade_specific, dict):
            logger.warning(f"年级特定配置格式错误: practice_id={practice.id}, 使用默认配置")
        else:
            grade_key = str(grade)
            if grade_key in grade_specific:
                grade_config = grade_specific[grade_key]
                if isinstance(grade_config, dict):
                    return grade_config
                else:
                    logger.warning(f"年级配置格式错误: practice_id={practice.id}, grade={grade}, 使用默认配置")
    
    # 返回默认配置
    default_config = config.get("default", {})
    if not isinstance(default_config, dict):
        logger.warning(f"默认配置格式错误: practice_id={practice.id}, 使用系统默认值")
        return {"generate_count": 15, "recall_count": 0}
    
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

