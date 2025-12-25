SUBJECTS = ["英语", "数学", "语文"]
TEXTBOOK_VERSIONS = ["人教版"]
SEMESTERS = ["上学期", "下学期", "整学期"]
DIFFICULTY_LEVELS = ["简单", "普通", "困难"]
QUESTION_TYPES = ["选择题", "拼写题", "口语题", "判断题", "匹配题", "简答题", "应用题"]

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

# Token 配置
TOKEN_EXPIRES_HOURS = 168  # Token 过期时间（小时），默认7天

# 密码配置
PASSWORD_LENGTH = 16  # 生成的密码长度

# AI 服务配置
AI_FALLBACK_CONTENT_MAX_LENGTH = 50  # 降级方案中用户输入的最大长度
