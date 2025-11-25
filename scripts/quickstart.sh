#!/bin/bash

###############################################################################
# AI Education Platform - 快速启动脚本
# 功能: 一键配置和启动项目
###############################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_info "=========================================="
log_info "AI Education Platform - 快速启动"
log_info "=========================================="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装，请先安装 Docker Desktop"
    log_info "下载地址: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker 未运行，请启动 Docker Desktop"
    exit 1
fi

log_success "Docker 检查通过"

# 检查环境配置文件
if [ ! -f ".env" ]; then
    log_warn "未找到 .env 文件，正在从模板创建..."

    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_success "已创建 .env 文件"
        log_warn "请编辑 .env 文件，填入真实的配置信息"
        log_info "特别注意修改以下配置:"
        echo "  - 数据库密码 (MYSQL_PASSWORD)"
        echo "  - Redis 密码 (REDIS_PASSWORD)"
        echo "  - 应用密钥 (APP_SECRET_KEY)"
        echo "  - 管理员账号密码 (ADMIN_USERNAME, ADMIN_PASSWORD)"
        echo "  - AI 平台配置 (AI_PLATFORM_KEY)"
        echo "  - 阿里云配置 (ALIYUN_*)"
        echo ""
        read -p "配置完成后按 Enter 继续..." -r
    else
        log_error "未找到 .env.example 文件"
        exit 1
    fi
fi

# 创建必要的目录
log_info "创建必要的目录..."
mkdir -p nginx/ssl
mkdir -p mysql/init
mkdir -p backups
log_success "目录创建完成"

# 构建镜像
log_info "=========================================="
log_info "开始构建 Docker 镜像..."
log_info "这可能需要几分钟时间，请耐心等待"
log_info "=========================================="

if docker compose version &> /dev/null; then
    docker compose build
else
    docker-compose build
fi

log_success "镜像构建完成"

# 启动服务
log_info "=========================================="
log_info "启动服务..."
log_info "=========================================="

if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

log_success "服务启动成功!"

# 等待服务就绪
log_info "等待服务启动..."
sleep 10

# 显示服务状态
log_info "=========================================="
log_info "服务状态"
log_info "=========================================="

if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

echo ""
log_success "=========================================="
log_success "部署完成!"
log_success "=========================================="
echo ""
log_info "访问地址:"
echo "  管理后台: http://localhost/admin"
echo "  学生端:   http://localhost/student"
echo "  API 文档: http://localhost/api/docs"
echo ""
log_info "常用命令:"
echo "  查看日志: ./scripts/deploy.sh logs"
echo "  重启服务: ./scripts/deploy.sh restart"
echo "  停止服务: ./scripts/deploy.sh stop"
echo "  查看状态: ./scripts/deploy.sh status"
echo ""
log_info "更多命令请查看: ./scripts/deploy.sh help"
