from typing import List, Set, Dict

SUBJECTS = ["数学", "英语"]
TEXTBOOK_VERSIONS = ["人教版"]
SEMESTERS = ["上学期", "下学期", "整学期"]
DIFFICULTY_LEVELS = ["简单", "普通", "困难"]

# 题目类型和子类型的映射关系
# 格式: {主类型: [子类型列表]}
QUESTION_SUBTYPES: Dict[str, List[str]] = {
    "选择题": [
        "看图选词",
        "看图选句",
        "听音选词",
        "听音选句",
        "情景问答",
        "句型填空",
        "词序重组",
        "快速口算",
        "数位判断",
        "图形归类",
    ],
    "拼写题": ["听音写单词", "看图写单词", "单词重组", "单词翻译"],
    "口语题": [
        "单词精准模仿",
        "句子情绪模仿",
        "朗读小挑战",
        "听问题口头回答",
        "看图口头描述",
        "角色扮演对话",
    ],
    "填空题": ["键盘输入计算", "规律填数", "组成与分解"],
    "识图题": ["看图列式", "数图形", "数位看图"],
    "排序题": ["数字大小排序", "算式结果排序", "序数排列"],
    "匹配题": ["算式与结果匹配", "时钟与时间匹配", "符号与概念匹配"],
}

# 根据科目和年级返回对应的题型
# 格式: {科目: {年级范围: [题型列表]}}
# 目前只支持一年级的英语和数学
QUESTION_TYPES_BY_SUBJECT_GRADE = {
    "数学": {
        (1, 1): ["选择题", "填空题", "识图题", "排序题", "匹配题"],  # 一年级
    },
    "英语": {
        (1, 1): ["选择题", "拼写题", "口语题"],  # 一年级
    },
}


def _collect_all_question_types() -> List[str]:
    """
    从 QUESTION_TYPES_BY_SUBJECT_GRADE 中收集所有唯一的题型

    Returns:
        所有题型的聚合列表（去重并排序）
    """
    all_types: Set[str] = set()

    # 遍历所有科目和年级范围，收集所有题型
    for subject_types in QUESTION_TYPES_BY_SUBJECT_GRADE.values():
        for types in subject_types.values():
            all_types.update(types)

    # 排序并返回
    return sorted(list(all_types))


# 所有题型的聚合（从 QUESTION_TYPES_BY_SUBJECT_GRADE 中自动收集）
QUESTION_TYPES = _collect_all_question_types()


def get_question_types(subject: str, grade: int) -> List[str]:
    """
    根据科目和年级返回对应的题型列表

    Args:
        subject: 科目名称
        grade: 年级（1-12）

    Returns:
        题型列表，如果找不到匹配的科目或年级，返回空列表
    """
    if subject not in QUESTION_TYPES_BY_SUBJECT_GRADE:
        # 如果科目不在映射中，返回空列表
        return []

    grade_ranges = QUESTION_TYPES_BY_SUBJECT_GRADE[subject]

    # 查找匹配的年级范围
    for (min_grade, max_grade), types in grade_ranges.items():
        if min_grade <= grade <= max_grade:
            return types

    # 如果没有找到匹配的年级范围，返回空列表
    return []


def get_question_subtypes(question_type: str) -> List[str]:
    """
    根据题目主类型返回对应的子类型列表

    Args:
        question_type: 题目主类型

    Returns:
        子类型列表，如果找不到匹配的主类型，返回空列表
    """
    return QUESTION_SUBTYPES.get(question_type, [])
