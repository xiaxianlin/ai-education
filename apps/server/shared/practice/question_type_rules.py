"""题型选择规则配置

基于学科、年级的预设题型分配规则，用于快速选择题型，
减少 LLM 调用次数和延迟。

规则优先级：
1. 学科 + 年级段 + 能力类型 → 特定规则
2. 学科 + 年级段 → 默认规则
3. 无匹配规则 → 使用 LLM 选择
"""

from typing import Any, Dict, List, Optional

from loguru import logger


# 年级段划分
def _get_grade_stage(grade: int) -> str:
    """获取年级段"""
    if grade <= 3:
        return "grades_1_3"  # 低年级
    elif grade <= 6:
        return "grades_4_6"  # 高年级
    elif grade <= 9:
        return "grades_7_9"  # 初中
    else:
        return "grades_10_12"  # 高中


# 题型分配规则
# 结构: subject -> grade_stage -> rule_type -> selections
QUESTION_TYPE_RULES: Dict[str, Dict[str, Dict[str, List[Dict[str, Any]]]]] = {
    "math": {
        "grades_1_3": {
            "default": [
                {"code": "fill_blank", "ratio": 0.4, "difficulty": "easy"},
                {"code": "choice", "ratio": 0.4, "difficulty": "easy"},
                {"code": "calculation", "ratio": 0.2, "difficulty": "easy"},
            ],
        },
        "grades_4_6": {
            "default": [
                {"code": "fill_blank", "ratio": 0.3, "difficulty": "medium"},
                {"code": "choice", "ratio": 0.3, "difficulty": "medium"},
                {"code": "calculation", "ratio": 0.2, "difficulty": "medium"},
                {"code": "application", "ratio": 0.2, "difficulty": "medium"},
            ],
        },
        "grades_7_9": {
            "default": [
                {"code": "choice", "ratio": 0.3, "difficulty": "medium"},
                {"code": "fill_blank", "ratio": 0.2, "difficulty": "medium"},
                {"code": "calculation", "ratio": 0.25, "difficulty": "medium"},
                {"code": "proof", "ratio": 0.25, "difficulty": "hard"},
            ],
        },
    },
    "chinese": {
        "grades_1_3": {
            "default": [
                {"code": "choice", "ratio": 0.4, "difficulty": "easy"},
                {"code": "fill_blank", "ratio": 0.4, "difficulty": "easy"},
                {"code": "reading", "ratio": 0.2, "difficulty": "easy"},
            ],
        },
        "grades_4_6": {
            "default": [
                {"code": "choice", "ratio": 0.3, "difficulty": "medium"},
                {"code": "fill_blank", "ratio": 0.3, "difficulty": "medium"},
                {"code": "reading", "ratio": 0.2, "difficulty": "medium"},
                {"code": "writing", "ratio": 0.2, "difficulty": "medium"},
            ],
        },
    },
    "english": {
        "grades_1_3": {
            "default": [
                {"code": "choice", "ratio": 0.5, "difficulty": "easy"},
                {"code": "fill_blank", "ratio": 0.3, "difficulty": "easy"},
                {"code": "listening", "ratio": 0.2, "difficulty": "easy"},
            ],
        },
        "grades_4_6": {
            "default": [
                {"code": "choice", "ratio": 0.4, "difficulty": "medium"},
                {"code": "fill_blank", "ratio": 0.2, "difficulty": "medium"},
                {"code": "reading", "ratio": 0.2, "difficulty": "medium"},
                {"code": "listening", "ratio": 0.2, "difficulty": "medium"},
            ],
        },
    },
}


def get_rule_based_selection(
    subject: str,
    grade: int,
    total_count: int,
    available_type_codes: List[str],
    ability_code: Optional[str] = None,
) -> Optional[List[Dict[str, Any]]]:
    """根据规则获取题型分配

    Args:
        subject: 学科
        grade: 年级
        total_count: 需要生成的题目总数
        available_type_codes: 可用的题型代码列表
        ability_code: 能力代码（可选）

    Returns:
        题型分配列表，每个元素包含:
            - question_type_code: 题型代码
            - question_type_name: 题型名称（暂时设为代码）
            - difficulty: 难度
            - question_count: 题目数量
        如果无匹配规则则返回 None
    """
    grade_stage = _get_grade_stage(grade)

    # 查找规则
    subject_rules = QUESTION_TYPE_RULES.get(subject, {})
    stage_rules = subject_rules.get(grade_stage, {})

    # 先尝试特定能力规则，再尝试默认规则
    rule_selections = stage_rules.get(ability_code) or stage_rules.get("default")

    if not rule_selections:
        logger.debug(f"未找到题型规则: subject={subject}, grade={grade}, stage={grade_stage}")
        return None

    # 过滤出可用的题型
    filtered_selections = [
        sel for sel in rule_selections if sel["code"] in available_type_codes
    ]

    if not filtered_selections:
        logger.debug(f"规则中的题型均不可用: subject={subject}, available={available_type_codes}")
        return None

    # 重新计算比例（确保总和为 1）
    total_ratio = sum(sel["ratio"] for sel in filtered_selections)
    if total_ratio == 0:
        return None

    # 按比例分配题目数量
    result = []
    remaining = total_count
    for i, sel in enumerate(filtered_selections):
        normalized_ratio = sel["ratio"] / total_ratio
        if i == len(filtered_selections) - 1:
            # 最后一个题型分配剩余数量
            count = remaining
        else:
            count = round(total_count * normalized_ratio)
            remaining -= count

        if count > 0:
            result.append({
                "question_type_code": sel["code"],
                "question_type_name": sel["code"],  # 可以后续从数据库获取名称
                "difficulty": sel["difficulty"],
                "question_count": count,
            })

    logger.info(f"使用规则引擎选择题型: subject={subject}, grade={grade}, result={result}")
    return result if result else None
