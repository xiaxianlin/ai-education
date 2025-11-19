"""
Prompt V2 测试脚本

用于验证 V2 版本的 Prompt 生成功能
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import AsyncSessionLocal
from shared.question.graph import generate_question_graph


async def test_unit_prompt_v2():
    """测试单元训练 V2"""
    print("\n" + "="*60)
    print("测试单元训练 Prompt V2")
    print("="*60)

    async with AsyncSessionLocal() as db:
        try:
            result = await generate_question_graph(
                db=db,
                unit_id=1,  # 请替换为实际的单元ID
                count=5,
                generation_type="unit",
                use_prompt_v2=True
            )

            print(f"✅ 生成成功！")
            print(f"Prompt 版本: {result.get('prompt_version', 'unknown')}")
            print(f"生成题目数量: {len(result.get('saved_questions', []))}")

            # 显示生成的题目
            for i, question in enumerate(result.get('saved_questions', [])[:3], 1):
                print(f"\n--- 题目 {i} ---")
                print(f"类型: {question.type}")
                print(f"子类型: {question.subtype or '无'}")
                print(f"难度: {question.difficulty}")
                print(f"知识点: {question.knowledge}")
                print(f"题干: {question.content[:50]}...")

        except Exception as e:
            print(f"❌ 测试失败: {e}")


async def test_daily_prompt_v2():
    """测试今日训练 V2（带学生数据）"""
    print("\n" + "="*60)
    print("测试今日训练 Prompt V2")
    print("="*60)

    async with AsyncSessionLocal() as db:
        try:
            result = await generate_question_graph(
                db=db,
                unit_id=1,
                count=10,
                generation_type="daily",
                use_prompt_v2=True,
                student_id="test_student_001",  # 请替换为实际的学生ID
                textbook_id=1  # 请替换为实际的教材ID
            )

            print(f"✅ 生成成功！")
            print(f"Prompt 版本: {result.get('prompt_version', 'unknown')}")
            print(f"生成题目数量: {len(result.get('saved_questions', []))}")

            # 统计题目难度分布
            difficulties = {}
            for question in result.get('saved_questions', []):
                diff = question.difficulty
                difficulties[diff] = difficulties.get(diff, 0) + 1

            print(f"\n难度分布:")
            for diff, count in difficulties.items():
                print(f"  {diff}: {count} 题")

        except Exception as e:
            print(f"❌ 测试失败: {e}")
            import traceback
            traceback.print_exc()


async def test_assessment_prompt_v2():
    """测试能力评估 V2"""
    print("\n" + "="*60)
    print("测试能力评估 Prompt V2")
    print("="*60)

    async with AsyncSessionLocal() as db:
        try:
            result = await generate_question_graph(
                db=db,
                unit_id=1,
                count=9,  # 测试难度分布：3简单 + 5普通 + 1困难
                generation_type="assessment",
                use_prompt_v2=True
            )

            print(f"✅ 生成成功！")
            print(f"Prompt 版本: {result.get('prompt_version', 'unknown')}")
            print(f"生成题目数量: {len(result.get('saved_questions', []))}")

            # 验证难度分布
            difficulties = {}
            for question in result.get('saved_questions', []):
                diff = question.difficulty
                difficulties[diff] = difficulties.get(diff, 0) + 1

            print(f"\n难度分布（期望：简单30%/普通50%/困难20%）:")
            total = len(result.get('saved_questions', []))
            for diff, count in difficulties.items():
                percentage = (count / total * 100) if total > 0 else 0
                print(f"  {diff}: {count} 题 ({percentage:.1f}%)")

        except Exception as e:
            print(f"❌ 测试失败: {e}")


async def test_v1_vs_v2_comparison():
    """对比 V1 vs V2 的生成效果"""
    print("\n" + "="*60)
    print("V1 vs V2 对比测试")
    print("="*60)

    async with AsyncSessionLocal() as db:
        try:
            # 测试 V1
            print("\n[V1 版本]")
            result_v1 = await generate_question_graph(
                db=db,
                unit_id=1,
                count=5,
                generation_type="unit",
                use_prompt_v2=False
            )
            print(f"Prompt 版本: {result_v1.get('prompt_version', 'v1')}")
            print(f"生成题目数量: {len(result_v1.get('saved_questions', []))}")

            # 测试 V2
            print("\n[V2 版本]")
            result_v2 = await generate_question_graph(
                db=db,
                unit_id=1,
                count=5,
                generation_type="unit",
                use_prompt_v2=True
            )
            print(f"Prompt 版本: {result_v2.get('prompt_version', 'v2')}")
            print(f"生成题目数量: {len(result_v2.get('saved_questions', []))}")

            # 对比分析（简单示例）
            print("\n[对比分析]")
            print("V1 和 V2 均生成成功，可进一步进行质量评估")

        except Exception as e:
            print(f"❌ 对比测试失败: {e}")


async def main():
    """主测试函数"""
    print("\n" + "="*60)
    print("Prompt V2 测试套件")
    print("="*60)

    # 运行各项测试
    await test_unit_prompt_v2()
    await test_daily_prompt_v2()
    await test_assessment_prompt_v2()
    await test_v1_vs_v2_comparison()

    print("\n" + "="*60)
    print("测试完成！")
    print("="*60)


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║            Prompt V2 测试脚本                               ║
║                                                            ║
║  使用前请确保：                                              ║
║  1. 数据库中有实际的单元、教材、知识点数据                      ║
║  2. 修改脚本中的 unit_id、student_id、textbook_id           ║
║  3. 配置了正确的 AI_PLATFORM_KEY（阿里云 API Key）          ║
╚════════════════════════════════════════════════════════════╝
    """)

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n测试被用户中断")
    except Exception as e:
        print(f"\n\n测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
