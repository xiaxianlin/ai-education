"""修复题目资源位置错误

问题描述：
LLM 生成题目时，可能将 resources 字段放在了 stem 对象内部，而非题目顶层。
例如：
{
    "stem": {
        "text": "Look at the flower...",
        "resources": [...]  # 错误位置
    }
}

正确位置应该是：
{
    "stem": {"text": "Look at the flower..."},
    "resources": [...]  # 正确位置
}

此脚本会：
1. 查找所有 stem 内部包含 resources 的题目
2. 将 resources 提取到题目顶层
3. 更新数据库
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from loguru import logger
from shared.core.database import AsyncSessionLocal, Question
from sqlalchemy import select, text
from sqlalchemy.orm.attributes import flag_modified


async def fix_question_resources(dry_run: bool = True):
    """修复题目资源位置错误

    Args:
        dry_run: 如果为 True，只打印需要修复的数据，不实际修改
    """
    logger.info(f"开始修复题目资源位置 (dry_run={dry_run})")

    async with AsyncSessionLocal() as db:
        # 查询所有题目
        result = await db.execute(select(Question))
        questions = result.scalars().all()

        fixed_count = 0
        error_count = 0

        for question in questions:
            try:
                stem = question.stem
                if not isinstance(stem, dict):
                    continue

                # 检查 stem 内是否有 resources
                if "resources" not in stem:
                    continue

                stem_resources = stem.get("resources")
                if not stem_resources or not isinstance(stem_resources, list):
                    continue

                # 发现需要修复的数据
                logger.info(
                    f"发现需要修复的题目: id={question.id}, "
                    f"stem_resources_count={len(stem_resources)}"
                )

                if dry_run:
                    logger.info(f"  [DRY RUN] 跳过修复")
                    fixed_count += 1
                    continue

                # 提取 resources 到顶层
                # 1. 从 stem 中移除 resources
                new_stem = dict(stem)
                extracted_resources = new_stem.pop("resources")

                # 2. 合并到题目顶层的 resources
                if question.resources is None:
                    question.resources = []
                elif not isinstance(question.resources, list):
                    question.resources = [question.resources]

                question.resources.extend(extracted_resources)

                # 3. 更新 stem
                question.stem = new_stem

                # 4. 标记字段已修改（确保 SQLAlchemy 检测到 JSON 字段变化）
                flag_modified(question, "stem")
                flag_modified(question, "resources")

                logger.info(
                    f"  已修复: stem.resources -> resources, "
                    f"total_resources={len(question.resources)}"
                )
                fixed_count += 1

            except Exception as e:
                logger.error(f"修复题目失败: id={question.id}, error={e}")
                error_count += 1

        # 提交更改
        if not dry_run and fixed_count > 0:
            try:
                await db.commit()
                logger.info(f"数据库更新已提交")
            except Exception as e:
                logger.error(f"提交失败: {e}")
                await db.rollback()
                raise

        logger.info(
            f"修复完成: 共检查 {len(questions)} 道题目, "
            f"修复 {fixed_count} 道, 错误 {error_count} 道"
        )

        return {"total": len(questions), "fixed": fixed_count, "errors": error_count}


async def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="修复题目资源位置错误")
    parser.add_argument(
        "--execute", action="store_true", help="实际执行修复（默认为 dry-run 模式）"
    )
    args = parser.parse_args()

    dry_run = not args.execute

    if not dry_run:
        logger.warning("⚠️  正在以执行模式运行，将修改数据库！")
        confirm = input("确认继续? (yes/no): ")
        if confirm.lower() != "yes":
            logger.info("已取消")
            return
    else:
        logger.info("📋 以 dry-run 模式运行，不会修改数据库")

    result = await fix_question_resources(dry_run=dry_run)
    print(f"\n结果: {result}")


if __name__ == "__main__":
    asyncio.run(main())
