#!/bin/bash

###############################################################################
# AI Education Platform - Docker 部署脚本
# 功能: 部署和管理 Docker 容器
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

# 环境配置文件
ENV_FILE="${ENV_FILE:-.env}"

# 检查环境配置
check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        log_error "环境配置文件不存在: $ENV_FILE"
        log_info "请从 .env.example 复制并配置环境变量"
        exit 1
    fi
    log_success "环境配置文件检查通过: $ENV_FILE"
}

# 检查 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker 未运行，请启动 Docker"
        exit 1
    fi

    log_success "Docker 检查通过"
}

# 启动服务
start_services() {
    log_info "=========================================="
    log_info "启动服务..."
    log_info "=========================================="

    check_env
    check_docker

    # 创建必要的目录
    mkdir -p nginx/ssl
    mkdir -p mysql/init

    if docker compose version &> /dev/null; then
        docker compose --env-file "$ENV_FILE" up -d "$@"
    else
        docker-compose --env-file "$ENV_FILE" up -d "$@"
    fi

    log_success "服务启动成功!"
    show_status
}

# 停止服务
stop_services() {
    log_info "停止服务..."

    if docker compose version &> /dev/null; then
        docker compose stop "$@"
    else
        docker-compose stop "$@"
    fi

    log_success "服务已停止"
}

# 重启服务
restart_services() {
    log_info "重启服务..."

    if docker compose version &> /dev/null; then
        docker compose restart "$@"
    else
        docker-compose restart "$@"
    fi

    log_success "服务已重启"
    show_status
}

# 关闭服务(删除容器)
down_services() {
    log_warn "关闭并删除所有容器..."

    if docker compose version &> /dev/null; then
        docker compose down "$@"
    else
        docker-compose down "$@"
    fi

    log_success "服务已关闭"
}

# 查看日志
show_logs() {
    local service=$1

    if [ -z "$service" ]; then
        if docker compose version &> /dev/null; then
            docker compose logs -f --tail=100
        else
            docker-compose logs -f --tail=100
        fi
    else
        if docker compose version &> /dev/null; then
            docker compose logs -f --tail=100 "$service"
        else
            docker-compose logs -f --tail=100 "$service"
        fi
    fi
}

# 查看状态
show_status() {
    log_info "=========================================="
    log_info "服务状态"
    log_info "=========================================="

    if docker compose version &> /dev/null; then
        docker compose ps
    else
        docker-compose ps
    fi

    echo ""
    log_info "访问地址:"
    log_info "  管理后台: http://localhost/admin"
    log_info "  学生端:   http://localhost/student"
    log_info "  API:      http://localhost/api"
}

# 构建并启动
build_and_start() {
    log_info "构建并启动服务..."

    check_env
    check_docker

    if docker compose version &> /dev/null; then
        docker compose --env-file "$ENV_FILE" up -d --build "$@"
    else
        docker-compose --env-file "$ENV_FILE" up -d --build "$@"
    fi

    log_success "服务构建并启动成功!"
    show_status
}

# 清理资源
cleanup() {
    log_warn "=========================================="
    log_warn "清理 Docker 资源"
    log_warn "=========================================="

    read -p "是否删除所有容器、网络和卷? (y/N): " -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if docker compose version &> /dev/null; then
            docker compose down -v
        else
            docker-compose down -v
        fi
        log_success "清理完成"
    else
        log_info "取消清理"
    fi
}

# 数据库备份
backup_database() {
    log_info "备份数据库..."

    local backup_dir="$PROJECT_ROOT/backups"
    mkdir -p "$backup_dir"

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/database_backup_$timestamp.sql"

    # 从环境变量读取数据库配置
    source "$ENV_FILE"

    docker exec ai-education-mysql mysqldump \
        -u"${MYSQL_USER:-aiuser}" \
        -p"${MYSQL_PASSWORD:-aipassword}" \
        "${MYSQL_DATABASE:-ai_helper}" \
        > "$backup_file"

    log_success "数据库已备份到: $backup_file"
}

# 更新服务
update_services() {
    log_info "=========================================="
    log_info "更新服务..."
    log_info "=========================================="

    # 拉取最新代码
    if [ -d ".git" ]; then
        log_info "拉取最新代码..."
        git pull
    fi

    # 备份数据库
    backup_database

    # 重新构建并启动
    build_and_start "$@"

    log_success "服务更新完成!"
}

# 帮助信息
show_help() {
    cat << EOF
AI Education Platform - Docker 部署脚本

用法: $0 <命令> [选项]

命令:
  start             启动所有服务
  stop              停止所有服务
  restart           重启所有服务
  down              停止并删除所有容器
  logs [服务名]     查看日志(不指定服务则查看所有)
  status            查看服务状态
  build             构建并启动服务
  update            更新服务(拉取代码、备份数据库、重新构建)
  backup            备份数据库
  cleanup           清理所有 Docker 资源
  help              显示帮助信息

服务名:
  server            后端服务
  admin             管理后台
  student           学生端
  mysql             数据库
  redis             缓存
  nginx             网关

环境变量:
  ENV_FILE          环境配置文件路径 (默认: .env)

示例:
  $0 start                    # 启动所有服务
  $0 start server             # 只启动后端服务
  $0 logs server              # 查看后端日志
  $0 restart                  # 重启所有服务
  $0 build                    # 构建并启动服务
  $0 update                   # 更新服务
  ENV_FILE=.env.prod $0 start # 使用生产环境配置启动

EOF
}

# 主函数
main() {
    case "${1:-}" in
        start)
            shift
            start_services "$@"
            ;;
        stop)
            shift
            stop_services "$@"
            ;;
        restart)
            shift
            restart_services "$@"
            ;;
        down)
            shift
            down_services "$@"
            ;;
        logs)
            shift
            show_logs "$@"
            ;;
        status|ps)
            show_status
            ;;
        build)
            shift
            build_and_start "$@"
            ;;
        update)
            shift
            update_services "$@"
            ;;
        backup)
            backup_database
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
