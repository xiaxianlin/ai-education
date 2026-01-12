from enum import Enum

SUBJECTS = ["语文", "数学", "英语"]
SEMESTERS = ["上学期", "下学期"]
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

# ============ V2 题型系统常量 ============


# 学段枚举
class Stage(str, Enum):
    """学段枚举"""

    PRIMARY_LOW = "primary_low"
    PRIMARY_HIGH = "primary_high"
    JUNIOR = "junior"
    SENIOR = "senior"


# 学段（保持向后兼容）
STAGES = ["primary_low", "primary_high", "junior", "senior"]

STAGE_LABELS = {
    "primary_low": "小学低段",
    "primary_high": "小学高段",
    "junior": "初中",
    "senior": "高中",
}

STAGE_GRADES = {
    "primary_low": [1, 2, 3],
    "primary_high": [4, 5, 6],
    "junior": [7, 8, 9],
    "senior": [10, 11, 12],
}


# 交互类型枚举
class InteractionType(str, Enum):
    """交互类型枚举"""

    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"
    IMAGE_CHOICE = "image_choice"
    TEXT_INPUT = "text_input"
    HANDWRITING = "handwriting"
    VOICE_INPUT = "voice_input"
    DRAG_DROP = "drag_drop"
    CONNECT_LINE = "connect_line"
    SORT_ORDER = "sort_order"
    TRUE_FALSE = "true_false"
    CORRECT_WRONG = "correct_wrong"
    FOLLOW_READ = "follow_read"
    FREE_SPEAK = "free_speak"
    FILL_BLANK = "fill_blank"
    MULTI_STEP = "multi_step"


# 交互类型（保持向后兼容）
INTERACTION_TYPES = [
    "single_choice",  # 单选
    "multi_choice",  # 多选
    "image_choice",  # 图片选择
    "text_input",  # 文本输入
    "handwriting",  # 手写输入
    "voice_input",  # 语音输入
    "drag_drop",  # 拖拽放置
    "connect_line",  # 连线匹配
    "sort_order",  # 排序排列
    "true_false",  # 是非判断
    "correct_wrong",  # 对错判断
    "follow_read",  # 跟读
    "free_speak",  # 自由表达
    "fill_blank",  # 填空
    "multi_step",  # 多步骤
]

INTERACTION_TYPE_LABELS = {
    "single_choice": "单选题",
    "multi_choice": "多选题",
    "image_choice": "图片选择",
    "text_input": "文本输入",
    "handwriting": "手写输入",
    "voice_input": "语音输入",
    "drag_drop": "拖拽放置",
    "connect_line": "连线匹配",
    "sort_order": "排序排列",
    "true_false": "是非判断",
    "correct_wrong": "对错判断",
    "follow_read": "跟读",
    "free_speak": "自由表达",
    "fill_blank": "填空",
    "multi_step": "多步骤",
}


# 认知层次枚举（布鲁姆分类法）
class CognitiveLevel(str, Enum):
    """认知层次枚举"""

    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"


# 认知层次（保持向后兼容）
COGNITIVE_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"]

COGNITIVE_LEVEL_LABELS = {
    "remember": "识记",
    "understand": "理解",
    "apply": "应用",
    "analyze": "分析",
    "evaluate": "评价",
    "create": "创造",
}


# 资源类型枚举 V2
class ResourceType(str, Enum):
    """资源类型枚举"""

    NONE = "none"
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    ANIMATION = "animation"


# 资源类型（保持向后兼容）
RESOURCE_TYPES = ["none", "text", "image", "audio", "video", "animation"]


# 答案类型枚举
class AnswerType(str, Enum):
    """答案类型枚举"""

    EXACT = "exact"
    FUZZY = "fuzzy"
    RUBRIC = "rubric"
    AI = "ai"
    COMPOSITE = "composite"


# 答案类型（保持向后兼容）
ANSWER_TYPES = ["exact", "fuzzy", "rubric", "ai", "composite"]

ANSWER_TYPE_LABELS = {
    "exact": "精确匹配",
    "fuzzy": "模糊匹配",
    "rubric": "评分标准",
    "ai": "AI评分",
    "composite": "复合题",
}


# 难度枚举（英文值）
class Difficulty(str, Enum):
    """难度枚举"""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# 难度（保持向后兼容）
DIFFICULTY_LEVELS = ["easy", "medium", "hard"]

DIFFICULTY_LEVEL_LABELS = {
    "easy": "简单",
    "medium": "中等",
    "hard": "困难",
}


