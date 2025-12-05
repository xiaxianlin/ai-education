#!/bin/bash

###############################################################################
# AI Education Platform - 前端部署脚本
# 功能: 构建前端项目并通过 SSH 上传到服务器
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 配置文件路径
DEPLOY_CONFIG="${DEPLOY_CONFIG:-.deploy.conf}"

# 默认配置
SSH_HOST=""
SSH_PORT="22"
SSH_USER=""
SSH_KEY=""
REMOTE_PATH=""
BACKUP_ENABLED="true"
BACKUP_COUNT="5"

# 加载配置文件
load_config() {
    if [ -f "$DEPLOY_CONFIG" ]; then
        log_info "加载配置文件: $DEPLOY_CONFIG"
        source "$DEPLOY_CONFIG"
        log_success "配置文件加载成功"
    else
        log_warn "未找到配置文件: $DEPLOY_CONFIG"
        log_info "将使用交互式配置或环境变量"
    fi
}

# 检查必要的工具
check_requirements() {
    log_step "检查必要的工具..."

    local missing_tools=()

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi

    # 检查 npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi

    # 检查 ssh
    if ! command -v ssh &> /dev/null; then
        missing_tools+=("ssh")
    fi

    # 检查 rsync
    if ! command -v rsync &> /dev/null; then
        log_warn "rsync 未安装，将使用 scp 上传（速度较慢）"
    fi

    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "缺少必要的工具: ${missing_tools[*]}"
        log_info "请先安装这些工具"
        exit 1
    fi

    log_success "工具检查通过"
}

# 交互式获取配置
interactive_config() {
    log_step "配置部署参数..."
    echo ""

    # SSH 主机
    if [ -z "$SSH_HOST" ]; then
        read -p "请输入服务器地址: " SSH_HOST
    else
        log_info "服务器地址: $SSH_HOST"
    fi

    # SSH 端口
    read -p "请输入 SSH 端口 [默认: 22]: " input_port
    SSH_PORT="${input_port:-$SSH_PORT}"

    # SSH 用户
    if [ -z "$SSH_USER" ]; then
        read -p "请输入 SSH 用户名: " SSH_USER
    else
        log_info "SSH 用户: $SSH_USER"
    fi

    # SSH 密钥
    read -p "请输入 SSH 密钥路径 [留空使用密码]: " input_key
    if [ -n "$input_key" ]; then
        SSH_KEY="$input_key"
    fi

    # 远程路径
    if [ -z "$REMOTE_PATH" ]; then
        read -p "请输入远程部署路径: " REMOTE_PATH
    else
        log_info "远程路径: $REMOTE_PATH"
    fi

    echo ""
}

# 构建前端项目
build_frontend() {
    local project=$1
    local project_path="$PROJECT_ROOT/$project"

    log_step "=========================================="
    log_step "开始构建 $project 项目"
    log_step "=========================================="

    # 检查项目目录
    if [ ! -d "$project_path" ]; then
        log_error "项目目录不存在: $project_path"
        return 1
    fi

    cd "$project_path"

    # 检查 package.json
    if [ ! -f "package.json" ]; then
        log_error "未找到 package.json"
        return 1
    fi

    # 安装依赖
    log_info "安装依赖..."
    if [ -f "package-lock.json" ]; then
        npm ci --registry=https://registry.npmmirror.com
    else
        npm install --registry=https://registry.npmmirror.com
    fi

    # 构建项目
    log_info "构建项目..."
    npm run build

    # 检查构建产物
    if [ ! -d "dist" ]; then
        log_error "构建失败: dist 目录不存在"
        return 1
    fi

    log_success "$project 构建完成"
    cd "$PROJECT_ROOT"
}

# 压缩构建产物
compress_dist() {
    local project=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local dist_path="$PROJECT_ROOT/$project/dist"
    local archive_name="${project}_${timestamp}.tar.gz"
    local archive_path="$PROJECT_ROOT/$archive_name"

    log_step "压缩构建产物..."

    cd "$PROJECT_ROOT/$project"
    tar -czf "$archive_path" dist/

    log_success "压缩完成: $archive_name"
    echo "$archive_path"
}

# 测试 SSH 连接
test_ssh_connection() {
    log_step "测试 SSH 连接..."

    local ssh_cmd="ssh -p $SSH_PORT"

    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="$ssh_cmd -i $SSH_KEY"
    fi

    if $ssh_cmd "$SSH_USER@$SSH_HOST" "echo 'SSH连接成功'" &> /dev/null; then
        log_success "SSH 连接测试通过"
        return 0
    else
        log_error "SSH 连接失败"
        log_info "请检查服务器地址、用户名、密钥等配置"
        return 1
    fi
}

# 备份远程文件
backup_remote() {
    local project=$1
    local remote_project_path="$REMOTE_PATH/$project"

    if [ "$BACKUP_ENABLED" != "true" ]; then
        return 0
    fi

    log_step "备份远程文件..."

    local ssh_cmd="ssh -p $SSH_PORT"
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="$ssh_cmd -i $SSH_KEY"
    fi

    # 检查远程目录是否存在
    if $ssh_cmd "$SSH_USER@$SSH_HOST" "[ -d $remote_project_path/dist ]" 2>/dev/null; then
        local backup_name="dist.backup.$(date +%Y%m%d_%H%M%S)"

        $ssh_cmd "$SSH_USER@$SSH_HOST" << EOF
cd $remote_project_path
if [ -d dist ]; then
    mv dist $backup_name
    echo "已备份到: $backup_name"

    # 清理旧备份，只保留最近N个
    ls -dt dist.backup.* 2>/dev/null | tail -n +$((BACKUP_COUNT + 1)) | xargs -r rm -rf
fi
EOF
        log_success "远程备份完成"
    else
        log_info "远程目录不存在，跳过备份"
    fi
}

# 上传到服务器
upload_to_server() {
    local archive_path=$1
    local project=$2

    log_step "上传到服务器..."

    local scp_cmd="scp -P $SSH_PORT"
    if [ -n "$SSH_KEY" ]; then
        scp_cmd="$scp_cmd -i $SSH_KEY"
    fi

    # 上传压缩包
    $scp_cmd "$archive_path" "$SSH_USER@$SSH_HOST:/tmp/"

    local archive_name=$(basename "$archive_path")
    log_success "上传完成"

    # 在服务器上解压
    log_step "在服务器上解压..."

    local ssh_cmd="ssh -p $SSH_PORT"
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="$ssh_cmd -i $SSH_KEY"
    fi

    $ssh_cmd "$SSH_USER@$SSH_HOST" << EOF
set -e
cd $REMOTE_PATH

# 创建项目目录
mkdir -p $project

# 解压文件
cd $project
tar -xzf /tmp/$archive_name

# 清理临时文件
rm /tmp/$archive_name

echo "解压完成"
EOF

    log_success "部署完成"
}

# 使用 rsync 同步（更快）
rsync_to_server() {
    local project=$1
    local dist_path="$PROJECT_ROOT/$project/dist/"
    local remote_project_path="$REMOTE_PATH/$project/"

    log_step "使用 rsync 同步到服务器..."

    local rsync_cmd="rsync -avz --delete -e \"ssh -p $SSH_PORT"

    if [ -n "$SSH_KEY" ]; then
        rsync_cmd="$rsync_cmd -i $SSH_KEY"
    fi

    rsync_cmd="$rsync_cmd\""

    # 执行 rsync
    eval "$rsync_cmd $dist_path $SSH_USER@$SSH_HOST:$remote_project_path"

    log_success "rsync 同步完成"
}

# 重启服务（可选）
restart_service() {
    local service=$1

    log_step "重启服务: $service..."

    local ssh_cmd="ssh -p $SSH_PORT"
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="$ssh_cmd -i $SSH_KEY"
    fi

    $ssh_cmd "$SSH_USER@$SSH_HOST" << EOF
if command -v systemctl &> /dev/null; then
    sudo systemctl restart $service || echo "重启服务失败，可能需要手动重启"
elif command -v service &> /dev/null; then
    sudo service $service restart || echo "重启服务失败，可能需要手动重启"
else
    echo "未找到服务管理命令，请手动重启服务"
fi
EOF
}

# 清理本地临时文件
cleanup() {
    log_step "清理临时文件..."

    # 删除压缩包
    find "$PROJECT_ROOT" -maxdepth 1 -name "*.tar.gz" -type f -delete

    log_success "清理完成"
}

# 部署单个项目
deploy_project() {
    local project=$1
    local use_rsync=${2:-false}

    log_info "=========================================="
    log_info "开始部署 $project"
    log_info "=========================================="

    # 构建项目
    if ! build_frontend "$project"; then
        log_error "$project 构建失败"
        return 1
    fi

    # 备份远程文件
    backup_remote "$project"

    # 上传
    if [ "$use_rsync" = "true" ] && command -v rsync &> /dev/null; then
        rsync_to_server "$project"
    else
        # 压缩
        local archive_path=$(compress_dist "$project")

        # 上传并解压
        upload_to_server "$archive_path" "$project"
    fi

    log_success "=========================================="
    log_success "$project 部署成功!"
    log_success "=========================================="
}

# 显示帮助信息
show_help() {
    cat << EOF
AI Education Platform - 前端部署脚本

用法: $0 [选项] <项目名>

项目名:
  admin-web         部署管理后台
  student-web       部署学生端
  all               部署所有前端项目

选项:
  -h, --host        SSH 主机地址
  -p, --port        SSH 端口 (默认: 22)
  -u, --user        SSH 用户名
  -k, --key         SSH 密钥路径
  -r, --remote      远程部署路径
  --rsync           使用 rsync 同步 (更快)
  --no-backup       不备份远程文件
  --restart         部署后重启 nginx
  --help            显示帮助信息

环境变量:
  DEPLOY_CONFIG     配置文件路径 (默认: .deploy.conf)
  SSH_HOST          SSH 主机地址
  SSH_PORT          SSH 端口
  SSH_USER          SSH 用户名
  SSH_KEY           SSH 密钥路径
  REMOTE_PATH       远程部署路径

配置文件示例 (.deploy.conf):
  SSH_HOST="your.server.com"
  SSH_PORT="22"
  SSH_USER="deploy"
  SSH_KEY="~/.ssh/id_rsa"
  REMOTE_PATH="/var/www/html"
  BACKUP_ENABLED="true"
  BACKUP_COUNT="5"

示例:
  # 使用配置文件部署管理后台
  $0 admin

  # 使用命令行参数部署
  $0 -h server.com -u deploy -r /var/www/html admin

  # 使用 rsync 部署所有项目
  $0 --rsync all

  # 部署并重启 nginx
  $0 --restart nginx admin

EOF
}

# 主函数
main() {
    local project=""
    local use_rsync=false
    local restart_nginx=false

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--host)
                SSH_HOST="$2"
                shift 2
                ;;
            -p|--port)
                SSH_PORT="$2"
                shift 2
                ;;
            -u|--user)
                SSH_USER="$2"
                shift 2
                ;;
            -k|--key)
                SSH_KEY="$2"
                shift 2
                ;;
            -r|--remote)
                REMOTE_PATH="$2"
                shift 2
                ;;
            --rsync)
                use_rsync=true
                shift
                ;;
            --no-backup)
                BACKUP_ENABLED="false"
                shift
                ;;
            --restart)
                restart_nginx=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            admin-web|student-web|all)
                project="$1"
                shift
                ;;
            *)
                log_error "未知参数: $1"
                echo ""
                show_help
                exit 1
                ;;
        esac
    done

    # 检查项目名
    if [ -z "$project" ]; then
        log_error "请指定要部署的项目: admin-web, student-web, all"
        echo ""
        show_help
        exit 1
    fi

    # 加载配置
    load_config

    # 检查必要工具
    check_requirements

    # 如果缺少配置，进入交互式配置
    if [ -z "$SSH_HOST" ] || [ -z "$SSH_USER" ] || [ -z "$REMOTE_PATH" ]; then
        interactive_config
    fi

    # 测试 SSH 连接
    if ! test_ssh_connection; then
        exit 1
    fi

    # 部署项目
    case $project in
        admin-web)
            deploy_project "admin-web" "$use_rsync"
            ;;
        student-web)
            deploy_project "student-web" "$use_rsync"
            ;;
        all)
            deploy_project "admin-web" "$use_rsync"
            deploy_project "student-web" "$use_rsync"
            ;;
    esac

    # 重启 nginx
    if [ "$restart_nginx" = true ]; then
        restart_service "nginx"
    fi

    # 清理
    cleanup

    log_success "=========================================="
    log_success "所有部署任务完成!"
    log_success "=========================================="

    # 显示访问地址
    echo ""
    log_info "访问地址:"
    if [ "$project" = "admin-web" ] || [ "$project" = "all" ]; then
        echo "  管理后台: http://$SSH_HOST/admin"
    fi
    if [ "$project" = "student-web" ] || [ "$project" = "all" ]; then
        echo "  学生端:   http://$SSH_HOST/student"
    fi
}

# 执行主函数
main "$@"
