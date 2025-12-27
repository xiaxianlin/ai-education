# 系统练习初始化数据
# 包含场景类型、适用范围、题量配置、难度配置、能力维度和反馈配置

INIT_SYSTEM_PRACTICES = [
    {
        "name": "日常练习",
        "slug": "daily_practice",
        "type": "system",
        "icon": "📆",
        "description": "快来开始今天的练习吧！✨",
        # 场景类型
        "scene_type": "daily_training",
        # 适用范围（所有科目和年级）
        "subject": None,
        "stages": ["primary_low", "primary_high", "junior"],
        "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9],
        # 题量配置
        "question_count_config": {
            "total": 5,
            "per_group": 5,
            "max_groups": 3,
            "time_limit_minutes": 10,
        },
        # 难度配置
        "difficulty_config": {
            "level": "basic",
            "target_accuracy": 0.8,
            "distribution": None,  # 日常训练聚焦单一难度
        },
        # 能力维度配置
        "ability_config": {
            "cognitive_levels": ["remember", "understand"],
            "distribution": None,
        },
        # 反馈配置
        "feedback_config": {
            "instant_feedback": True,
            "show_explanation": True,
            "gamification": {
                "enable_points": True,
                "enable_badges": False,
                "enable_progress": True,
            },
            "encouragement_messages": ["太棒了！", "继续加油！", "你真厉害！"],
        },
        # 运行时参数
        "parameters": [
            {
                "key": "generate_count",
                "type": "system",
                "required": True,
                "description": "生成题目数量，key为年级，value为生成题目数量",
                "value_type": "object",
                "value": {
                    "1": 15,
                    "2": 15,
                    "3": 15,
                    "4": 15,
                    "5": 15,
                    "6": 15,
                    "7": 15,
                    "8": 15,
                    "9": 15,
                },
            },
            {
                "key": "recall_count",
                "type": "system",
                "required": True,
                "description": "召回题目数量，key为年级，value为召回题目数量",
                "value_type": "object",
                "value": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0},
            },
            {
                "key": "textbook_id",
                "type": "input",
                "required": True,
                "description": "教材ID",
                "value_type": "number",
            },
        ],
    },
    {
        "name": "单元练习",
        "slug": "unit_practice",
        "type": "system",
        "icon": "📚",
        "description": "选择单元开始练习，巩固知识点！✨",
        # 场景类型
        "scene_type": "unit_test",
        # 适用范围
        "subject": None,
        "stages": ["primary_low", "primary_high", "junior"],
        "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9],
        # 题量配置
        "question_count_config": {
            "total": 12,
            "per_group": None,
            "max_groups": None,
            "time_limit_minutes": 18,
        },
        # 难度配置
        "difficulty_config": {
            "level": "intermediate",
            "target_accuracy": 0.7,
            "distribution": {"easy": 6, "medium": 4, "hard": 2},
        },
        # 能力维度配置
        "ability_config": {
            "cognitive_levels": ["remember", "understand", "apply"],
            "distribution": None,
        },
        # 反馈配置
        "feedback_config": {
            "instant_feedback": True,
            "show_explanation": True,
            "gamification": {
                "enable_points": True,
                "enable_badges": True,
                "enable_progress": True,
            },
            "encouragement_messages": ["太棒了！", "继续加油！", "你真厉害！"],
        },
        # 运行时参数
        "parameters": [
            {
                "key": "generate_count",
                "type": "system",
                "required": True,
                "description": "生成题目数量，key为年级，value为生成题目数量",
                "value_type": "object",
                "value": {
                    "1": 15,
                    "2": 15,
                    "3": 15,
                    "4": 15,
                    "5": 15,
                    "6": 15,
                    "7": 15,
                    "8": 15,
                    "9": 15,
                },
            },
            {
                "key": "recall_count",
                "type": "system",
                "required": True,
                "description": "召回题目数量，key为年级，value为召回题目数量",
                "value_type": "object",
                "value": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0},
            },
            {
                "key": "unit_id",
                "type": "input",
                "required": True,
                "description": "单元ID",
                "value_type": "number",
            },
            {
                "key": "textbook_id",
                "type": "input",
                "required": True,
                "description": "教材ID",
                "value_type": "number",
            },
        ],
    },
    {
        "name": "综合评估",
        "slug": "assess_practice",
        "type": "system",
        "icon": "🎯",
        "description": "让AI帮你找到学习的方向！✨",
        # 场景类型
        "scene_type": "comprehensive_assessment",
        # 适用范围
        "subject": None,
        "stages": ["primary_low", "primary_high", "junior"],
        "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9],
        # 题量配置
        "question_count_config": {
            "total": 18,
            "per_group": None,
            "max_groups": None,
            "time_limit_minutes": 30,
        },
        # 难度配置
        "difficulty_config": {
            "level": "advanced",
            "target_accuracy": 0.65,
            "distribution": {"easy": 5, "medium": 8, "hard": 5},
        },
        # 能力维度配置
        "ability_config": {
            "cognitive_levels": ["remember", "understand", "apply", "analyze"],
            "distribution": {"remember": 5, "understand": 8, "apply": 5},
        },
        # 反馈配置
        "feedback_config": {
            "instant_feedback": False,  # 综合评估通常最后统一反馈
            "show_explanation": True,
            "gamification": {
                "enable_points": True,
                "enable_badges": True,
                "enable_progress": True,
            },
            "encouragement_messages": ["太棒了！", "继续加油！", "你真厉害！"],
        },
        # 运行时参数
        "parameters": [
            {
                "key": "generate_count",
                "type": "system",
                "required": True,
                "description": "生成题目数量，key为年级，value为生成题目数量",
                "value_type": "object",
                "value": {
                    "1": 15,
                    "2": 15,
                    "3": 15,
                    "4": 15,
                    "5": 15,
                    "6": 15,
                    "7": 15,
                    "8": 15,
                    "9": 15,
                },
            },
            {
                "key": "recall_count",
                "type": "system",
                "required": True,
                "description": "召回题目数量，key为年级，value为召回题目数量",
                "value_type": "object",
                "value": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0},
            },
            {
                "key": "textbook_id",
                "type": "input",
                "required": True,
                "description": "教材ID",
                "value_type": "number",
            },
        ],
    },
]
