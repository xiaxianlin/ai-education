#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
学生信息表优化设计 - API 测试脚本

使用方法:
python test_api.py

注意: 需要先启动服务器
"""

import asyncio
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from common.database import async_engine, AsyncSessionLocal


async def test_api():
    """测试新 API 的基本功能"""

    print("=" * 60)
    print("开始测试学生信息表优化设计的 API")
    print("=" * 60)

    async with async_engine.begin() as conn:
        print("\n1. 测试数据库连接... ", end="")
        result = await conn.execute(text("SELECT 1"))
        print("✓ 连接成功")

        print("\n2. 检查表是否存在... ")

        tables_to_check = [
            "ah_student_profile",
            "ah_student_stats",
            "ah_study_record",
            "ah_student_wrong_question",
        ]

        for table in tables_to_check:
            result = await conn.execute(
                text(f"SHOW TABLES LIKE '{table}'")
            )
            if result.fetchone():
                print(f"   ✓ {table} 存在")
            else:
                print(f"   ✗ {table} 不存在 - 需要运行迁移脚本")

        print("\n3. 测试数据库模型导入... ", end="")
        try:
            from common.database import (
                StudentProfile,
                StudentStats,
                StudyRecord,
                StudentWrongQuestion,
            )
            print("✓ 模型导入成功")
        except Exception as e:
            print(f"✗ 模型导入失败: {e}")
            return

        print("\n4. 测试 Schema 导入... ", end="")
        try:
            from admin.schema import (
                StudentProfileSchema,
                StudentStatsSchema,
                StudyRecordSchema,
                CreateStudentProfileSchema,
                SearchSchema,
            )
            print("✓ Schema 导入成功")
        except Exception as e:
            print(f"✗ Schema 导入失败: {e}")
            return

        print("\n5. 测试服务层导入... ", end="")
        try:
            from admin.services import profile, stats, study_record, wrong_question
            print("✓ 服务层导入成功")
        except Exception as e:
            print(f"✗ 服务层导入失败: {e}")
            return

    print("\n" + "=" * 60)
    print("基本 API 测试完成！")
    print("=" * 60)
    print("\n接下来:")
    print("1. 运行迁移脚本: mysql -u root -p < ../../docs/001_student_enhancement.sql")
    print("2. 启动服务器: uv run main.py")
    print("3. 使用前端界面或 API 测试工具进行完整测试")
    print("\nAPI 端点:")
    print("- Admin: GET/POST /api/admin/student/{id}/profile")
    print("- Admin: GET/POST /api/admin/student/{id}/stats")
    print("- Student: GET/POST /api/student/profile")
    print("- Student: GET /api/student/profile/stats")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_api())
