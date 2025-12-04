#!/bin/bash

# 自动同步共享类型到 Flutter 项目
set -e

echo "🐦 同步共享类型到 Flutter 项目..."

# 检查路径
if [ ! -d "shared-types" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

if [ ! -d "mobile" ]; then
    echo "❌ 错误: Flutter 项目目录不存在"
    exit 1
fi

# 构建共享类型
echo "🔨 构建共享类型..."
cd shared-types
npm run build
cd ..

# 同步到 Flutter
echo "📦 同步到 Flutter 项目..."
FLUTTER_TYPES_DIR="mobile/lib/core/shared_types"

# 创建目标目录
mkdir -p "$FLUTTER_TYPES_DIR"

# 复制文件
cp -r shared-types/build/dart/* "$FLUTTER_TYPES_DIR/"

echo "  ✅ enums.dart -> $FLUTTER_TYPES_DIR/enums.dart"
echo "  ✅ models.dart -> $FLUTTER_TYPES_DIR/models.dart"
echo "  ✅ shared_types.dart -> $FLUTTER_TYPES_DIR/shared_types.dart"

# 运行 Flutter 代码生成
echo "🔧 生成 Flutter 代码..."
cd mobile

# 检查依赖
if ! grep -q "json_annotation" pubspec.yaml; then
    echo "⚠️  警告: pubspec.yaml 缺少 json_annotation 依赖"
fi

# 安装依赖
flutter pub get

# 生成代码
flutter packages pub run build_runner build --delete-conflicting-outputs

echo "✅ 同步完成!"
echo ""
echo "📱 Flutter 集成说明:"
echo "  1. 在需要的地方导入: import 'package:ai_education/core/shared_types/shared_types.dart';"
echo "  2. 运行 flutter packages pub run build_runner watch --delete-conflicting-outputs 启用监听模式"
echo "  3. 参考 shared-types/examples/flutter-integration.md 查看使用示例"