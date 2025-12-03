# 前端部署 - 快速指南

## 🚀 5分钟快速部署

### 步骤 1: 配置服务器访问

```bash
# 复制配置模板
cp .deploy.conf.example .deploy.conf

# 编辑配置（填入你的服务器信息）
vim .deploy.conf
```

配置示例：
```bash
SSH_HOST="47.96.105.206"        # 你的服务器IP
SSH_USER="root"                 # SSH用户名
SSH_KEY="~/.ssh/id_rsa"        # SSH密钥路径
REMOTE_PATH="/var/www/html"     # 部署目录
```

### 步骤 2: 执行部署

```bash
# 部署管理后台
./scripts/deploy-frontend.sh admin

# 或部署学生端
./scripts/deploy-frontend.sh student

# 或部署所有
./scripts/deploy-frontend.sh all
```

### 步骤 3: 访问应用

```
管理后台: http://你的服务器IP/admin
学生端:   http://你的服务器IP/student
```

---

## 📋 命令速查

```bash
# 基本部署
./scripts/deploy-frontend.sh admin              # 部署管理后台
./scripts/deploy-frontend.sh student            # 部署学生端
./scripts/deploy-frontend.sh all                # 部署所有

# 快速部署（使用 rsync）
./scripts/deploy-frontend.sh --rsync admin      # 增量同步，更快

# 部署并重启 nginx
./scripts/deploy-frontend.sh --restart admin

# 不备份直接部署
./scripts/deploy-frontend.sh --no-backup admin

# 使用命令行参数
./scripts/deploy-frontend.sh \
  -h server.com \
  -u deploy \
  -r /var/www/html \
  admin
```

---

## 🔧 服务器配置

### Nginx 配置

```bash
# 编辑 nginx 配置
sudo vim /etc/nginx/sites-available/default
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 管理后台
    location /admin {
        alias /var/www/html/admin/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # 学生端
    location /student {
        alias /var/www/html/student/dist;
        try_files $uri $uri/ /student/index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:7890;
        proxy_set_header Host $host;
    }
}
```

重启 nginx：
```bash
sudo nginx -t                    # 测试配置
sudo systemctl restart nginx     # 重启服务
```

---

## 🛠️ 常用场景

### 场景 1: 首次部署

```bash
# 1. 配置 .deploy.conf
# 2. 部署所有项目
./scripts/deploy-frontend.sh all
```

### 场景 2: 快速更新

```bash
# 使用 rsync 增量同步
./scripts/deploy-frontend.sh --rsync admin
```

### 场景 3: 生产部署

```bash
# 部署并重启 nginx
./scripts/deploy-frontend.sh --restart all
```

### 场景 4: 多服务器部署

```bash
# 服务器1
DEPLOY_CONFIG=.deploy.conf.server1 ./scripts/deploy-frontend.sh admin

# 服务器2
DEPLOY_CONFIG=.deploy.conf.server2 ./scripts/deploy-frontend.sh admin
```

---

## 🆘 常见问题

### SSH 连接失败？

```bash
# 测试 SSH 连接
ssh -i ~/.ssh/id_rsa user@your-server.com

# 检查密钥权限
chmod 600 ~/.ssh/id_rsa
```

### 构建失败？

```bash
# 手动测试构建
cd admin
npm install
npm run build
```

### 权限不足？

```bash
# 修改服务器目录权限
ssh user@server.com
sudo chown -R $USER:$USER /var/www/html
```

### 如何回滚？

```bash
# SSH 登录服务器
ssh user@server.com
cd /var/www/html/admin

# 查看备份
ls -la dist.backup.*

# 恢复备份
mv dist dist.failed
mv dist.backup.20241125_143022 dist
sudo systemctl reload nginx
```

---

## 📚 完整文档

详细文档请查看: **[DEPLOY_FRONTEND.md](DEPLOY_FRONTEND.md)**

内容包括：
- 详细配置说明
- 高级用法
- CI/CD 集成
- 安全建议
- 故障排查
- 性能优化

---

## ✅ 检查清单

部署前检查：
- [ ] 已配置 .deploy.conf 文件
- [ ] SSH 连接测试通过
- [ ] 服务器目录权限正确
- [ ] Nginx 配置已更新
- [ ] 本地项目可以正常构建

---

**脚本位置:** `scripts/deploy-frontend.sh`
**配置文件:** `.deploy.conf`
**帮助命令:** `./scripts/deploy-frontend.sh --help`
