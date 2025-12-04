#!/usr/bin/env python3
"""
测试共享类型的导入和使用
"""

def test_import():
    """测试共享类型导入"""
    try:
        from shared_types import (
            Student,
            StudentLoginRequest,
            PracticeSession,
            Question,
            Textbook,
            ApiResponse,
            PaginatedResponse,
            PracticeType,
            Difficulty,
            Subject
        )
        print("✅ 共享类型导入成功")
        return True
    except ImportError as e:
        print(f"❌ 共享类型导入失败: {e}")
        return False

def test_type_creation():
    """测试类型实例化"""
    try:
        from shared_types import Student, StudentLoginRequest, PracticeType

        # 测试学生登录请求
        login_request = StudentLoginRequest(
            phone="13800138000",
            password="123456"
        )
        print("✅ StudentLoginRequest 实例化成功")

        # 测试学生类型
        student = Student(
            id="123",
            name="张三",
            phone="13800138000",
            grade=5,
            status=1,
            create_time=1640995200
        )
        print("✅ Student 实例化成功")

        # 测试枚举类型
        practice_type = PracticeType.DAILY
        print(f"✅ PracticeType 枚举: {practice_type}")

        return True
    except Exception as e:
        print(f"❌ 类型实例化失败: {e}")
        return False

def test_json_serialization():
    """测试 JSON 序列化"""
    try:
        from shared_types import Student

        student = Student(
            id="123",
            name="张三",
            phone="13800138000",
            grade=5,
            status=1,
            create_time=1640995200
        )

        # 测试转换为字典
        student_dict = student.model_dump()
        print(f"✅ JSON 序列化成功: {len(student_dict)} 个字段")

        # 测试从字典恢复
        restored_student = Student(**student_dict)
        print("✅ JSON 反序列化成功")

        # 验证数据一致性
        if restored_student.id == student.id and restored_student.name == student.name:
            print("✅ 序列化/反序列化数据一致")
        else:
            print("❌ 序列化/反序列化数据不一致")
            return False

        return True
    except Exception as e:
        print(f"❌ JSON 序列化测试失败: {e}")
        return False

def test_api_response():
    """测试 API 响应类型"""
    try:
        from shared_types import ApiResponse, Student

        student = Student(
            id="123",
            name="张三",
            phone="13800138000",
            grade=5,
            status=1,
            create_time=1640995200
        )

        response = ApiResponse(
            code=0,
            message="success",
            data=student
        )

        response_dict = response.model_dump()
        print(f"✅ API 响应创建成功: code={response_dict['code']}")

        return True
    except Exception as e:
        print(f"❌ API 响应测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🧪 开始测试共享类型...")

    tests = [
        ("导入测试", test_import),
        ("类型创建测试", test_type_creation),
        ("JSON 序列化测试", test_json_serialization),
        ("API 响应测试", test_api_response),
    ]

    passed = 0
    total = len(tests)

    for name, test_func in tests:
        print(f"\n📋 {name}:")
        if test_func():
            passed += 1
        else:
            print(f"❌ {name} 失败")

    print(f"\n📊 测试结果: {passed}/{total} 通过")

    if passed == total:
        print("🎉 所有测试通过！共享类型可以正常使用")
        return True
    else:
        print("⚠️ 部分测试失败，请检查配置")
        return False

if __name__ == "__main__":
    main()