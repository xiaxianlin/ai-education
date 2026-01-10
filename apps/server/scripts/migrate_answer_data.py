#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
答题记录数据迁移脚本

将 answer 字段中的数据转换为标准 JSON 格式

答案格式规范：
- 复合题: [{"sub_id": "1", "value": "答案1"}, {"sub_id": "2", "value": "答案2"}]
- 多选题: ["A", "B", "C"]
- 匹配题: {"A": "1", "B": "2"}
- 其他题型: 字符串，如 "A" 或 "答案内容"

执行前请确保：
1. 已执行 SQL 升级脚本（添加 audio_url 字段，重命名 text_answer 为 answer）
2. 已备份数据库
3. 数据库连接配置正确
"""

import asyncio
import json
import sys
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from loguru import logger
from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from shared.core.database import PracticeAnswer
from shared.core.settings import envs as settings


def convert_answer_format(old_answer):
    """将答案转换为新格式（JSON 字符串）
    
    Args:
        old_answer: 答案（可能是字符串、JSON 字符串等）
    
    Returns:
        新格式的答案（JSON 字符串）
    """
    if not old_answer:
        return None
    
    try:
        # 尝试解析为 JSON
        parsed = json.loads(old_answer)
        # 直接返回 JSON 字符串
        return json.dumps(parsed, ensure_ascii=False)
    except (json.JSONDecodeError, TypeError):
        # 不是 JSON 格式，转换为 JSON 字符串
        return json.dumps(old_answer, ensure_ascii=False)


async def migrate_answers(db: AsyncSession, batch_size: int = 100):
    """迁移答题记录数据
    
    Args:
        db: 数据库会话
        batch_size: 批量处理大小
    """
    logger.info("开始迁移答题记录数据...")
    
    # 查询所有需要迁移的记录（answer 字段为 NULL 或空字符串的记录）
    # 注意：这里假设 SQL 升级脚本已经执行，text_answer 已经重命名为 answer
    # 如果还没有执行，需要先检查字段名
    
    # 先检查字段是否存在
    result = await db.execute(
        text("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'ah_practice_answer' 
              AND COLUMN_NAME IN ('answer', 'text_answer')
        """)
    )
    columns = [row[0] for row in result.fetchall()]
    
    if 'answer' not in columns and 'text_answer' in columns:
        logger.warning("检测到 text_answer 字段尚未重命名为 answer，请先执行 SQL 升级脚本")
        return
    
    # 查询所有记录（包括 answer 为 NULL 的记录，用于检查是否有遗漏的数据）
    total_count = await db.scalar(
        select(func.count(PracticeAnswer.id))
    )
    logger.info(f"总共需要检查 {total_count} 条记录")
    
    # 分批处理
    offset = 0
    migrated_count = 0
    skipped_count = 0
    
    while True:
        # 查询一批记录
        result = await db.execute(
            select(PracticeAnswer)
            .offset(offset)
            .limit(batch_size)
        )
        records = result.scalars().all()
        
        if not records:
            break
        
        # 处理每条记录
        for record in records:
            # 如果 answer 字段已经有值，跳过（可能已经迁移过）
            if record.answer:
                skipped_count += 1
                continue
            
            # 获取答案数据
            old_answer = record.answer
            
            if old_answer:
                # 转换格式
                new_answer = convert_answer_format(old_answer)
                if new_answer != old_answer:
                    record.answer = new_answer
                    migrated_count += 1
                else:
                    skipped_count += 1
            else:
                skipped_count += 1
        
        # 提交当前批次
        await db.commit()
        offset += batch_size
        
        logger.info(f"已处理 {min(offset, total_count)}/{total_count} 条记录，迁移 {migrated_count} 条，跳过 {skipped_count} 条")
    
    logger.info(f"迁移完成！总共迁移 {migrated_count} 条记录，跳过 {skipped_count} 条记录")


async def main():
    """主函数"""
    # 创建数据库引擎
    database_url = settings.DATABASE_URL
    if not database_url:
        logger.error("未配置数据库连接 URL")
        sys.exit(1)
    
    engine = create_async_engine(database_url, echo=False)
    
    try:
        async with AsyncSession(engine) as db:
            await migrate_answers(db)
    except Exception as e:
        logger.error(f"迁移过程中发生错误: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    import sys
    
    logger.info("=" * 60)
    logger.info("答题记录数据迁移脚本")
    logger.info("=" * 60)
    logger.info("")
    logger.info("警告：执行前请确保：")
    logger.info("1. 已执行 SQL 升级脚本（添加 audio_url 字段，重命名 text_answer 为 answer）")
    logger.info("2. 已备份数据库")
    logger.info("3. 数据库连接配置正确")
    logger.info("")
    
    # 支持非交互式执行（通过命令行参数 --yes）
    if len(sys.argv) > 1 and sys.argv[1] == "--yes":
        logger.info("非交互式模式：自动确认执行")
    else:
        try:
            response = input("是否继续执行迁移？(yes/no): ")
            if response.lower() != "yes":
                logger.info("已取消迁移")
                sys.exit(0)
        except EOFError:
            logger.warning("无法读取输入，使用非交互式模式")
    
    asyncio.run(main())
