SUBJECTS = ["数学", "英语"]
TEXTBOOK_VERSIONS = ["人教版"]
SEMESTERS = ["上学期", "下学期", "整学期"]
DIFFICULTY_LEVELS = ["简单", "普通", "困难"]


QUESTION_TYPES = {
    "数学": {
        1: {
            "选择题": [
                "数位判断",
                "图形归类",
                "快速口算",
                "数位看图",
            ],
            "填空题": [
                "键盘输入计算",
                "规律填数",
                "组成与分解",
            ],
            "识图题": [
                "看图列式",
                "数图形",
                "数位看图",
            ],
            "排序题": [
                "数字大小排序",
                "算式结果排序",
                "序数排列",
            ],
            "匹配题": [
                "算式与结果匹配",
                "时钟与时间匹配",
                "符号与概念匹配",
            ],
        }
    },
    "英语": {
        1: {
            "选择题": [
                "看图选词",
                "看图选句",
                "听音选词",
                "听音选句",
                "句型填空",
                "词序重组",
            ],
            "拼写题": [
                "听音写单词",
                "看图写单词",
                "单词重组",
                "单词翻译",
            ],
            "口语题": [
                "单词拼读",
                "句子拼读",
                "听题回答",
                "看图回答",
                "角色扮演对话",
            ],
        }
    },
}


def get_question_types(subject: str, grade: int):
    return QUESTION_TYPES[subject][grade]


def extract_question_subtypes():
    """从 QUESTION_TYPES 中提取所有唯一的子类型"""
    subtypes = set()
    for subject_data in QUESTION_TYPES.values():
        for grade_data in subject_data.values():
            for type_subtypes in grade_data.values():
                subtypes.update(type_subtypes)
    return sorted(list(subtypes))


# 所有题目子类型（从 QUESTION_TYPES 中提取）
QUESTION_SUBTYPES = extract_question_subtypes()
