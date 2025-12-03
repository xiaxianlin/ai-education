# 前端自动部署指南

## 功能说明

`deploy-frontend.sh` 脚本提供以下功能：

- ✅ 自动构建前端项目（admin/student）
- ✅ 压缩构建产物
- ✅ 通过 SSH 上传到服务器
- ✅ 自动备份旧版本
- ✅ 支持 rsync 快速同步
- ✅ 支持配置文件和命令行参数
- ✅ 部署后可选重启 nginx

---

## 快速开始

### 1. 准备 SSH 访问

**方式 1: 使用 SSH 密钥（推荐）**

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 将公钥复制到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-server.com

# 测试连接
ssh user@your-server.com
```

**方式 2: 使用密码**

直接使用密码登录，脚本会提示输入密码。

### 2. 配置部署参数

**方式 1: 使用配置文件（推荐）**

```bash
# 复制配置模板
cp .deploy.conf.example .deploy.conf

# 编辑配置文件
vim .deploy.conf
```

配置示例：
```bash
SSH_HOST="47.96.105.206"
SSH_PORT="22"
SSH_USER="root"
SSH_KEY="~/.ssh/id_rsa"
REMOTE_PATH="/var/www/html"
BACKUP_ENABLED="true"
BACKUP_COUNT="5"
```

**方式 2: 使用命令行参数**

直接在命令中指定参数（见下方示例）。

**方式 3: 交互式配置**

如果没有配置文件，脚本会自动进入交互式配置。

### 3. 执行部署

```bash
# 部署管理后台
./scripts/deploy-frontend.sh admin

# 部署学生端
./scripts/deploy-frontend.sh student

# 部署所有前端项目
./scripts/deploy-frontend.sh all
```

---

## 使用方法

### 基本命令

```bash
# 语法
./scripts/deploy-frontend.sh [选项] <项目名>

# 项目名
admin      # 管理后台
student    # 学生端
all        # 所有前端项目
```

### 命令行选项

```bash
-h, --host <地址>        SSH 主机地址
-p, --port <端口>        SSH 端口（默认: 22）
-u, --user <用户名>      SSH 用户名
-k, --key <密钥路径>     SSH 私钥路径
-r, --remote <路径>      远程部署路径
--rsync                 使用 rsync 同步（更快）
--no-backup            不备份旧版本
--restart              部署后重启 nginx
--help                 显示帮助信息
```

---

## 使用示例

### 示例 1: 使用配置文件部署

```bash
# 1. 配置 .deploy.conf 文件
# 2. 执行部署
./scripts/deploy-frontend.sh admin
```

### 示例 2: 使用命令行参数

```bash
./scripts/deploy-frontend.sh \
  -h 47.96.105.206 \
  -u root \
  -k ~/.ssh/id_rsa \
  -r /var/www/html \
  admin
```

### 示例 3: 使用 rsync 快速部署

```bash
# rsync 增量同步，速度更快
./scripts/deploy-frontend.sh --rsync admin
```

### 示例 4: 部署所有项目

```bash
./scripts/deploy-frontend.sh all
```

### 示例 5: 部署并重启 nginx

```bash
./scripts/deploy-frontend.sh --restart admin
```

### 示例 6: 不备份直接部署

```bash
./scripts/deploy-frontend.sh --no-backup student
```

### 示例 7: 使用环境变量

```bash
SSH_HOST="server.com" \
SSH_USER="deploy" \
REMOTE_PATH="/var/www/html" \
./scripts/deploy-frontend.sh admin
```

---

## 部署流程

脚本执行的详细步骤：

1. **检查工具** - 检查 node, npm, ssh 等工具
2. **加载配置** - 从配置文件或参数加载配置
3. **测试连接** - 测试 SSH 连接是否正常
4. **构建项目** - 执行 `npm install` 和 `npm run build`
5. **备份远程** - 备份服务器上的旧版本
6. **上传文件** - 压缩并上传到服务器
7. **解压部署** - 在服务器上解压文件
8. **重启服务** - 可选，重启 nginx
9. **清理临时文件** - 删除本地临时文件

---

## 服务器目录结构

部署后，服务器上的目录结构：

```
/var/www/html/                    # REMOTE_PATH
├── admin/
│   ├── dist/                     # 当前版本
│   ├── dist.backup.20241125_143022  # 备份1
│   └── dist.backup.20241125_142015  # 备份2
└── student/
    ├── dist/                     # 当前版本
    └── dist.backup.20241125_143030  # 备份
```

---

## 服务器配置

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 管理后台
    location /admin {
        alias /var/www/html/admin/dist;
        try_files $uri $uri/ /admin/index.html;
        index index.html;
    }

    # 学生端
    location /student {
        alias /var/www/html/student/dist;
        try_files $uri $uri/ /student/index.html;
        index index.html;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:7890;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 服务器准备

```bash
# 1. 创建部署目录
sudo mkdir -p /var/www/html
sudo chown -R $USER:$USER /var/www/html

# 2. 安装 nginx（如果还没有）
sudo apt update
sudo apt install nginx

# 3. 配置 nginx
sudo vim /etc/nginx/sites-available/default

# 4. 测试配置
sudo nginx -t

# 5. 重启 nginx
sudo systemctl restart nginx
```

---

## rsync vs scp

### 使用 rsync（推荐）

**优点:**
- 增量同步，只传输变化的文件
- 速度快，特别是更新部署
- 支持断点续传

**使用方法:**
```bash
./scripts/deploy-frontend.sh --rsync admin
```

### 使用 scp（默认）

**优点:**
- 兼容性好，所有系统都支持
- 适合首次部署

**使用方法:**
```bash
./scripts/deploy-frontend.sh admin
```

---

## 备份管理

### 备份配置

```bash
# .deploy.conf
BACKUP_ENABLED="true"    # 启用备份
BACKUP_COUNT="5"         # 保留最近5个备份
```

### 手动恢复备份

```bash
# SSH 登录服务器
ssh user@server.com

# 切换到项目目录
cd /var/www/html/admin

# 查看备份
ls -la dist.backup.*

# 恢复备份
mv dist dist.failed
mv dist.backup.20241125_143022 dist

# 重启 nginx
sudo systemctl reload nginx
```

---

## 故障排查

### 问题 1: SSH 连接失败

**错误信息:**
```
[ERROR] SSH 连接失败
```

**解决方法:**
```bash
# 1. 检查服务器地址和端口
ping your-server.com
telnet your-server.com 22

# 2. 检查 SSH 密钥
ssh -i ~/.ssh/id_rsa user@server.com

# 3. 检查密钥权限
chmod 600 ~/.ssh/id_rsa
```

### 问题 2: 构建失败

**错误信息:**
```
[ERROR] 构建失败: dist 目录不存在
```

**解决方法:**
```bash
# 1. 手动测试构建
cd admin
npm install
npm run build

# 2. 检查 Node.js 版本
node --version  # 需要 16+

# 3. 清理缓存重试
rm -rf node_modules package-lock.json
npm install
```

### 问题 3: 权限不足

**错误信息:**
```
Permission denied
```

**解决方法:**
```bash
# 方法1: 修改目录权限
ssh user@server.com
sudo chown -R $USER:$USER /var/www/html

# 方法2: 使用 sudo（不推荐）
# 修改脚本，在命令前加 sudo
```

### 问题 4: 端口被占用

**错误信息:**
```
npm ERR! port already in use
```

**解决方法:**
```bash
# 这是本地构建的问题，不影响部署
# 停止本地开发服务器后重试
```

---

## 安全建议

### 1. 使用 SSH 密钥

```bash
# 生成专用部署密钥
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key

# 限制密钥权限
chmod 600 ~/.ssh/deploy_key

# 配置使用
SSH_KEY="~/.ssh/deploy_key"
```

### 2. 使用专用部署账号

```bash
# 在服务器上创建部署用户
sudo useradd -m -s /bin/bash deploy
sudo mkdir -p /home/deploy/.ssh
sudo chown -R deploy:deploy /home/deploy/.ssh

# 设置目录权限
sudo chown -R deploy:deploy /var/www/html
```

### 3. 限制 SSH 访问

```bash
# /etc/ssh/sshd_config
AllowUsers deploy                  # 只允许特定用户
PasswordAuthentication no          # 禁用密码登录
PubkeyAuthentication yes           # 只允许密钥登录
```

### 4. 使用 .gitignore

```bash
# .gitignore
.deploy.conf      # 不要提交配置文件到 git
*.tar.gz          # 不要提交构建产物
```

---

## 高级用法

### 自定义构建命令

修改脚本中的构建函数：

```bash
# scripts/deploy-frontend.sh

build_frontend() {
    # ... 原有代码 ...

    # 自定义构建命令
    npm run build:prod    # 使用生产环境构建
    # 或
    npm run build -- --mode production
}
```

### 部署后钩子

```bash
# .deploy.conf

# 部署后执行的命令
POST_DEPLOY_CMD="sudo systemctl reload nginx && echo '部署完成' | mail -s 'Deploy Success' admin@example.com"
```

### 多环境部署

```bash
# .deploy.conf.staging
SSH_HOST="staging.server.com"
REMOTE_PATH="/var/www/staging"

# .deploy.conf.production
SSH_HOST="prod.server.com"
REMOTE_PATH="/var/www/production"

# 使用
DEPLOY_CONFIG=.deploy.conf.staging ./scripts/deploy-frontend.sh admin
DEPLOY_CONFIG=.deploy.conf.production ./scripts/deploy-frontend.sh admin
```

---

## CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Deploy
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_USER: ${{ secrets.SSH_USER }}
          SSH_KEY: ${{ secrets.SSH_KEY }}
          REMOTE_PATH: ${{ secrets.REMOTE_PATH }}
        run: |
          # 配置 SSH 密钥
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key

          # 执行部署
          ./scripts/deploy-frontend.sh \
            -h $SSH_HOST \
            -u $SSH_USER \
            -k ~/.ssh/deploy_key \
            -r $REMOTE_PATH \
            all
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  stage: deploy
  only:
    - main
  script:
    - chmod +x scripts/deploy-frontend.sh
    - ./scripts/deploy-frontend.sh all
  variables:
    SSH_HOST: $DEPLOY_HOST
    SSH_USER: $DEPLOY_USER
    SSH_KEY: $DEPLOY_KEY
    REMOTE_PATH: $DEPLOY_PATH
```

---

## 性能优化

### 1. 使用 rsync

```bash
# rsync 比 scp 快 3-5 倍
./scripts/deploy-frontend.sh --rsync admin
```

### 2. 并行部署

```bash
# 同时部署多个项目
./scripts/deploy-frontend.sh admin &
./scripts/deploy-frontend.sh student &
wait
```

### 3. 本地缓存依赖

```bash
# 使用 npm ci 代替 npm install
# 脚本已默认使用 npm ci
```

---

## 常见问题

**Q: 如何部署到多台服务器？**

A: 创建多个配置文件，分别部署：
```bash
DEPLOY_CONFIG=.deploy.conf.server1 ./scripts/deploy-frontend.sh admin
DEPLOY_CONFIG=.deploy.conf.server2 ./scripts/deploy-frontend.sh admin
```

**Q: 如何回滚到上一个版本？**

A: SSH 登录服务器，手动恢复备份：
```bash
cd /var/www/html/admin
mv dist dist.failed
mv dist.backup.20241125_143022 dist
```

**Q: 是否支持 Windows？**

A: 支持 Git Bash 或 WSL2，不支持原生 CMD/PowerShell。

**Q: 如何部署到子目录？**

A: 修改 `REMOTE_PATH` 和 nginx 配置即可。

---

## 相关文档

- Docker 部署: `DOCKER_DEPLOYMENT.md`
- 项目 README: `README.md`
- 脚本帮助: `./scripts/deploy-frontend.sh --help`

---

**脚本路径:** `scripts/deploy-frontend.sh`
**配置文件:** `.deploy.conf`
**配置模板:** `.deploy.conf.example`
