# -*- coding: utf-8 -*-
"""
V1 到 V2 数据迁移脚本

功能:
1. 迁移 ah_question_type -> ah_question_type_v2
2. 迁移 ah_question -> ah_question_v2

使用方法:
    cd apps/server
    uv run python ../../scripts/migrate_v1_to_v2.py [--dry-run]
"""

import sys
import asyncio
import argparse
import uuid
from typing import Optional
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "server"))

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from shared.core.database import get_async_session, Question, QuestionType
from shared.core.models_v2 import QuestionTypeV2, QuestionV2
from shared.core.constants import STAGE_GRADES
from shared.utils.time import now


# ============ 字段映射配置 ============

# scene -> interaction_type 映射
SCENE_TO_INTERACTION_TYPE = {
    "选择题": "single_choice",
    "判断题": "true_false",
    "填空题": "fill_blank",
    "拼写题": "fill_blank",
    "口语题": "follow_read",
    "匹配题": "connect_line",
    "简答题": "text_input",
    "应用题": "multi_step",
    "操作题": "drag_drop",
}

# 难度映射
DIFFICULTY_MAP = {
    "简单": "easy",
    "普通": "medium",
    "困难": "hard",
    "easy": "easy",
    "medium": "medium",
    "hard": "hard",
}

# 资源类型映射
RESOURCE_TYPE_MAP = {
    None: "none",
    "": "none",
    "none": "none",
    "image": "image",
    "audio": "audio",
    "video": "video",
}


def grade_to_stage(grade: int) -> str:
    """根据年级计算学段"""
    for stage, grades in STAGE_GRADES.items():
        if grade in grades:
            return stage
    # 默认返回小学低段
    return "primary_low" if grade <= 3 else "primary_high"


def scene_to_answer_type(scene: str) -> str:
    """根据场景类型推断答案类型"""
    if scene in ["选择题", "判断题", "匹配题"]:
        return "exact"
    elif scene in ["填空题", "拼写题"]:
        return "fuzzy"
    elif scene in ["口语题"]:
        return "ai"
    elif scene in ["应用题"]:
        return "composite"
    else:
        return "rubric"


def generate_type_code(subject: str, scene: str, grade: int) -> str:
    """生成题型编码"""
    subject_map = {"语文": "CN", "数学": "MA", "英语": "EN"}
    scene_map = {
        "选择题": "SC",
        "判断题": "TF",
        "填空题": "FB",
        "拼写题": "SP",
        "口语题": "OR",
        "匹配题": "MT",
        "简答题": "SA",
        "应用题": "AP",
        "操作题": "OP",
    }
    subj = subject_map.get(subject, "XX")
    scn = scene_map.get(scene, "XX")
    return f"{subj}_{scn}_G{grade}"


# ============ 迁移函数 ============

async def convert_question_type(v1_type: QuestionType) -> dict:
    """将 V1 题型转换为 V2 格式"""
    stage = grade_to_stage(v1_type.grade)
    interaction_type = SCENE_TO_INTERACTION_TYPE.get(v1_type.scene, "single_choice")
    answer_type = scene_to_answer_type(v1_type.scene)
    resource_type = RESOURCE_TYPE_MAP.get(v1_type.resource_type, "text")
    
    return {
        "code": generate_type_code(v1_type.subject, v1_type.scene, v1_type.grade),
        "name": v1_type.title,
        "description": v1_type.description,
        "subject": v1_type.subject,
        "stages": [stage],
        "grades": [v1_type.grade],
        "interaction_type": interaction_type,
        "interaction_config": {
            "min_options": 2,
            "max_options": 4,
            "shuffle_options": True,
        } if interaction_type in ["single_choice", "multi_choice"] else None,
        "resource_type": resource_type,
        "resource_config": None,
        "answer_type": answer_type,
        "answer_config": None,
        "feedback_config": {
            "show_correct_answer": True,
            "show_explanation": True,
            "allow_retry": True,
            "max_attempts": 3,
        },
        "cognitive_levels": ["remember", "understand"],
        "ability_dimensions": [],
        "ai_prompt": v1_type.prompt,
        "output_schema": None,
        "sort_order": 0,
        "is_active": True,
        "create_time": v1_type.create_time or now(),
        "update_time": v1_type.update_time or now(),
        "_v1_id": v1_type.id,  # 保留映射关系
    }


def parse_v1_options(options) -> list:
    """解析 V1 选项格式"""
    if not options:
        return []
    
    # V1 options 已经是 JSON 格式
    if isinstance(options, list):
        result = []
        for i, opt in enumerate(options):
            if isinstance(opt, dict):
                result.append({
                    "id": opt.get("id", chr(65 + i)),  # A, B, C, D...
                    "content": opt.get("content", str(opt)),
                    "is_correct": opt.get("is_correct", False),
                })
            else:
                result.append({
                    "id": chr(65 + i),
                    "content": str(opt),
                    "is_correct": False,
                })
        return result
    
    return []


async def convert_question(
    v1_question: Question,
    type_mapping: dict[int, QuestionTypeV2],
) -> Optional[dict]:
    """将 V1 题目转换为 V2 格式"""
    # 查找对应的 V2 题型
    v2_type = None
    for v2_t in type_mapping.values():
        if (v2_t.subject == v1_question.subject and 
            v1_question.grade in v2_t.grades):
            v2_type = v2_t
            break
    
    stage = grade_to_stage(v1_question.grade)
    difficulty = DIFFICULTY_MAP.get(v1_question.difficulty, "medium")
    
    # 构建 stem
    stem = {
        "text": v1_question.content,
        "rich_text": None,
        "audio_url": None,
        "highlight_words": [],
        "hints": [],
        "sub_questions": [],
    }
    
    # 构建 options
    options = parse_v1_options(v1_question.options)
    
    # 构建 resources
    resources = []
    if v1_question.resource:
        resources.append({
            "type": v1_question.resource_type or "image",
            "url": v1_question.resource,
            "content": v1_question.resource_content,
            "position": "top",
        })
    
    # 构建 answer
    answer = {
        "type": "exact",
        "correct_answers": [v1_question.answer] if v1_question.answer else [],
        "accept_values": [],
        "scoring": {
            "full_score": 10,
            "partial_enabled": False,
        },
    }
    
    # 知识点
    knowledge_points = []
    if v1_question.knowledge:
        knowledge_points = [v1_question.knowledge]
    
    return {
        "id": v1_question.id if v1_question.id else str(uuid.uuid4()),
        "question_type_id": v2_type.id if v2_type else 0,
        "question_type_code": v2_type.code if v2_type else "UNKNOWN",
        "subject": v1_question.subject,
        "grade": v1_question.grade,
        "stage": stage,
        "textbook_id": v1_question.textbook_id,
        "unit_id": v1_question.unit_id,
        "stem": stem,
        "options": options if options else None,
        "blanks": None,
        "resources": resources if resources else None,
        "answer": answer,
        "explanation": None,
        "difficulty": difficulty,
        "cognitive_level": "understand",
        "knowledge_points": knowledge_points if knowledge_points else None,
        "ability_tags": None,
        "source": "migration",
        "prompt_id": v1_question.prompt_id,
        "usage_count": 0,
        "correct_rate": None,
        "avg_time_spent": None,
        "is_active": True,
        "create_time": now(),
        "update_time": now(),
    }


async def migrate_question_types(
    db: AsyncSession,
    dry_run: bool = False,
) -> dict[int, QuestionTypeV2]:
    """迁移题型数据"""
    print("\n=== 开始迁移题型 ===")
    
    # 读取所有 V1 题型
    result = await db.execute(select(QuestionType))
    v1_types = result.scalars().all()
    print(f"发现 {len(v1_types)} 个 V1 题型")
    
    type_mapping = {}  # v1_id -> v2_type
    created_codes = set()  # 避免重复 code
    
    for v1_type in v1_types:
        v2_data = await convert_question_type(v1_type)
        
        # 确保 code 唯一
        base_code = v2_data["code"]
        code = base_code
        counter = 1
        while code in created_codes:
            code = f"{base_code}_{counter}"
            counter += 1
        v2_data["code"] = code
        created_codes.add(code)
        
        v1_id = v2_data.pop("_v1_id")
        
        print(f"  转换: {v1_type.title} (ID:{v1_id}) -> {code}")
        
        if not dry_run:
            v2_type = QuestionTypeV2(**v2_data)
            db.add(v2_type)
            await db.flush()
            type_mapping[v1_id] = v2_type
        else:
            # dry run 模式下创建临时对象
            v2_type = QuestionTypeV2(**v2_data)
            v2_type.id = v1_id  # 使用 V1 ID 作为临时 ID
            type_mapping[v1_id] = v2_type
    
    if not dry_run:
        await db.commit()
        print(f"✓ 成功迁移 {len(type_mapping)} 个题型")
    else:
        print(f"[DRY RUN] 将迁移 {len(type_mapping)} 个题型")
    
    return type_mapping


async def migrate_questions(
    db: AsyncSession,
    type_mapping: dict[int, QuestionTypeV2],
    dry_run: bool = False,
) -> int:
    """迁移题目数据"""
    print("\n=== 开始迁移题目 ===")
    
    # 获取 V1 题目总数
    count_result = await db.execute(select(func.count(Question.id)))
    total = count_result.scalar()
    print(f"发现 {total} 个 V1 题目")
    
    # 分批处理
    batch_size = 100
    offset = 0
    migrated = 0
    errors = 0
    
    while offset < total:
        result = await db.execute(
            select(Question).offset(offset).limit(batch_size)
        )
        v1_questions = result.scalars().all()
        
        for v1_q in v1_questions:
            try:
                v2_data = await convert_question(v1_q, type_mapping)
                if v2_data:
                    if not dry_run:
                        v2_question = QuestionV2(**v2_data)
                        db.add(v2_question)
                    migrated += 1
            except Exception as e:
                errors += 1
                print(f"  ✗ 迁移失败 ID:{v1_q.id}: {e}")
        
        if not dry_run:
            await db.commit()
        
        offset += batch_size
        print(f"  进度: {min(offset, total)}/{total}")
    
    if not dry_run:
        print(f"✓ 成功迁移 {migrated} 个题目, {errors} 个失败")
    else:
        print(f"[DRY RUN] 将迁移 {migrated} 个题目")
    
    return migrated


async def verify_migration(db: AsyncSession):
    """验证迁移结果"""
    print("\n=== 验证迁移结果 ===")
    
    # 题型数量对比
    v1_type_count = await db.execute(select(func.count(QuestionType.id)))
    v2_type_count = await db.execute(select(func.count(QuestionTypeV2.id)))
    
    v1_tc = v1_type_count.scalar()
    v2_tc = v2_type_count.scalar()
    
    print(f"题型数量: V1={v1_tc}, V2={v2_tc}")
    if v1_tc == v2_tc:
        print("  ✓ 题型数量一致")
    else:
        print(f"  ⚠ 题型数量差异: {v2_tc - v1_tc}")
    
    # 题目数量对比
    v1_q_count = await db.execute(select(func.count(Question.id)))
    v2_q_count = await db.execute(select(func.count(QuestionV2.id)))
    
    v1_qc = v1_q_count.scalar()
    v2_qc = v2_q_count.scalar()
    
    print(f"题目数量: V1={v1_qc}, V2={v2_qc}")
    if v1_qc == v2_qc:
        print("  ✓ 题目数量一致")
    else:
        print(f"  ⚠ 题目数量差异: {v2_qc - v1_qc}")


async def main(dry_run: bool = False):
    """主迁移流程"""
    print("=" * 50)
    print("V1 到 V2 数据迁移")
    print("=" * 50)
    
    if dry_run:
        print("\n⚠ DRY RUN 模式 - 不会实际写入数据\n")
    
    db = get_async_session()
    try:
        # 1. 迁移题型
        type_mapping = await migrate_question_types(db, dry_run)
        
        # 2. 迁移题目
        await migrate_questions(db, type_mapping, dry_run)
        
        # 3. 验证
        if not dry_run:
            await verify_migration(db)
        
        print("\n" + "=" * 50)
        print("迁移完成!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n✗ 迁移失败: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        await db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="V1 到 V2 数据迁移")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="仅预览迁移操作，不实际写入数据",
    )
    args = parser.parse_args()
    
    asyncio.run(main(dry_run=args.dry_run))
