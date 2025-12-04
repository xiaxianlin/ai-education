#!/bin/bash

# 构建脚本：构建共享类型包（支持三端：TS、Python、Dart）
set -e

echo "🏗️  开始构建共享类型包..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在 shared-types 目录下运行此脚本"
    exit 1
fi

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
npm run clean

# 安装依赖
echo "📦 安装依赖..."
npm install

# 类型检查
echo "🔍 进行 TypeScript 类型检查..."
npm run type-check

# 构建所有平台
echo "🔨 构建所有平台类型..."
npm run build

# 验证构建结果
echo "✅ 验证构建结果..."
required_files=(
    "build/index.d.ts"
    "build/python/models.py"
    "build/dart/enums.dart"
    "build/dart/models.dart"
    "build/dart/shared_types.dart"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ 缺少 $file"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    echo "❌ 构建失败: 缺少 $missing_files 个必要文件"
    exit 1
fi

# 运行验证
echo "🔍 运行类型验证..."
npm run validate

echo "🎉 构建完成!"
echo ""
echo "📁 输出文件:"
echo "  • TypeScript: build/"
echo "  • Python:     build/python/"
echo "  • Dart:        build/dart/"
echo ""
echo "📊 文件大小统计:"
du -sh build/* 2>/dev/null || true

echo ""
echo "🚀 快速集成指南:"
echo "  • 前端项目: npm install @ai-edu/shared-types"
echo "  • 后端项目: cp -r build/python/ server/shared_types/"
echo "  • Flutter项目: cp -r build/dart/ mobile/lib/shared_types/"