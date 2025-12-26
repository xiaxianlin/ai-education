SUBJECTS = ["语文", "数学", "英语"]
TEXTBOOK_VERSIONS = ["人教版"]
SEMESTERS = ["上学期", "下学期"]
DIFFICULTY_LEVELS = ["简单", "普通", "困难"]
QUESTION_TYPES = ["选择题", "拼写题", "口语题", "判断题", "匹配题", "简答题", "应用题", "操作题"]
GRADE_NAME_MAP = {
    1: "一年级",
    2: "二年级",
    3: "三年级",
    4: "四年级",
    5: "五年级",
    6: "六年级",
    7: "七年级",
    8: "八年级",
    9: "九年级",
    10: "高一",
    11: "高二",
    12: "高三",
}

# Token 配置
TOKEN_EXPIRES_HOURS = 168  # Token 过期时间（小时），默认7天

# 密码配置
PASSWORD_LENGTH = 16  # 生成的密码长度

# AI 服务配置
AI_FALLBACK_CONTENT_MAX_LENGTH = 50  # 降级方案中用户输入的最大长度
