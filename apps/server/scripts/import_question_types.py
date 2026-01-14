"""
题型数据导入脚本

导入通用题型(5个)和能力训练题型(37个)

evaluation_config 结构:
{
    "mode": "auto_match" | "ai_analysis",
    "correct_answer": any,       # 正确答案
    "rubrics": [                 # 评分量表（主观题）
        {"dimension": "逻辑", "max_score": 3}
    ]
}

使用方法:
    cd apps/server
    python -m scripts.import_question_types
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

# 通用题型数据 (unit_practice)
UNIT_PRACTICE_TYPES = [
    {
        "code": "input",
        "name": "输入题",
        "category": "unit_practice",
        "subject": "全科",
        "media_context": {"types": ["text", "image", "audio"]},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "choice",
        "name": "选择题",
        "category": "unit_practice",
        "subject": "全科",
        "media_context": {"types": ["text", "image", "audio"]},
        "scaffolding_config": {"mode": "single"},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "judge",
        "name": "判断题",
        "category": "unit_practice",
        "subject": "全科",
        "media_context": {"types": ["text", "image"]},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "matching",
        "name": "匹配题",
        "category": "unit_practice",
        "subject": "全科",
        "media_context": {"types": ["text", "image"]},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "sorting",
        "name": "排序题",
        "category": "unit_practice",
        "subject": "全科",
        "media_context": {"types": ["text", "image"]},
        "evaluation_config": {"mode": "auto_match"},
    },
]

# 能力训练题型 - 语文 (14个)
CHINESE_ABILITY_TYPES = [
    {
        "code": "pinyin_sound_discrim",
        "name": "听音辨位",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "Low",
        "media_context": {"types": ["audio"], "configs": {"layout": "grid"}},
        "scaffolding_config": {"hints": [{"trigger": "wrong_attempt_1"}]},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "stroke_order_trace",
        "name": "描红达人",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "Low",
        "media_context": {"types": ["image"], "configs": {"component": "canvas"}},
        "scaffolding_config": {"config": {"step_by_step": True}},
        "evaluation_config": {"mode": "ai_analysis"},
    },
    {
        "code": "pictograph_match",
        "name": "看图猜字",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "Low",
        "media_context": {"types": ["image", "animation"], "configs": {"type": "evolution"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "radical_basket_sort",
        "name": "部首归类",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "Low",
        "media_context": {"types": ["text"], "configs": {"layout": "containers"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "social_tone_select",
        "name": "话术实验室",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "Low",
        "media_context": {"types": ["text", "image"], "configs": {"type": "scenario_card"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "narrative_prediction",
        "name": "故事大猜想",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "Mid",
        "media_context": {"types": ["text"], "configs": {"paginated": True}},
        "scaffolding_config": {"templates": ["我认为...因为..."]},
        "evaluation_config": {
            "mode": "auto_match",
            "rubrics": [
                {"dimension": "依据", "max_score": 3},
                {"dimension": "推理", "max_score": 2},
            ],
        },
    },
    {
        "code": "sensory_detail_highlight",
        "name": "五感侦探",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "Mid",
        "media_context": {
            "types": ["text"],
            "configs": {"tools": ["eye_highlighter", "ear_highlighter"]},
        },
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "plot_sequence_drag",
        "name": "情节梯子",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "Mid",
        "media_context": {"types": ["text"], "configs": {"layout": "timeline_vertical"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "speed_reading_drill",
        "name": "计时挑战",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "High",
        "media_context": {"types": ["text"], "configs": {"stream": True}},
        "scaffolding_config": {"config": {"disable_backtracking": True}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "dynamic_static_contrast",
        "name": "动静找茬",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "High",
        "media_context": {"types": ["text"], "configs": {"categories": ["Static", "Dynamic"]}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "transit_map_logic",
        "name": "生活闯关",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "High",
        "media_context": {"types": ["image"], "configs": {"type": "complex"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "opinion_evidence_map",
        "name": "观点站队",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "High",
        "media_context": {"types": ["text"], "configs": {"layout": "split_zone"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "psychological_depth_chart",
        "name": "情感温度计",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "High",
        "media_context": {"types": ["text"], "configs": {"with_timeline": True}},
        "evaluation_config": {"mode": "ai_analysis"},
    },
    {
        "code": "art_synesthesia_match",
        "name": "艺文通感",
        "category": "ability_practice",
        "subject": "语文",
        "grade_band": "High",
        "media_context": {"types": ["audio", "image", "text"]},
        "evaluation_config": {"mode": "auto_match"},
    },
]

# 能力训练题型 - 英语 (11个)
ENGLISH_ABILITY_TYPES = [
    {
        "code": "eng_tpr_digital_match",
        "name": "听音触屏",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "Low",
        "media_context": {"types": ["audio", "animation"], "configs": {"character": True}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_phonics_block_build",
        "name": "拼词积木",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "Mid",
        "media_context": {"types": ["audio", "image"], "configs": {"type": "blocks"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_vocab_image_select",
        "name": "单词对对碰",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "Low",
        "media_context": {"types": ["audio", "image"], "configs": {"layout": "grid"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_sentence_unscramble",
        "name": "句子排序",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "Mid",
        "media_context": {"types": ["text"], "configs": {"type": "blocks"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_social_response_match",
        "name": "对话接龙",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "Mid",
        "media_context": {"types": ["text", "audio"], "configs": {"type": "dialogue"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_functional_reading_scan",
        "name": "海报侦探",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "High",
        "media_context": {"types": ["image", "text"], "configs": {"rich": True}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_tense_timeline_sort",
        "name": "时光穿梭机",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "High",
        "media_context": {"types": ["text", "image"], "configs": {"layout": "timeline"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_mindmap_completion",
        "name": "脑图补全",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "High",
        "media_context": {"types": ["text", "image"], "configs": {"type": "diagram_tree"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_story_sequence_arrange",
        "name": "故事导演",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "Mid",
        "media_context": {"types": ["image"], "configs": {"type": "comic_strip"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_cultural_contrast_select",
        "name": "文化连连看",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "High",
        "media_context": {"types": ["image"], "configs": {"layout": "columns"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "eng_audio_spelling_input",
        "name": "听音拼写",
        "category": "ability_practice",
        "subject": "英语",
        "grade_band": "Mid",
        "media_context": {"types": ["audio"]},
        "evaluation_config": {"mode": "auto_match"},
    },
]

# 能力训练题型 - 数学 (12个)
MATH_ABILITY_TYPES = [
    {
        "code": "math_num_bubble_count",
        "name": "点泡泡",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "Low",
        "media_context": {"types": ["image", "animation"], "configs": {"dynamic": True}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_make_ten_drag",
        "name": "凑十魔法",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "Low",
        "media_context": {"types": ["image"], "configs": {"layout": "ten_frame"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_shape_sorter_belt",
        "name": "图形传送门",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "Low",
        "media_context": {"types": ["animation"], "configs": {"type": "stream"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_angle_alligator",
        "name": "张口大比拼",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "Low",
        "media_context": {"types": ["animation"], "configs": {"type": "morph"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_multiplication_array",
        "name": "连加变身",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "Low",
        "media_context": {"types": ["image"], "configs": {"type": "dot_matrix"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_fraction_pizza_slice",
        "name": "披萨切切乐",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "Mid",
        "media_context": {"types": ["image"], "configs": {"interactive": True}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_compass_navigation",
        "name": "小小导航员",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "Mid",
        "media_context": {"types": ["image"], "configs": {"layout": "map_grid"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_area_transform_cut",
        "name": "图形变身",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "High",
        "media_context": {"types": ["image"], "configs": {"type": "geometry_canvas"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_equation_balance",
        "name": "天平平衡",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "High",
        "media_context": {"types": ["animation"], "configs": {"type": "physics_sim"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_circle_roll_pi",
        "name": "滚轮胎",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "High",
        "media_context": {"types": ["animation"], "configs": {"type": "physics_sim"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_volume_pour",
        "name": "倒水实验",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "High",
        "media_context": {"types": ["animation"], "configs": {"type": "3d_containers"}},
        "evaluation_config": {"mode": "auto_match"},
    },
    {
        "code": "math_logic_detective",
        "name": "侦探解谜",
        "category": "ability_practice",
        "subject": "数学",
        "grade_band": "High",
        "media_context": {"types": ["image"], "configs": {"type": "balance_scale"}},
        "evaluation_config": {"mode": "auto_match"},
    },
]


def get_all_question_types():
    """获取所有题型数据"""
    all_types = []

    # 通用题型
    all_types.extend(UNIT_PRACTICE_TYPES)

    # 能力题型 - 语文
    all_types.extend(CHINESE_ABILITY_TYPES)

    # 能力题型 - 英语
    all_types.extend(ENGLISH_ABILITY_TYPES)

    # 能力题型 - 数学
    all_types.extend(MATH_ABILITY_TYPES)

    return all_types


async def import_question_types():
    """导入题型数据到数据库"""
    from admin.question.schema import QuestionTypeCreateSchema
    from admin.question.services import question_type as qt_service
    from shared.core.database import AsyncSessionLocal

    types = get_all_question_types()
    print(f"准备导入 {len(types)} 个题型...")
    print(f"  - 通用题型: {len(UNIT_PRACTICE_TYPES)}")
    print(f"  - 语文能力题型: {len(CHINESE_ABILITY_TYPES)}")
    print(f"  - 英语能力题型: {len(ENGLISH_ABILITY_TYPES)}")
    print(f"  - 数学能力题型: {len(MATH_ABILITY_TYPES)}")

    async with AsyncSessionLocal() as db:
        # 先删除已有的题型数据
        deleted_count = await qt_service.delete_all_question_types(db)
        if deleted_count > 0:
            print(f"已删除 {deleted_count} 个旧题型")

        # 转换为 Schema 并批量创建
        schemas = [QuestionTypeCreateSchema(**t) for t in types]
        result = await qt_service.batch_create_question_types(db, schemas)
        print(f"成功导入 {len(result)} 个题型")

    return result


if __name__ == "__main__":
    types = get_all_question_types()
    print(f"Total question types: {len(types)}")
    print(f"  - Unit practice: {len(UNIT_PRACTICE_TYPES)}")
    print(f"  - Chinese ability: {len(CHINESE_ABILITY_TYPES)}")
    print(f"  - English ability: {len(ENGLISH_ABILITY_TYPES)}")
    print(f"  - Math ability: {len(MATH_ABILITY_TYPES)}")

    # 执行导入
    print("\n开始导入数据库...")
    asyncio.run(import_question_types())
    print("导入完成!")
