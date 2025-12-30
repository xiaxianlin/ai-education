from enum import Enum

SUBJECTS = ["语文", "数学", "英语"]
TEXTBOOK_VERSIONS = ["人教版"]
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


# ============ 专项类型常量 ============


# 专项类型枚举
class SpecialtyType(str, Enum):
    """练习专项类型枚举"""

    # 语文专项
    PINYIN = "pinyin"  # 拼音
    LITERACY = "literacy"  # 识字
    VOCABULARY = "vocabulary"  # 词语
    SENTENCE = "sentence"  # 句子
    PARAGRAPH = "paragraph"  # 段落
    READING = "reading"  # 阅读
    WRITING = "writing"  # 写话/习作
    COMPREHENSIVE_CHINESE = "comprehensive_chinese"  # 语文综合

    # 数学专项
    COUNTING = "counting"  # 数数
    CALCULATION = "calculation"  # 计算
    SHAPE = "shape"  # 图形
    POSITION = "position"  # 位置
    MEASUREMENT = "measurement"  # 测量
    STATISTICS = "statistics"  # 统计
    PROBLEM_SOLVING = "problem_solving"  # 解决问题
    COMPREHENSIVE_MATH = "comprehensive_math"  # 数学综合

    # 英语专项
    ALPHABET = "alphabet"  # 字母
    WORDS = "words"  # 单词
    SENTENCE_PATTERN = "sentence_pattern"  # 句型
    GRAMMAR = "grammar"  # 语法
    LISTENING = "listening"  # 听力
    SPEAKING = "speaking"  # 口语
    ENGLISH_READING = "english_reading"  # 英语阅读
    COMPREHENSIVE_ENGLISH = "comprehensive_english"  # 英语综合


# 专项类型标签
SPECIALTY_TYPE_LABELS = {
    # 语文
    "pinyin": "拼音专项",
    "literacy": "识字专项",
    "vocabulary": "词语专项",
    "sentence": "句子专项",
    "paragraph": "段落专项",
    "reading": "阅读专项",
    "writing": "写话/习作专项",
    "comprehensive_chinese": "语文综合",
    # 数学
    "counting": "数数专项",
    "calculation": "计算专项",
    "shape": "图形专项",
    "position": "位置专项",
    "measurement": "测量专项",
    "statistics": "统计专项",
    "problem_solving": "解决问题专项",
    "comprehensive_math": "数学综合",
    # 英语
    "alphabet": "字母专项",
    "words": "单词专项",
    "sentence_pattern": "句型专项",
    "grammar": "语法专项",
    "listening": "听力专项",
    "speaking": "口语专项",
    "english_reading": "英语阅读专项",
    "comprehensive_english": "英语综合",
}

# 按科目分组的专项类型
SPECIALTY_TYPES_BY_SUBJECT = {
    "语文": [
        "pinyin",
        "literacy",
        "vocabulary",
        "sentence",
        "paragraph",
        "reading",
        "writing",
        "comprehensive_chinese",
    ],
    "数学": [
        "counting",
        "calculation",
        "shape",
        "position",
        "measurement",
        "statistics",
        "problem_solving",
        "comprehensive_math",
    ],
    "英语": [
        "alphabet",
        "words",
        "sentence_pattern",
        "grammar",
        "listening",
        "speaking",
        "english_reading",
        "comprehensive_english",
    ],
}
