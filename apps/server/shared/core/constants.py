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

# ============ V2 题型系统常量 ============

# 学段
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

# 交互类型
INTERACTION_TYPES = [
    "single_choice",   # 单选
    "multi_choice",    # 多选
    "image_choice",    # 图片选择
    "text_input",      # 文本输入
    "handwriting",     # 手写输入
    "voice_input",     # 语音输入
    "drag_drop",       # 拖拽放置
    "connect_line",    # 连线匹配
    "sort_order",      # 排序排列
    "true_false",      # 是非判断
    "correct_wrong",   # 对错判断
    "follow_read",     # 跟读
    "free_speak",      # 自由表达
    "fill_blank",      # 填空
    "multi_step",      # 多步骤
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

# 认知层次（布鲁姆分类法）
COGNITIVE_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"]

COGNITIVE_LEVEL_LABELS = {
    "remember": "识记",
    "understand": "理解",
    "apply": "应用",
    "analyze": "分析",
    "evaluate": "评价",
    "create": "创造",
}

# 资源类型 V2
RESOURCE_TYPES_V2 = ["none", "image", "audio", "video", "animation"]

# 答案类型
ANSWER_TYPES = ["exact", "fuzzy", "rubric", "ai", "composite"]

ANSWER_TYPE_LABELS = {
    "exact": "精确匹配",
    "fuzzy": "模糊匹配",
    "rubric": "评分标准",
    "ai": "AI评分",
    "composite": "复合题",
}

# 难度 V2（英文值）
DIFFICULTY_LEVELS_V2 = ["easy", "medium", "hard"]

DIFFICULTY_LEVEL_LABELS_V2 = {
    "easy": "简单",
    "medium": "中等",
    "hard": "困难",
}
