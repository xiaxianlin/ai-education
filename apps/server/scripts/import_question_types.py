"""
题型数据导入脚本

导入通用题型(5个)和能力训练题型(37个)
"""

# 通用题型数据 (unit_practice)
UNIT_PRACTICE_TYPES = [
    {
        "code": "input",
        "name": "输入题",
        "category": "unit_practice",
        "subject": "All",
        "answer_type": "exact",
        "media_context": {"types": ["text", "image", "audio"]},
    },
    {
        "code": "choice",
        "name": "选择题",
        "category": "unit_practice",
        "subject": "All",
        "answer_type": "exact",
        "media_context": {"types": ["text", "image", "audio"]},
        "scaffolding_config": {"modes": ["single", "multiple"]},
    },
    {
        "code": "judge",
        "name": "判断题",
        "category": "unit_practice",
        "subject": "All",
        "answer_type": "exact",
        "media_context": {"types": ["text", "image"]},
    },
    {
        "code": "matching",
        "name": "匹配题",
        "category": "unit_practice",
        "subject": "All",
        "answer_type": "exact",
        "media_context": {"types": ["text", "image"]},
    },
    {
        "code": "sorting",
        "name": "排序题",
        "category": "unit_practice",
        "subject": "All",
        "answer_type": "exact",
        "media_context": {"types": ["text", "image"]},
    },
]

# 能力训练题型 - 语文 (14个)
CHINESE_ABILITY_TYPES = [
    {
        "code": "pinyin_sound_discrim",
        "name": "听音辨位",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "audio_grid"},
        "scaffolding_config": {"hints": [{"trigger": "wrong_attempt_1"}]},
    },
    {
        "code": "stroke_order_trace",
        "name": "描红达人",
        "grade_band": "Low",
        "answer_type": "ai",
        "evaluation_modes": ["ai_analysis"],
        "media_context": {"type": "canvas"},
        "scaffolding_config": {"step_by_step": True},
    },
    {
        "code": "pictograph_match",
        "name": "看图猜字",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "evolution_animation"},
    },
    {
        "code": "radical_basket_sort",
        "name": "部首归类",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "containers"},
    },
    {
        "code": "social_tone_select",
        "name": "话术实验室",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "scenario_card"},
    },
    {
        "code": "narrative_prediction",
        "name": "故事大猜想",
        "grade_band": "Mid",
        "answer_type": "rubric",
        "evaluation_modes": ["rubric_self"],
        "media_context": {"type": "paginated_text"},
        "scaffolding_config": {"templates": ["我认为...因为..."]},
        "rubric_criteria": [
            {"dimension": "依据", "max_score": 3},
            {"dimension": "推理", "max_score": 2},
        ],
    },
    {
        "code": "sensory_detail_highlight",
        "name": "五感侦探",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "text_passage", "tools": ["eye_highlighter", "ear_highlighter"]},
    },
    {
        "code": "plot_sequence_drag",
        "name": "情节梯子",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "timeline_vertical"},
    },
    {
        "code": "speed_reading_drill",
        "name": "计时挑战",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "long_text_stream"},
        "scaffolding_config": {"constraints": ["disable_backtracking"]},
    },
    {
        "code": "dynamic_static_contrast",
        "name": "动静找茬",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "text_passage", "categories": ["Static", "Dynamic"]},
    },
    {
        "code": "transit_map_logic",
        "name": "生活闯关",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "complex_image"},
    },
    {
        "code": "opinion_evidence_map",
        "name": "观点站队",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "split_zone"},
    },
    {
        "code": "psychological_depth_chart",
        "name": "情感温度计",
        "grade_band": "High",
        "answer_type": "ai",
        "evaluation_modes": ["ai_analysis"],
        "media_context": {"type": "text_with_timeline"},
    },
    {
        "code": "art_synesthesia_match",
        "name": "艺文通感",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "audio_image_text_mix"},
    },
]

# 能力训练题型 - 英语 (11个)
ENGLISH_ABILITY_TYPES = [
    {
        "code": "eng_tpr_digital_match",
        "name": "听音触屏",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "character_animation"},
    },
    {
        "code": "eng_phonics_block_build",
        "name": "拼词积木",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "audio_visual_blocks"},
    },
    {
        "code": "eng_vocab_image_select",
        "name": "单词对对碰",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "audio_image_grid"},
    },
    {
        "code": "eng_sentence_unscramble",
        "name": "句子排序",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "text_blocks"},
    },
    {
        "code": "eng_social_response_match",
        "name": "对话接龙",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "dialogue_scene"},
    },
    {
        "code": "eng_functional_reading_scan",
        "name": "海报侦探",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "rich_image_text"},
    },
    {
        "code": "eng_tense_timeline_sort",
        "name": "时光穿梭机",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "timeline_graphic"},
    },
    {
        "code": "eng_mindmap_completion",
        "name": "脑图补全",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "diagram_tree"},
    },
    {
        "code": "eng_story_sequence_arrange",
        "name": "故事导演",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "comic_strip"},
    },
    {
        "code": "eng_cultural_contrast_select",
        "name": "文化连连看",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "image_columns"},
    },
    {
        "code": "eng_audio_spelling_input",
        "name": "听音拼写",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "audio_only"},
    },
]

# 能力训练题型 - 数学 (12个)
MATH_ABILITY_TYPES = [
    {
        "code": "math_num_bubble_count",
        "name": "点泡泡",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "dynamic_canvas"},
    },
    {
        "code": "math_make_ten_drag",
        "name": "凑十魔法",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "ten_frame_grid"},
    },
    {
        "code": "math_shape_sorter_belt",
        "name": "图形传送门",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "animation_stream"},
    },
    {
        "code": "math_angle_alligator",
        "name": "张口大比拼",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "character_morph"},
    },
    {
        "code": "math_multiplication_array",
        "name": "连加变身",
        "grade_band": "Low",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "dot_matrix"},
    },
    {
        "code": "math_fraction_pizza_slice",
        "name": "披萨切切乐",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "interactive_shape"},
    },
    {
        "code": "math_compass_navigation",
        "name": "小小导航员",
        "grade_band": "Mid",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "map_grid"},
    },
    {
        "code": "math_area_transform_cut",
        "name": "图形变身",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "geometry_canvas"},
    },
    {
        "code": "math_equation_balance",
        "name": "天平平衡",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "physics_sim"},
    },
    {
        "code": "math_circle_roll_pi",
        "name": "滚轮胎",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "physics_sim"},
    },
    {
        "code": "math_volume_pour",
        "name": "倒水实验",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "3d_containers"},
    },
    {
        "code": "math_logic_detective",
        "name": "侦探解谜",
        "grade_band": "High",
        "answer_type": "exact",
        "evaluation_modes": ["auto_match"],
        "media_context": {"type": "balance_scale_discrete"},
    },
]


def get_all_question_types():
    """获取所有题型数据"""
    all_types = []

    # 通用题型
    all_types.extend(UNIT_PRACTICE_TYPES)

    # 能力题型 - 语文
    for qt in CHINESE_ABILITY_TYPES:
        qt["category"] = "ability_practice"
        qt["subject"] = "Chinese"
        all_types.append(qt)

    # 能力题型 - 英语
    for qt in ENGLISH_ABILITY_TYPES:
        qt["category"] = "ability_practice"
        qt["subject"] = "English"
        all_types.append(qt)

    # 能力题型 - 数学
    for qt in MATH_ABILITY_TYPES:
        qt["category"] = "ability_practice"
        qt["subject"] = "Math"
        all_types.append(qt)

    return all_types


if __name__ == "__main__":
    types = get_all_question_types()
    print(f"Total question types: {len(types)}")
    print(f"  - Unit practice: {len(UNIT_PRACTICE_TYPES)}")
    print(f"  - Chinese ability: {len(CHINESE_ABILITY_TYPES)}")
    print(f"  - English ability: {len(ENGLISH_ABILITY_TYPES)}")
    print(f"  - Math ability: {len(MATH_ABILITY_TYPES)}")
