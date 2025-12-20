SUBJECTS = ["英语", "数学"]
TEXTBOOK_VERSIONS = ["人教版"]
SEMESTERS = ["上学期", "下学期", "整学期"]
DIFFICULTY_LEVELS = ["简单", "普通", "困难"]
question_types = ["选择题", "输入题", "口语题", "判断题", "匹配题", "应用题"]

# 生成题目数量
GENERATE_QUESTION_COUNT = {
    1: {
        "daily_practice": 15,
        "unit_practice": 15,
        "assessment": 25,
    }
}

# 题目召回数量
QUESTION_RECALL_COUNT = 0
