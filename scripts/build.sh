#!/bin/bash

###############################################################################
# AI Education Platform - Docker 构建脚本
# 功能: 构建所有 Docker 镜像
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

log_info "开始构建 Docker 镜像..."
log_info "项目目录: $PROJECT_ROOT"

# 读取版本号
VERSION=${VERSION:-latest}
log_info "镜像版本: $VERSION"

# 是否使用缓存
NO_CACHE=${NO_CACHE:-false}
BUILD_ARGS=""
if [ "$NO_CACHE" = "true" ]; then
    BUILD_ARGS="--no-cache"
    log_warn "已禁用构建缓存"
fi

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 构建函数
build_image() {
    local service=$1
    local context=$2
    local tag=$3

    log_info "正在构建 $service 镜像..."

    if docker build $BUILD_ARGS -t "$tag" -f "$context/Dockerfile" "$context"; then
        log_success "$service 镜像构建成功: $tag"
    else
        log_error "$service 镜像构建失败"
        return 1
    fi
}

# 构建所有镜像
build_all() {
    log_info "=========================================="
    log_info "开始构建所有镜像"
    log_info "=========================================="

    # 构建后端服务
    build_image "Server API" "$PROJECT_ROOT/apps/server-api" "ai-education-server-api:$VERSION"

    # 构建任务服务
    build_image "Server Task" "$PROJECT_ROOT/apps/server-task" "ai-education-server-task:$VERSION"

    # 构建管理后台
    build_image "Admin Web" "$PROJECT_ROOT/apps/admin-web" "ai-education-admin-web:$VERSION"

    # 构建学生端
    build_image "Student Web" "$PROJECT_ROOT/apps/student-web" "ai-education-student-web:$VERSION"

    log_success "=========================================="
    log_success "所有镜像构建完成!"
    log_success "=========================================="
}

# 构建单个服务
build_single() {
    local service=$1

    case $service in
        server-api)
            build_image "Server API" "$PROJECT_ROOT/apps/server-api" "ai-education-server-api:$VERSION"
            ;;
        server-task)
            build_image "Server Task" "$PROJECT_ROOT/apps/server-task" "ai-education-server-task:$VERSION"
            ;;
        admin-web)
            build_image "Admin Web" "$PROJECT_ROOT/apps/admin-web" "ai-education-admin-web:$VERSION"
            ;;
        student-web)
            build_image "Student Web" "$PROJECT_ROOT/apps/student-web" "ai-education-student-web:$VERSION"
            ;;
        *)
            log_error "未知的服务: $service"
            log_info "可用的服务: server-api, server-task, admin-web, student-web"
            exit 1
            ;;
    esac
}

# 使用 docker-compose 构建
build_with_compose() {
    log_info "使用 docker-compose 构建镜像..."

    if docker compose version &> /dev/null; then
        docker compose build $BUILD_ARGS $@
    else
        docker-compose build $BUILD_ARGS $@
    fi

    log_success "Docker Compose 构建完成!"
}

# 主函数
main() {
    # 检查参数
    if [ $# -eq 0 ]; then
        # 没有参数，构建所有镜像
        build_all
    elif [ "$1" = "--compose" ] || [ "$1" = "-c" ]; then
        # 使用 docker-compose 构建
        shift
        build_with_compose $@
    elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "用法: $0 [选项] [服务名]"
        echo ""
        echo "选项:"
        echo "  --compose, -c     使用 docker-compose 构建"
        echo "  --help, -h        显示帮助信息"
        echo ""
        echo "服务名:"
        echo "  server-api        只构建后端API服务"
        echo "  server-task       只构建任务服务"
        echo "  admin-web         只构建管理后台"
        echo "  student-web       只构建学生端"
        echo "  (无参数)          构建所有服务"
        echo ""
        echo "环境变量:"
        echo "  VERSION           镜像版本标签 (默认: latest)"
        echo "  NO_CACHE          禁用构建缓存 (true/false, 默认: false)"
        echo ""
        echo "示例:"
        echo "  $0                          # 构建所有服务"
        echo "  $0 server-api               # 只构建后端API服务"
        echo "  $0 --compose                # 使用 docker-compose 构建所有服务"
        echo "  VERSION=v1.0.0 $0           # 指定版本构建"
        echo "  NO_CACHE=true $0 server-api # 禁用缓存构建后端"
        exit 0
    else
        # 构建指定的服务
        build_single "$1"
    fi
}

# 执行主函数
main "$@"
