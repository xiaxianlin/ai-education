from enum import Enum

SUBJECTS = ["语文", "数学", "英语"]
SEMESTERS = ["上学期", "下学期"]
GRADE_NAME_MAP = {1: "一年级", 2: "二年级", 3: "三年级", 4: "四年级", 5: "五年级", 6: "六年级"}

# Token 配置
TOKEN_EXPIRES_HOURS = 168  # Token 过期时间（小时），默认7天

# 密码配置
PASSWORD_LENGTH = 16  # 生成的密码长度

# AI 服务配置
AI_FALLBACK_CONTENT_MAX_LENGTH = 50  # 降级方案中用户输入的最大长度

# ============ V2 题型系统常量 ============


# 学段枚举
class Stage(str, Enum):
    """学段枚举（仅支持小学阶段）"""

    LOW = "low"
    MID = "mid"
    HIGH = "high"


# 学段
STAGES = ["low", "mid", "high"]

STAGE_LABELS = {
    "low": "小学低段",
    "mid": "小学中段",
    "high": "小学高段",
}

STAGE_GRADES = {
    "low": [1, 2],
    "mid": [3, 4],
    "high": [5, 6],
}
