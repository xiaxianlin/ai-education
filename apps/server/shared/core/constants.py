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


# ============ 能力维度常量 ============


# 能力维度枚举（按科目分组，使用科目前缀区分）
class AbilityType(str, Enum):
    """能力维度枚举"""

    # 语文能力
    CHINESE_PHONETIC = "phonetic"  # 拼音
    CHINESE_CHARACTER = "character"  # 识字写字
    CHINESE_VOCABULARY = "vocabulary"  # 词语积累
    CHINESE_SENTENCE = "sentence"  # 句子运用
    CHINESE_PARAGRAPH = "paragraph"  # 段落
    CHINESE_READING = "reading"  # 阅读理解
    CHINESE_WRITING = "writing"  # 书面表达
    CHINESE_SPEAKING = "speaking"  # 口语表达
    CHINESE_COMPREHENSIVE = "comprehensive_chinese"  # 语文综合

    # 数学能力
    MATH_NUMBER_SENSE = "number_sense"  # 数感
    MATH_COUNTING = "counting"  # 数数
    MATH_CALCULATION = "calculation"  # 运算能力
    MATH_SHAPE = "shape"  # 图形
    MATH_POSITION = "position"  # 位置
    MATH_MEASUREMENT = "measurement"  # 测量
    MATH_STATISTICS = "statistics"  # 统计
    MATH_PROBLEM_SOLVING = "problem_solving"  # 解决问题
    MATH_SPATIAL = "spatial"  # 空间观念
    MATH_DATA = "data"  # 数据分析
    MATH_REASONING = "reasoning"  # 推理能力
    MATH_MODELING = "modeling"  # 模型思想
    MATH_APPLICATION = "application"  # 应用意识
    MATH_COMPREHENSIVE = "comprehensive_math"  # 数学综合

    # 英语能力
    ENGLISH_ALPHABET = "alphabet"  # 字母
    ENGLISH_WORDS = "words"  # 单词
    ENGLISH_SENTENCE_PATTERN = "sentence_pattern"  # 句型
    ENGLISH_LISTENING = "listening"  # 听力理解
    ENGLISH_SPEAKING = "speaking"  # 口语表达
    ENGLISH_READING = "reading"  # 阅读理解
    ENGLISH_WRITING = "writing"  # 书面表达
    ENGLISH_VOCABULARY = "vocabulary"  # 词汇知识
    ENGLISH_GRAMMAR = "grammar"  # 语法知识
    ENGLISH_COMPREHENSIVE = "comprehensive_english"  # 英语综合


# 按科目分组的能力维度列表（用于验证，包含原专项类型）
CHINESE_ABILITY_TYPES = [
    "phonetic",
    "pinyin",
    "literacy",
    "character",
    "vocabulary",
    "sentence",
    "paragraph",
    "reading",
    "writing",
    "speaking",
    "comprehensive_chinese",
]
MATH_ABILITY_TYPES = [
    "number_sense",
    "counting",
    "calculation",
    "shape",
    "position",
    "measurement",
    "statistics",
    "problem_solving",
    "spatial",
    "data",
    "reasoning",
    "modeling",
    "application",
    "comprehensive_math",
]
ENGLISH_ABILITY_TYPES = [
    "alphabet",
    "words",
    "sentence_pattern",
    "listening",
    "speaking",
    "reading",
    "english_reading",
    "writing",
    "vocabulary",
    "grammar",
    "comprehensive_english",
]

# 能力维度映射字典（按科目分组）
ABILITY_TYPE_MAP = {
    "语文": {
        "phonetic": "拼音",
        "pinyin": "拼音",  # 兼容旧值
        "literacy": "识字",  # 兼容旧值
        "character": "识字写字",
        "vocabulary": "词语积累",
        "sentence": "句子运用",
        "paragraph": "段落",
        "reading": "阅读理解",
        "writing": "书面表达",
        "speaking": "口语表达",
        "comprehensive_chinese": "语文综合",
    },
    "数学": {
        "number_sense": "数感",
        "counting": "数数",
        "calculation": "运算能力",
        "shape": "图形",
        "position": "位置",
        "measurement": "测量",
        "statistics": "统计",
        "problem_solving": "解决问题",
        "spatial": "空间观念",
        "data": "数据分析",
        "reasoning": "推理能力",
        "modeling": "模型思想",
        "application": "应用意识",
        "comprehensive_math": "数学综合",
    },
    "英语": {
        "alphabet": "字母",
        "words": "单词",
        "sentence_pattern": "句型",
        "listening": "听力理解",
        "speaking": "口语表达",
        "reading": "阅读理解",
        "english_reading": "英语阅读",  # 兼容旧值
        "writing": "书面表达",
        "vocabulary": "词汇知识",
        "grammar": "语法知识",
        "comprehensive_english": "英语综合",
    },
}


# 按科目获取能力类型列表的辅助函数
def get_ability_types_by_subject(subject: str) -> list[str]:
    """根据科目获取对应的能力类型列表"""
    ability_types_map = {
        "语文": CHINESE_ABILITY_TYPES,
        "数学": MATH_ABILITY_TYPES,
        "英语": ENGLISH_ABILITY_TYPES,
    }
    return ability_types_map.get(subject, [])
