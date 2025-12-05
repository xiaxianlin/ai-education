# AI Education Platform - Monorepo 迁移方案

## 目录

- [一、目标架构](#一目标架构)
- [二、配置文件](#二配置文件)
- [三、共享包配置](#三共享包配置)
- [四、应用配置更新](#四应用配置更新)
- [五、Docker 配置更新](#五docker-配置更新)
- [六、迁移脚本](#六迁移脚本)
- [七、迁移步骤](#七迁移步骤)
- [八、注意事项](#八注意事项)
- [九、迁移检查清单](#九迁移检查清单)
- [十、后续优化](#十后续优化)

---

## 一、目标架构

### 新目录结构

```
ai-eduaction/
├── apps/                          # 应用目录
│   ├── admin/                     # 管理后台前端 (React + UmiJS)
│   ├── student/                   # 学生端前端 (React + Rsbuild)
│   ├── server/                    # 后端服务 (Python FastAPI)
│   └── mobile/                    # 移动应用 (Flutter)
│
├── packages/                      # 共享包目录
│   ├── shared-types/             # 共享 TypeScript 类型定义
│   ├── shared-utils/              # 共享工具函数 (TypeScript)
│   └── shared-api-client/         # 共享 API 客户端 (TypeScript)
│
├── infrastructure/                # 基础设施配置
│   ├── mysql/                     # 数据库初始化脚本
│   ├── nginx/                     # Nginx 配置
│   └── docker/                    # Docker 相关配置（可选）
│
├── scripts/                       # 脚本目录
│   ├── migrate-to-monorepo.sh     # 迁移脚本
│   ├── build.sh                   # 构建脚本
│   ├── deploy.sh                  # 部署脚本
│   └── quickstart.sh              # 快速启动脚本
│
├── docs/                          # 文档目录（保持不变）
│
├── .gitignore                     # Git 忽略配置
├── .prettierrc                    # Prettier 配置
├── .eslintrc.js                   # ESLint 配置（根目录）
├── pnpm-workspace.yaml            # pnpm workspace 配置
├── turbo.json                     # Turborepo 配置
├── package.json                   # 根 package.json
├── pyproject.toml                  # Python workspace 配置
├── docker-compose.yml             # Docker Compose 配置
└── README.md                      # 项目说明
```

### 架构优势

1. **代码共享**: 前端应用可以共享类型定义、工具函数和 API 客户端
2. **统一管理**: 所有应用和包在同一个仓库中，便于版本管理和依赖协调
3. **构建优化**: 使用 Turborepo 实现智能缓存和并行构建
4. **开发体验**: 统一的命令接口，一键启动所有服务
5. **部署简化**: Docker Compose 统一编排所有服务

---

## 二、配置文件

### 1. 根目录 `package.json`

```json
{
  "name": "ai-education-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "AI Education Platform Monorepo",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    
    "dev:admin": "pnpm --filter admin dev",
    "dev:student": "pnpm --filter student dev",
    "dev:server": "cd apps/server && uv run uvicorn main:app --reload",
    "dev:all": "concurrently \"pnpm dev:admin\" \"pnpm dev:student\" \"pnpm dev:server\"",
    
    "build:admin": "pnpm --filter admin build",
    "build:student": "pnpm --filter student build",
    "build:server": "cd apps/server && uv build",
    "build:all": "turbo run build",
    
    "install:all": "pnpm install && cd apps/server && uv sync",
    
    "docker:build": "./scripts/build.sh",
    "docker:up": "./scripts/deploy.sh start",
    "docker:down": "./scripts/deploy.sh down"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "concurrently": "^8.2.2",
    "prettier": "^3.2.5",
    "turbo": "^2.0.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

### 2. `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3. `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 4. 根目录 `pyproject.toml` (Python Workspace)

```toml
[tool.uv]
workspace = true

[workspace]
members = [
    "apps/server"
]
exclude = []

[workspace.dependencies]
# 共享依赖可以在这里定义（如果需要）
```

### 5. `.prettierrc` (根目录)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 6. `.eslintrc.js` (根目录，可选)

```javascript
module.exports = {
  root: true,
  extends: ['@umijs/fabric'],
  rules: {
    // 可以在这里添加项目级别的规则
  },
};
```

### 7. 更新 `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Production
dist/
build/
.next/
.umi/
.umi-production/
.umi-test/

# Misc
.DS_Store
*.pem
.env
.env.local
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
venv/
ENV/
uv.lock

# Flutter
mobile/.dart_tool/
mobile/.flutter-plugins
mobile/.flutter-plugins-dependencies
mobile/.packages
mobile/.pub-cache/
mobile/.pub/
mobile/build/
mobile/.ios/
mobile/.android/
mobile/*.iml
mobile/.idea/
mobile/.vscode/
mobile/*.g.dart
mobile/*.freezed.dart
mobile/.metadata

# Turborepo
.turbo/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 部署相关
.deploy.conf
*.tar.gz
backups/
tmp/
```

---

## 三、共享包配置

### 1. `packages/shared-types/package.json`

```json
{
  "name": "@ai-education/shared-types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

### 2. `packages/shared-types/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. `packages/shared-types/src/index.ts`

```typescript
// 从 admin 和 student 中提取共享类型
export * from './student';
export * from './question';
export * from './teacher-book';
export * from './textbook';
export * from './common';
```

### 4. `packages/shared-api-client/package.json`

```json
{
  "name": "@ai-education/shared-api-client",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "axios": "^1.13.1",
    "@ai-education/shared-types": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

---

## 四、应用配置更新

### 1. `apps/admin/package.json` (更新)

在现有依赖基础上添加：

```json
{
  "name": "admin",
  "version": "6.0.0",
  "private": true,
  "dependencies": {
    // ... 现有依赖保持不变 ...
    "@ai-education/shared-types": "workspace:*",
    "@ai-education/shared-api-client": "workspace:*"
  }
}
```

### 2. `apps/student/package.json` (更新)

在现有依赖基础上添加：

```json
{
  "name": "student",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    // ... 现有依赖保持不变 ...
    "@ai-education/shared-types": "workspace:*",
    "@ai-education/shared-api-client": "workspace:*"
  }
}
```

### 3. `apps/server/pyproject.toml` (更新)

```toml
[project]
name = "ai-helper-server"
version = "0.1.0"
description = "AI Education Platform Backend Server"
readme = "README.md"
requires-python = ">=3.12,<3.13"
dependencies = [
    # ... 现有依赖保持不变 ...
]

[tool.uv]
workspace = true
```

---

## 五、Docker 配置更新

### 1. 更新 `docker-compose.yml`

主要更新构建上下文路径：

```yaml
version: '3.8'

services:
  mysql:
    # ... 配置保持不变，但路径更新 ...
    volumes:
      - mysql_data:/var/lib/mysql
      - ./infrastructure/mysql/init:/docker-entrypoint-initdb.d

  redis:
    # ... 配置保持不变 ...

  server:
    build:
      context: ./apps/server
      dockerfile: Dockerfile
    # ... 其他配置保持不变 ...

  admin:
    build:
      context: ./apps/admin
      dockerfile: Dockerfile
    # ... 其他配置保持不变 ...

  student:
    build:
      context: ./apps/student
      dockerfile: Dockerfile
    # ... 其他配置保持不变 ...

  nginx:
    volumes:
      - ./infrastructure/nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl
      - nginx_logs:/var/log/nginx
    # ... 其他配置保持不变 ...

# ... networks 和 volumes 保持不变 ...
```

### 2. Dockerfile 路径说明

Dockerfile 文件保持在各自应用目录中，无需修改，只需要在 `docker-compose.yml` 中更新构建上下文路径即可。

---

## 六、迁移脚本

### `scripts/migrate-to-monorepo.sh`

```bash
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

if [ -d "admin" ]; then
    mv admin apps/
    log_success "admin 已移动到 apps/"
fi

if [ -d "student" ]; then
    mv student apps/
    log_success "student 已移动到 apps/"
fi

if [ -d "server" ]; then
    mv server apps/
    log_success "server 已移动到 apps/"
fi

if [ -d "mobile" ]; then
    mv mobile apps/
    log_success "mobile 已移动到 apps/"
fi

# 3. 移动基础设施配置
log_info "移动基础设施配置..."

if [ -d "mysql" ]; then
    mv mysql/* infrastructure/mysql/ 2>/dev/null || true
    rmdir mysql 2>/dev/null || true
    log_success "mysql 配置已移动到 infrastructure/"
fi

if [ -d "nginx" ]; then
    mv nginx/* infrastructure/nginx/ 2>/dev/null || true
    rmdir nginx 2>/dev/null || true
    log_success "nginx 配置已移动到 infrastructure/"
fi

# 4. 创建根配置文件
log_info "创建根配置文件..."

# pnpm-workspace.yaml
if [ ! -f "pnpm-workspace.yaml" ]; then
    log_info "创建 pnpm-workspace.yaml..."
    cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF
    log_success "pnpm-workspace.yaml 已创建"
fi

# pyproject.toml (workspace)
if [ ! -f "pyproject.toml" ]; then
    log_info "创建根 pyproject.toml..."
    cat > pyproject.toml << EOF
[tool.uv]
workspace = true

[workspace]
members = [
    "apps/server"
]
exclude = []
EOF
    log_success "pyproject.toml 已创建"
fi

# 5. 更新 Docker Compose 路径
log_info "更新 docker-compose.yml 路径..."
if [ -f "docker-compose.yml" ]; then
    # 备份原文件
    cp docker-compose.yml docker-compose.yml.bak
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
fi

# 6. 更新脚本路径
log_info "更新脚本中的路径引用..."
find scripts/ -type f -name "*.sh" -exec sed -i.bak 's|\./server|./apps/server|g' {} \;
find scripts/ -type f -name "*.sh" -exec sed -i.bak 's|\./admin|./apps/admin|g' {} \;
find scripts/ -type f -name "*.sh" -exec sed -i.bak 's|\./student|./apps/student|g' {} \;
log_success "脚本路径已更新"

log_success "=========================================="
log_success "迁移完成！"
log_success "=========================================="
log_info "下一步："
log_info "1. 检查并更新所有配置文件"
log_info "2. 创建根目录 package.json 和 turbo.json"
log_info "3. 运行 pnpm install 安装依赖"
log_info "4. 运行 cd apps/server && uv sync 安装 Python 依赖"
log_info "5. 测试各个应用是否正常运行"
```

---

## 七、迁移步骤

### 阶段 1: 准备工作

1. **创建备份分支**
```bash
git checkout -b backup-before-monorepo
git push origin backup-before-monorepo
git checkout main
```

2. **确保所有更改已提交**
```bash
git status
git add .
git commit -m "chore: prepare for monorepo migration"
```

### 阶段 2: 执行迁移

1. **运行迁移脚本**
```bash
chmod +x scripts/migrate-to-monorepo.sh
./scripts/migrate-to-monorepo.sh
```

2. **手动创建根配置文件**
   - 创建根目录 `package.json`（参考上面的模板）
   - 创建 `turbo.json`（参考上面的模板）
   - 创建 `.prettierrc`（参考上面的模板）

3. **创建共享包基础结构**
```bash
# 创建共享类型包
mkdir -p packages/shared-types/src
touch packages/shared-types/src/index.ts
# 创建 package.json 和 tsconfig.json（参考上面的模板）

# 创建共享工具包
mkdir -p packages/shared-utils/src
touch packages/shared-utils/src/index.ts
# 创建 package.json（参考上面的模板）

# 创建共享 API 客户端包
mkdir -p packages/shared-api-client/src
touch packages/shared-api-client/src/index.ts
# 创建 package.json（参考上面的模板）
```

### 阶段 3: 更新配置

1. **更新应用 package.json**
   - 在 `apps/admin/package.json` 中添加共享包依赖
   - 在 `apps/student/package.json` 中添加共享包依赖

2. **更新 TypeScript 配置**
   - 检查 `apps/admin/tsconfig.json` 路径别名
   - 检查 `apps/student/tsconfig.json` 路径别名

3. **更新 Docker 配置**
   - 验证 `docker-compose.yml` 中的路径
   - 验证各应用的 Dockerfile

### 阶段 4: 安装依赖

```bash
# 安装 Node.js 依赖
pnpm install

# 安装 Python 依赖
cd apps/server
uv sync
cd ../..
```

### 阶段 5: 测试验证

1. **测试前端应用**
```bash
pnpm dev:admin    # 测试管理后台
pnpm dev:student  # 测试学生端
```

2. **测试后端服务**
```bash
pnpm dev:server   # 测试 API 服务
```

3. **测试 Docker 构建**
```bash
pnpm docker:build
```

### 阶段 6: 逐步迁移共享代码

1. **提取共享类型**
   - 从 `apps/admin/types/` 和 `apps/student/src/types/` 提取共享类型
   - 移动到 `packages/shared-types/src/`

2. **提取共享工具**
   - 从两个前端应用中提取共享工具函数
   - 移动到 `packages/shared-utils/src/`

3. **提取 API 客户端**
   - 统一 API 调用逻辑
   - 移动到 `packages/shared-api-client/src/`

4. **更新导入路径**
   - 在所有应用中更新 import 语句
   - 使用 `@ai-education/shared-*` 包

---

## 八、注意事项

### 1. 路径引用更新

需要检查并更新以下位置的路径：

- ✅ 脚本文件中的路径引用
- ✅ 文档中的路径引用
- ✅ CI/CD 配置中的路径
- ✅ 环境变量配置
- ✅ README 文件中的路径说明

### 2. Git 历史

如果需要保留 Git 历史，可以使用以下方法：

```bash
# 方法 1: 使用 git filter-branch（不推荐，性能差）
git filter-branch --tree-filter '
    mkdir -p apps
    git mv admin apps/ 2>/dev/null || true
    git mv student apps/ 2>/dev/null || true
    git mv server apps/ 2>/dev/null || true
    git mv mobile apps/ 2>/dev/null || true
' --prune-empty HEAD

# 方法 2: 使用 git filter-repo（推荐，性能好）
# 需要先安装: pip install git-filter-repo
git filter-repo --path admin --path student --path server --path mobile \
    --to-subdirectory-filter apps/
```

**注意**: 如果项目历史不重要，可以直接移动文件，这样更简单。

### 3. 依赖管理

- **前端依赖**: 使用 pnpm workspace，所有前端项目共享 node_modules
- **Python 依赖**: 使用 uv workspace，server 项目独立管理
- **Flutter 依赖**: 保持独立管理，不纳入 workspace

### 4. 构建顺序

使用 Turborepo 时，构建顺序会自动处理：
1. 先构建共享包（`packages/*`）
2. 再构建依赖共享包的应用（`apps/*`）

### 5. 开发体验

- 使用 `pnpm dev:all` 同时启动所有服务
- 使用 `pnpm build` 构建所有项目
- 使用 `pnpm lint` 检查所有代码
- 使用 `pnpm format` 格式化所有代码

### 6. 性能优化

- Turborepo 会自动缓存构建结果
- 只构建变更的包，未变更的包使用缓存
- 支持远程缓存（需要配置）

---

## 九、迁移检查清单

### 准备阶段
- [ ] 创建备份分支
- [ ] 提交所有当前更改
- [ ] 备份重要数据

### 迁移阶段
- [ ] 执行目录迁移脚本
- [ ] 创建根配置文件（package.json, turbo.json, .prettierrc）
- [ ] 创建 pnpm-workspace.yaml
- [ ] 创建根 pyproject.toml
- [ ] 更新 .gitignore
- [ ] 更新 docker-compose.yml 路径
- [ ] 更新脚本文件中的路径引用

### 配置阶段
- [ ] 创建共享包基础结构
- [ ] 更新 apps/admin/package.json
- [ ] 更新 apps/student/package.json
- [ ] 更新 apps/server/pyproject.toml
- [ ] 检查 TypeScript 配置
- [ ] 检查 Dockerfile 配置

### 安装和测试
- [ ] 运行 pnpm install
- [ ] 运行 cd apps/server && uv sync
- [ ] 测试 pnpm dev:admin
- [ ] 测试 pnpm dev:student
- [ ] 测试 pnpm dev:server
- [ ] 测试 pnpm build
- [ ] 测试 Docker 构建

### 代码迁移
- [ ] 提取共享类型到 packages/shared-types
- [ ] 提取共享工具到 packages/shared-utils
- [ ] 提取 API 客户端到 packages/shared-api-client
- [ ] 更新所有 import 路径
- [ ] 验证类型检查通过

### 文档和清理
- [ ] 更新 README.md
- [ ] 更新所有文档中的路径引用
- [ ] 清理临时文件
- [ ] 提交迁移更改

---

## 十、后续优化

### 1. CI/CD 配置

添加 GitHub Actions 或 GitLab CI 配置，使用 Turborepo 缓存：

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
```

### 2. 代码质量检查

- 统一 ESLint 配置
- 统一 Prettier 配置
- 添加 pre-commit hooks（使用 husky）
- 添加 TypeScript 严格模式检查

### 3. 测试框架

- 前端单元测试（Jest / Vitest）
- 后端单元测试（pytest）
- E2E 测试（Playwright / Cypress）

### 4. 性能优化

- 配置 Turborepo 远程缓存
- 优化构建流程
- 并行执行任务
- 增量构建

### 5. 监控和日志

- 统一的日志格式
- 错误追踪（Sentry）
- 性能监控
- 构建时间分析

---

## 常见问题

### Q1: 迁移后 Git 历史会丢失吗？

**A**: 如果直接移动文件，Git 会识别为删除和新增。如果需要保留历史，可以使用 `git filter-repo` 工具。

### Q2: 如何回滚迁移？

**A**: 如果创建了备份分支，可以切换回备份分支。或者使用 Git 回退到迁移前的提交。

### Q3: Flutter 项目如何集成？

**A**: Flutter 项目保持独立管理，不纳入 pnpm workspace。可以放在 `apps/mobile/` 目录下，但依赖管理仍然使用 `pub`。

### Q4: Python worker 如何添加？

**A**: 在 `apps/` 目录下创建 `worker/` 目录，在根 `pyproject.toml` 的 `workspace.members` 中添加 `apps/worker`。

### Q5: 共享包如何版本管理？

**A**: 使用 `workspace:*` 协议，所有包使用相同版本。如果需要独立版本，可以修改为具体版本号。

---

## 参考资源

- [Turborepo 文档](https://turbo.build/repo/docs)
- [pnpm Workspace 文档](https://pnpm.io/workspaces)
- [uv Workspace 文档](https://github.com/astral-sh/uv)
- [Monorepo 最佳实践](https://monorepo.tools/)

---

**最后更新**: 2024-01-XX
**维护者**: AI Education Platform Team

