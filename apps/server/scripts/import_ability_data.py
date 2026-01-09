"""
能力数据导入脚本（完整版）

根据 docs/小学_1_6_年级原子能力清单.md 文档导入能力域和原子能力数据
包含所有遗漏数据的完整版本
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

import dotenv
from shared.core.database import AbilityAtomic, AbilityDomain, AsyncSessionLocal
from shared.utils.time import now

dotenv.load_dotenv()

# 能力域数据
ABILITY_DOMAINS = [
    # 语文
    {"subject": "语文", "code": "literacy", "name": "识字与写字", "description": "汉字认读与书写能力", "sort_order": 0},
    {"subject": "语文", "code": "reading", "name": "阅读理解", "description": "理解文本内容的能力", "sort_order": 1},
    {"subject": "语文", "code": "expression", "name": "语言表达", "description": "口头与书面表达能力", "sort_order": 2},
    # 数学
    {"subject": "数学", "code": "number", "name": "数与运算", "description": "数的理解与计算能力", "sort_order": 0},
    {"subject": "数学", "code": "geometry", "name": "图形与空间", "description": "空间与图形认知能力", "sort_order": 1},
    {"subject": "数学", "code": "problem", "name": "问题解决", "description": "应用与建模能力", "sort_order": 2},
    {"subject": "数学", "code": "measurement", "name": "测量", "description": "测量与单位换算能力", "sort_order": 3},
    # 英语
    {"subject": "英语", "code": "phonics", "name": "语音意识", "description": "字母与发音能力", "sort_order": 0},
    {"subject": "英语", "code": "vocabulary", "name": "词汇运用", "description": "词汇理解与使用能力", "sort_order": 1},
    {"subject": "英语", "code": "reading", "name": "阅读理解", "description": "英语阅读能力", "sort_order": 2},
    {"subject": "英语", "code": "grammar", "name": "语法意识", "description": "语法理解与运用能力", "sort_order": 3},
    {"subject": "英语", "code": "expression", "name": "语言表达", "description": "英语口头与书面表达能力", "sort_order": 4},
    {"subject": "英语", "code": "listening", "name": "听力理解", "description": "英语听力理解能力", "sort_order": 5},
]

# 原子能力数据（完整版 - 65条）
ATOMIC_ABILITIES = [
    # ========== 语文 ==========
    # 一年级（8条）
    {"subject": "语文", "grade": 1, "domain_code": "literacy", "code": "cn_g1_pinyin_read", "name": "拼音拼读", "description": "能正确拼读声母、韵母和整体认读音节", "difficulty": 1, "sort_order": 0},
    {"subject": "语文", "grade": 1, "domain_code": "literacy", "code": "cn_g1_char_write", "name": "拼音书写", "description": "能根据拼音正确书写常用汉字", "difficulty": 1, "sort_order": 1},
    {"subject": "语文", "grade": 1, "domain_code": "literacy", "code": "cn_g1_char_read", "name": "常用字认读", "description": "能认读一年级常用汉字", "difficulty": 1, "sort_order": 2},
    {"subject": "语文", "grade": 1, "domain_code": "literacy", "code": "cn_g1_char_distinguish", "name": "形近字区分", "description": "能区分常见形近字", "difficulty": 1, "sort_order": 3},
    {"subject": "语文", "grade": 1, "domain_code": "reading", "code": "cn_g1_sentence_understand", "name": "理解单句", "description": "能理解一句话的基本意思", "difficulty": 1, "sort_order": 4},
    {"subject": "语文", "grade": 1, "domain_code": "reading", "code": "cn_g1_picture_choice", "name": "图文选择", "description": "能根据图文内容选择正确答案", "difficulty": 1, "sort_order": 5},
    {"subject": "语文", "grade": 1, "domain_code": "expression", "code": "cn_g1_simple_sentence", "name": "简单表达", "description": "能用完整句表达简单意思", "difficulty": 1, "sort_order": 6},
    {"subject": "语文", "grade": 1, "domain_code": "expression", "code": "cn_g1_sequence_describe", "name": "顺序描述", "description": "能按顺序描述简单事件", "difficulty": 1, "sort_order": 7},
    # 二年级（6条）
    {"subject": "语文", "grade": 2, "domain_code": "literacy", "code": "cn_g2_word_meaning", "name": "词语理解", "description": "能理解常见词语的基本含义", "difficulty": 1, "sort_order": 0},
    {"subject": "语文", "grade": 2, "domain_code": "literacy", "code": "cn_g2_word_choose", "name": "词语选用", "description": "能在语境中正确选用词语", "difficulty": 1, "sort_order": 1},
    {"subject": "语文", "grade": 2, "domain_code": "expression", "code": "cn_g2_sentence_smooth", "name": "句子通顺", "description": "能判断句子是否通顺", "difficulty": 1, "sort_order": 2},
    {"subject": "语文", "grade": 2, "domain_code": "expression", "code": "cn_g2_sentence_complete", "name": "句子补全", "description": "能补充句子中的缺失成分", "difficulty": 1, "sort_order": 3},
    {"subject": "语文", "grade": 2, "domain_code": "reading", "code": "cn_g2_info_find", "name": "信息提取", "description": "能找出句子中的关键信息", "difficulty": 1, "sort_order": 4},
    {"subject": "语文", "grade": 2, "domain_code": "reading", "code": "cn_g2_direct_answer", "name": "直接回答", "description": "能回答短文中的直接问题", "difficulty": 1, "sort_order": 5},
    # 三年级（6条）
    {"subject": "语文", "grade": 3, "domain_code": "literacy", "code": "cn_g3_word_context", "name": "语境理解", "description": "能理解词语在具体语境中的含义", "difficulty": 2, "sort_order": 0},
    {"subject": "语文", "grade": 3, "domain_code": "expression", "code": "cn_g3_sentence_transform", "name": "句式转换", "description": "能进行简单句式转换", "difficulty": 2, "sort_order": 1},
    {"subject": "语文", "grade": 3, "domain_code": "reading", "code": "cn_g3_paragraph_main", "name": "段落中心", "description": "能找出段落中心句", "difficulty": 2, "sort_order": 2},
    {"subject": "语文", "grade": 3, "domain_code": "reading", "code": "cn_g3_sentence_role", "name": "句子作用", "description": "能判断句子在段落中的作用", "difficulty": 2, "sort_order": 3},
    {"subject": "语文", "grade": 3, "domain_code": "reading", "code": "cn_g3_paragraph_summary", "name": "段落概括", "description": "能概括段落大意", "difficulty": 2, "sort_order": 4},
    {"subject": "语文", "grade": 3, "domain_code": "reading", "code": "cn_g3_infer", "name": "简单推断", "description": "能根据文本进行简单推断", "difficulty": 2, "sort_order": 5},
    # 四年级（4条）
    {"subject": "语文", "grade": 4, "domain_code": "reading", "code": "cn_g4_fact_opinion", "name": "区分事实观点", "description": "能区分事实描述与观点表达", "difficulty": 3, "sort_order": 0},
    {"subject": "语文", "grade": 4, "domain_code": "reading", "code": "cn_g4_character_behavior", "name": "行为理解", "description": "能理解人物行为原因", "difficulty": 3, "sort_order": 1},
    {"subject": "语文", "grade": 4, "domain_code": "expression", "code": "cn_g4_paragraph_write", "name": "段落写作", "description": "能围绕主题写一段条理清楚的文字", "difficulty": 3, "sort_order": 2},
    {"subject": "语文", "grade": 4, "domain_code": "expression", "code": "cn_g4_connector_use", "name": "连接词运用", "description": "能使用连接词组织句子", "difficulty": 3, "sort_order": 3},
    # 五年级（4条）
    {"subject": "语文", "grade": 5, "domain_code": "reading", "code": "cn_g5_main_idea", "name": "概括主旨", "description": "能概括文章主要内容", "difficulty": 3, "sort_order": 0},
    {"subject": "语文", "grade": 5, "domain_code": "reading", "code": "cn_g5_character_analysis", "name": "人物分析", "description": "能分析人物形象的基本特点", "difficulty": 3, "sort_order": 1},
    {"subject": "语文", "grade": 5, "domain_code": "expression", "code": "cn_g5_short_essay", "name": "短文写作", "description": "能围绕中心完成一篇短文", "difficulty": 3, "sort_order": 2},
    {"subject": "语文", "grade": 5, "domain_code": "expression", "code": "cn_g5_rewrite_continue", "name": "改写续写", "description": "能根据提示进行改写或续写", "difficulty": 3, "sort_order": 3},
    # 六年级（4条）
    {"subject": "语文", "grade": 6, "domain_code": "reading", "code": "cn_g6_writing_purpose", "name": "写作目的", "description": "能理解文章写作目的", "difficulty": 4, "sort_order": 0},
    {"subject": "语文", "grade": 6, "domain_code": "reading", "code": "cn_g6_structure", "name": "分析结构", "description": "能分析文章结构特点", "difficulty": 4, "sort_order": 1},
    {"subject": "语文", "grade": 6, "domain_code": "expression", "code": "cn_g6_opinion", "name": "观点表达", "description": "能清晰表达个人观点并给出理由", "difficulty": 4, "sort_order": 2},
    {"subject": "语文", "grade": 6, "domain_code": "expression", "code": "cn_g6_evaluate_summary", "name": "评价总结", "description": "能对文本内容进行评价或总结", "difficulty": 4, "sort_order": 3},
    
    # ========== 数学 ==========
    # 一年级（5条）
    {"subject": "数学", "grade": 1, "domain_code": "number", "code": "math_g1_count", "name": "数数", "description": "能正确数出100以内物体数量", "difficulty": 1, "sort_order": 0},
    {"subject": "数学", "grade": 1, "domain_code": "number", "code": "math_g1_compare", "name": "数的大小比较", "description": "能比较100以内数的大小", "difficulty": 1, "sort_order": 1},
    {"subject": "数学", "grade": 1, "domain_code": "number", "code": "math_g1_add20", "name": "20以内加减", "description": "能进行20以内加减法运算", "difficulty": 1, "sort_order": 2},
    {"subject": "数学", "grade": 1, "domain_code": "geometry", "code": "math_g1_shape_recognize", "name": "图形识别", "description": "能识别常见平面图形", "difficulty": 1, "sort_order": 3},
    {"subject": "数学", "grade": 1, "domain_code": "geometry", "code": "math_g1_position_describe", "name": "位置描述", "description": "能描述物体的前后左右位置", "difficulty": 1, "sort_order": 4},
    # 二年级（3条）
    {"subject": "数学", "grade": 2, "domain_code": "number", "code": "math_g2_add100", "name": "100以内加减", "description": "能进行100以内加减法运算", "difficulty": 2, "sort_order": 0},
    {"subject": "数学", "grade": 2, "domain_code": "number", "code": "math_g2_multiplication_meaning", "name": "乘法意义", "description": "能理解乘法的实际意义", "difficulty": 2, "sort_order": 1},
    {"subject": "数学", "grade": 2, "domain_code": "problem", "code": "math_g2_word_problem", "name": "文字题", "description": "能将简单文字问题转化为算式", "difficulty": 2, "sort_order": 2},
    # 三年级（3条）
    {"subject": "数学", "grade": 3, "domain_code": "number", "code": "math_g3_hundred_add_sub", "name": "整百整十加减", "description": "能进行整百整十加减法", "difficulty": 2, "sort_order": 0},
    {"subject": "数学", "grade": 3, "domain_code": "number", "code": "math_g3_mul_div", "name": "乘除法", "description": "能进行简单乘除法计算", "difficulty": 2, "sort_order": 1},
    {"subject": "数学", "grade": 3, "domain_code": "geometry", "code": "math_g3_shape_classify", "name": "图形分类", "description": "能识别并分类常见几何图形", "difficulty": 2, "sort_order": 2},
    # 四年级（3条）
    {"subject": "数学", "grade": 4, "domain_code": "number", "code": "math_g4_multi_calc", "name": "多位数运算", "description": "能进行多位数加减乘法", "difficulty": 3, "sort_order": 0},
    {"subject": "数学", "grade": 4, "domain_code": "number", "code": "math_g4_operation_order", "name": "运算顺序", "description": "能理解并运用四则运算顺序", "difficulty": 3, "sort_order": 1},
    {"subject": "数学", "grade": 4, "domain_code": "measurement", "code": "math_g4_unit_convert", "name": "单位换算", "description": "能进行长度、质量、时间单位换算", "difficulty": 3, "sort_order": 2},
    # 五年级（3条）
    {"subject": "数学", "grade": 5, "domain_code": "number", "code": "math_g5_fraction_meaning", "name": "分数意义", "description": "能理解分数的意义", "difficulty": 3, "sort_order": 0},
    {"subject": "数学", "grade": 5, "domain_code": "number", "code": "math_g5_fraction", "name": "分数运算", "description": "能进行分数的简单运算", "difficulty": 3, "sort_order": 1},
    {"subject": "数学", "grade": 5, "domain_code": "problem", "code": "math_g5_multi_step", "name": "多步骤应用", "description": "能解决多步骤应用题", "difficulty": 3, "sort_order": 2},
    # 六年级（3条）
    {"subject": "数学", "grade": 6, "domain_code": "number", "code": "math_g6_fraction_decimal", "name": "分数小数混合", "description": "能进行分数与小数的混合运算", "difficulty": 4, "sort_order": 0},
    {"subject": "数学", "grade": 6, "domain_code": "number", "code": "math_g6_ratio", "name": "比和比例", "description": "能理解比和比例的含义", "difficulty": 4, "sort_order": 1},
    {"subject": "数学", "grade": 6, "domain_code": "problem", "code": "math_g6_strategy_choose", "name": "解题策略", "description": "能分析问题并选择合适解题策略", "difficulty": 4, "sort_order": 2},
    
    # ========== 英语 ==========
    # 一年级（3条）
    {"subject": "英语", "grade": 1, "domain_code": "phonics", "code": "en_g1_letter", "name": "字母认知", "description": "能识别英文字母的形和音", "difficulty": 1, "sort_order": 0},
    {"subject": "英语", "grade": 1, "domain_code": "phonics", "code": "en_g1_letter_choose", "name": "字母选择", "description": "能根据读音选择正确字母", "difficulty": 1, "sort_order": 1},
    {"subject": "英语", "grade": 1, "domain_code": "vocabulary", "code": "en_g1_classroom_words", "name": "课堂指令", "description": "能理解并使用常见课堂指令词汇", "difficulty": 1, "sort_order": 2},
    # 二年级（3条）
    {"subject": "英语", "grade": 2, "domain_code": "vocabulary", "code": "en_g2_word_read", "name": "单词认读", "description": "能认读并理解常见单词", "difficulty": 1, "sort_order": 0},
    {"subject": "英语", "grade": 2, "domain_code": "vocabulary", "code": "en_g2_word_picture_match", "name": "单词图片匹配", "description": "能将单词与图片正确匹配", "difficulty": 1, "sort_order": 1},
    {"subject": "英语", "grade": 2, "domain_code": "listening", "code": "en_g2_listen_instruction", "name": "听力理解", "description": "能听懂简单指令和句子", "difficulty": 1, "sort_order": 2},
    # 三年级（3条）
    {"subject": "英语", "grade": 3, "domain_code": "grammar", "code": "en_g3_sentence_pattern", "name": "句型理解", "description": "能理解并使用基础句型", "difficulty": 2, "sort_order": 0},
    {"subject": "英语", "grade": 3, "domain_code": "expression", "code": "en_g3_dialogue_complete", "name": "对话完成", "description": "能根据提示完成简单对话", "difficulty": 2, "sort_order": 1},
    {"subject": "英语", "grade": 3, "domain_code": "reading", "code": "en_g3_short_read", "name": "短文理解", "description": "能理解简短英语故事大意", "difficulty": 2, "sort_order": 2},
    # 四年级（3条）
    {"subject": "英语", "grade": 4, "domain_code": "grammar", "code": "en_g4_present", "name": "一般现在时", "description": "能理解一般现在时的基本用法", "difficulty": 2, "sort_order": 0},
    {"subject": "英语", "grade": 4, "domain_code": "grammar", "code": "en_g4_pronoun", "name": "人称代词", "description": "能正确使用人称代词", "difficulty": 2, "sort_order": 1},
    {"subject": "英语", "grade": 4, "domain_code": "listening", "code": "en_g4_listen_repeat", "name": "听说能力", "description": "能听懂并复述简短对话", "difficulty": 2, "sort_order": 2},
    # 五年级（3条）
    {"subject": "英语", "grade": 5, "domain_code": "reading", "code": "en_g5_info_find", "name": "信息提取", "description": "能理解短文关键信息", "difficulty": 3, "sort_order": 0},
    {"subject": "英语", "grade": 5, "domain_code": "reading", "code": "en_g5_infer_answer", "name": "推断回答", "description": "能回答推断性问题", "difficulty": 3, "sort_order": 1},
    {"subject": "英语", "grade": 5, "domain_code": "expression", "code": "en_g5_describe_event", "name": "事件描述", "description": "能用简单英语描述事件或感受", "difficulty": 3, "sort_order": 2},
    # 六年级（2条）
    {"subject": "英语", "grade": 6, "domain_code": "expression", "code": "en_g6_comprehensive", "name": "综合表达", "description": "能综合运用词汇与句型进行表达", "difficulty": 3, "sort_order": 0},
    {"subject": "英语", "grade": 6, "domain_code": "expression", "code": "en_g6_write", "name": "书面表达", "description": "能完成简短英语书面表达任务", "difficulty": 3, "sort_order": 1},
]


async def import_ability_domains(db):
    """导入能力域数据"""
    from sqlalchemy import select
    
    print("开始导入能力域数据...")
    imported_count = 0
    skipped_count = 0
    
    for domain_data in ABILITY_DOMAINS:
        # 检查是否已存在
        stmt = select(AbilityDomain).where(
            AbilityDomain.subject == domain_data["subject"],
            AbilityDomain.code == domain_data["code"]
        )
        existing = await db.scalar(stmt)
        
        if existing:
            print(f"  跳过已存在的能力域: {domain_data['subject']} - {domain_data['name']}")
            skipped_count += 1
            continue
        
        domain = AbilityDomain(
            subject=domain_data["subject"],
            code=domain_data["code"],
            name=domain_data["name"],
            description=domain_data["description"],
            sort_order=domain_data["sort_order"],
            is_active=1,
            create_time=now(),
            update_time=now(),
        )
        db.add(domain)
        imported_count += 1
        print(f"  ✓ 导入能力域: {domain_data['subject']} - {domain_data['name']}")
    
    await db.commit()
    print(f"能力域导入完成: 新增 {imported_count} 条, 跳过 {skipped_count} 条\n")
    return imported_count


async def import_atomic_abilities(db):
    """导入原子能力数据"""
    from sqlalchemy import select
    
    print("开始导入原子能力数据...")
    imported_count = 0
    skipped_count = 0
    
    for ability_data in ATOMIC_ABILITIES:
        # 检查是否已存在
        stmt = select(AbilityAtomic).where(
            AbilityAtomic.subject == ability_data["subject"],
            AbilityAtomic.grade == ability_data["grade"],
            AbilityAtomic.code == ability_data["code"]
        )
        existing = await db.scalar(stmt)
        
        if existing:
            print(f"  跳过已存在的原子能力: {ability_data['subject']} {ability_data['grade']}年级 - {ability_data['name']}")
            skipped_count += 1
            continue
        
        # 验证能力域是否存在
        domain_stmt = select(AbilityDomain).where(
            AbilityDomain.subject == ability_data["subject"],
            AbilityDomain.code == ability_data["domain_code"]
        )
        domain = await db.scalar(domain_stmt)
        if not domain:
            print(f"  ✗ 警告: 能力域不存在 {ability_data['subject']} - {ability_data['domain_code']}, 跳过原子能力: {ability_data['name']}")
            skipped_count += 1
            continue
        
        atomic = AbilityAtomic(
            subject=ability_data["subject"],
            grade=ability_data["grade"],
            domain_code=ability_data["domain_code"],
            code=ability_data["code"],
            name=ability_data["name"],
            description=ability_data["description"],
            difficulty=ability_data["difficulty"],
            sort_order=ability_data["sort_order"],
            is_active=1,
            create_time=now(),
            update_time=now(),
        )
        db.add(atomic)
        imported_count += 1
        print(f"  ✓ 导入原子能力: {ability_data['subject']} {ability_data['grade']}年级 - {ability_data['name']}")
    
    await db.commit()
    print(f"原子能力导入完成: 新增 {imported_count} 条, 跳过 {skipped_count} 条\n")
    return imported_count


async def main():
    """主函数"""
    print("=" * 60)
    print("能力数据导入脚本（完整版）")
    print("=" * 60)
    print()
    
    async with AsyncSessionLocal() as db:
        try:
            # 导入能力域
            domain_count = await import_ability_domains(db)
            
            # 导入原子能力
            atomic_count = await import_atomic_abilities(db)
            
            print("=" * 60)
            print("导入完成!")
            print(f"  能力域: {domain_count} 条新增")
            print(f"  原子能力: {atomic_count} 条新增")
            print("=" * 60)
            
        except Exception as e:
            await db.rollback()
            print(f"\n错误: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
