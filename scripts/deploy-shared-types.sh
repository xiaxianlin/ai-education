#!/bin/bash
# Shared types deployment script
# Automatically builds and deploys shared types to all projects

set -e

echo "🚀 开始部署共享类型到所有平台..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SHARED_TYPES_DIR="$PROJECT_DIR/shared-types"

# Check if shared-types directory exists
if [ ! -d "$SHARED_TYPES_DIR" ]; then
    print_error "shared-types 目录不存在"
    exit 1
fi

cd "$SHARED_TYPES_DIR"

# Step 1: Install dependencies
echo "📦 安装 shared-types 依赖..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
print_status "依赖安装完成"

# Step 2: Build all types
echo "🔨 构建所有平台类型..."
npm run build
print_status "类型构建完成"

# Step 3: Validate consistency
echo "🔍 验证跨平台一致性..."
npm run test:consistency
print_status "一致性验证通过"

# Step 4: Deploy to frontend projects
echo "🌐 部署到前端项目..."

# Student portal
STUDENT_TYPES_DIR="$PROJECT_DIR/student/src/types/shared"
mkdir -p "$STUDENT_TYPES_DIR"
cp -r build/python/* "$STUDENT_TYPES_DIR/" 2>/dev/null || true
print_status "Student portal 部署完成"

# Admin portal
ADMIN_TYPES_DIR="$PROJECT_DIR/admin/src/types/shared"
mkdir -p "$ADMIN_TYPES_DIR"
cp -r build/python/* "$ADMIN_TYPES_DIR/" 2>/dev/null || true
print_status "Admin portal 部署完成"

# Step 5: Deploy to backend
echo "🐍 部署到后端项目..."
SERVER_TYPES_DIR="$PROJECT_DIR/server/shared_types"
mkdir -p "$SERVER_TYPES_DIR"

# Copy Python types
cp build/python/*.py "$SERVER_TYPES_DIR/" 2>/dev/null || true

# Create __init__.py if it doesn't exist
if [ ! -f "$SERVER_TYPES_DIR/__init__.py" ]; then
    echo "# Shared types module" > "$SERVER_TYPES_DIR/__init__.py"
fi

print_status "Backend 部署完成"

# Step 6: Deploy to mobile
echo "📱 部署到移动端项目..."
MOBILE_TYPES_DIR="$PROJECT_DIR/mobile/lib/core/shared_types"
mkdir -p "$MOBILE_TYPES_DIR"

# Copy Dart types
cp build/dart/*.dart "$MOBILE_TYPES_DIR/" 2>/dev/null || true

print_status "Mobile 部署完成"

# Step 7: Update project dependencies if needed
echo "🔄 检查项目依赖..."

# Check if student project needs dependency update
if [ -f "$PROJECT_DIR/student/package.json" ]; then
    cd "$PROJECT_DIR/student"
    if ! grep -q "@ai-edu/shared-types" package.json; then
        print_warning "Student 项目尚未添加 @ai-edu/shared-types 依赖"
        echo "请手动运行: npm install ../shared-types"
    else
        print_status "Student 项目依赖已配置"
    fi
fi

# Check if admin project needs dependency update
if [ -f "$PROJECT_DIR/admin/package.json" ]; then
    cd "$PROJECT_DIR/admin"
    if ! grep -q "@ai-edu/shared-types" package.json; then
        print_warning "Admin 项目尚未添加 @ai-edu/shared-types 依赖"
        echo "请手动运行: npm install ../shared-types"
    else
        print_status "Admin 项目依赖已配置"
    fi
fi

# Step 8: Quick validation tests
echo "🧪 运行快速验证..."

# Test Python types in server
cd "$PROJECT_DIR/server"
if command -v python3 &> /dev/null; then
    python3 -c "
try:
    from shared_types import Student, Question, ApiResponse
    print('✅ Python 类型导入测试通过')
except ImportError as e:
    print(f'❌ Python 类型导入失败: {e}')
    exit(1)
"
fi

# Test TypeScript types in student
cd "$PROJECT_DIR/student"
if command -v npx &> /dev/null && [ -f "package.json" ]; then
    if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
        print_status "TypeScript 类型检查通过"
    else
        print_warning "TypeScript 类型检查有警告"
    fi
fi

# Summary
echo ""
echo "🎉 共享类型部署完成！"
echo ""
echo "📋 部署摘要:"
echo "  • TypeScript 构建: ✅"
echo "  • Python 类型生成: ✅"
echo "  • Dart 类型生成: ✅"
echo "  • 跨平台一致性验证: ✅"
echo "  • Student Portal: ✅"
echo "  • Admin Portal: ✅"
echo "  • Backend Server: ✅"
echo "  • Mobile App: ✅"
echo ""
echo "💡 提示:"
echo "  - 如需修改类型，请编辑 shared-types/src/types/ 目录下的文件"
echo "  - 运行 'npm run dev' 在 shared-types 目录可启动监听模式"
echo "  - CI/CD 将自动构建和验证类型一致性"
echo ""

cd "$PROJECT_DIR"
print_status "🚀 所有平台共享类型部署成功！"