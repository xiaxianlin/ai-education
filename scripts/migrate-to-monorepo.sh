#!/bin/bash

###############################################################################
# Monorepo 迁移脚本
# 功能: 将现有项目结构迁移到 monorepo 结构
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
log_info "开始 Monorepo 迁移"
log_info "=========================================="

# 检查是否已经迁移过
if [ -d "apps" ] && [ -d "packages" ]; then
    log_warn "检测到 apps/ 和 packages/ 目录已存在"
    read -p "是否继续迁移？(y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "迁移已取消"
        exit 0
    fi
fi

# 1. 创建新目录结构
log_info "创建新目录结构..."
mkdir -p apps
mkdir -p packages/shared-types/src
mkdir -p packages/shared-utils/src
mkdir -p packages/shared-api-client/src
mkdir -p infrastructure/mysql
mkdir -p infrastructure/nginx

# 2. 移动应用目录
log_info "移动应用目录..."

if [ -d "admin" ] && [ ! -d "apps/admin" ]; then
    mv admin apps/
    log_success "admin 已移动到 apps/"
elif [ -d "apps/admin" ]; then
    log_warn "apps/admin 已存在，跳过"
fi

if [ -d "student" ] && [ ! -d "apps/student" ]; then
    mv student apps/
    log_success "student 已移动到 apps/"
elif [ -d "apps/student" ]; then
    log_warn "apps/student 已存在，跳过"
fi

if [ -d "server" ] && [ ! -d "apps/server" ]; then
    mv server apps/
    log_success "server 已移动到 apps/"
elif [ -d "apps/server" ]; then
    log_warn "apps/server 已存在，跳过"
fi

if [ -d "mobile" ] && [ ! -d "apps/mobile" ]; then
    mv mobile apps/
    log_success "mobile 已移动到 apps/"
elif [ -d "apps/mobile" ]; then
    log_warn "apps/mobile 已存在，跳过"
fi

# 3. 移动基础设施配置
log_info "移动基础设施配置..."

if [ -d "mysql" ] && [ ! -d "infrastructure/mysql/init" ]; then
    if [ -d "mysql/init" ]; then
        mv mysql/init/* infrastructure/mysql/ 2>/dev/null || true
        rmdir mysql/init 2>/dev/null || true
    fi
    if [ -z "$(ls -A mysql 2>/dev/null)" ]; then
        rmdir mysql 2>/dev/null || true
    fi
    log_success "mysql 配置已移动到 infrastructure/"
elif [ -d "infrastructure/mysql/init" ]; then
    log_warn "infrastructure/mysql 已存在，跳过"
fi

if [ -d "nginx" ] && [ ! -f "infrastructure/nginx/default.conf" ]; then
    if [ -f "nginx/default.conf" ]; then
        mv nginx/default.conf infrastructure/nginx/ 2>/dev/null || true
    fi
    if [ -d "nginx/ssl" ]; then
        mkdir -p infrastructure/nginx/ssl
        mv nginx/ssl/* infrastructure/nginx/ssl/ 2>/dev/null || true
        rmdir nginx/ssl 2>/dev/null || true
    fi
    if [ -z "$(ls -A nginx 2>/dev/null)" ]; then
        rmdir nginx 2>/dev/null || true
    fi
    log_success "nginx 配置已移动到 infrastructure/"
elif [ -f "infrastructure/nginx/default.conf" ]; then
    log_warn "infrastructure/nginx 已存在，跳过"
fi

# 4. 创建根配置文件
log_info "创建根配置文件..."

# pnpm-workspace.yaml
if [ ! -f "pnpm-workspace.yaml" ]; then
    log_info "创建 pnpm-workspace.yaml..."
    cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
    log_success "pnpm-workspace.yaml 已创建"
else
    log_warn "pnpm-workspace.yaml 已存在，跳过"
fi

# pyproject.toml (workspace)
if [ ! -f "pyproject.toml" ]; then
    log_info "创建根 pyproject.toml..."
    cat > pyproject.toml << 'EOF'
[tool.uv]
workspace = true

[workspace]
members = [
    "apps/server"
]
exclude = []
EOF
    log_success "pyproject.toml 已创建"
else
    log_warn "pyproject.toml 已存在，跳过"
fi

# 5. 更新 Docker Compose 路径
log_info "更新 docker-compose.yml 路径..."
if [ -f "docker-compose.yml" ]; then
    # 备份原文件
    if [ ! -f "docker-compose.yml.bak" ]; then
        cp docker-compose.yml docker-compose.yml.bak
        log_info "已备份 docker-compose.yml"
    fi
    
    # 使用 sed 更新路径（macOS 和 Linux 兼容）
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's|context: ./server|context: ./apps/server|g' docker-compose.yml
        sed -i '' 's|context: ./admin|context: ./apps/admin|g' docker-compose.yml
        sed -i '' 's|context: ./student|context: ./apps/student|g' docker-compose.yml
        sed -i '' 's|./mysql/init|./infrastructure/mysql/init|g' docker-compose.yml
        sed -i '' 's|./nginx/|./infrastructure/nginx/|g' docker-compose.yml
    else
        sed -i 's|context: ./server|context: ./apps/server|g' docker-compose.yml
        sed -i 's|context: ./admin|context: ./apps/admin|g' docker-compose.yml
        sed -i 's|context: ./student|context: ./apps/student|g' docker-compose.yml
        sed -i 's|./mysql/init|./infrastructure/mysql/init|g' docker-compose.yml
        sed -i 's|./nginx/|./infrastructure/nginx/|g' docker-compose.yml
    fi
    log_success "docker-compose.yml 路径已更新"
else
    log_warn "docker-compose.yml 不存在，跳过"
fi

# 6. 更新脚本路径
log_info "更新脚本中的路径引用..."
if [ -d "scripts" ]; then
    find scripts/ -type f -name "*.sh" | while read -r file; do
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's|\./server|./apps/server|g' "$file"
            sed -i '' 's|\./admin|./apps/admin|g' "$file"
            sed -i '' 's|\./student|./apps/student|g' "$file"
        else
            sed -i 's|\./server|./apps/server|g' "$file"
            sed -i 's|\./admin|./apps/admin|g' "$file"
            sed -i 's|\./student|./apps/student|g' "$file"
        fi
    done
    log_success "脚本路径已更新"
else
    log_warn "scripts 目录不存在，跳过"
fi

log_success "=========================================="
log_success "迁移完成！"
log_success "=========================================="
log_info ""
log_info "下一步操作："
log_info "1. 检查并更新所有配置文件"
log_info "2. 创建根目录 package.json 和 turbo.json（参考 docs/MONOREPO_MIGRATION.md）"
log_info "3. 运行 pnpm install 安装依赖"
log_info "4. 运行 cd apps/server && uv sync 安装 Python 依赖"
log_info "5. 测试各个应用是否正常运行"
log_info ""
log_info "详细迁移指南请查看: docs/MONOREPO_MIGRATION.md"

