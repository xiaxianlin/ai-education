# AI Education Platform - Docker 部署指南

## 目录

- [项目架构](#项目架构)
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [常用命令](#常用命令)
- [生产环境部署](#生产环境部署)
- [故障排查](#故障排查)
- [性能优化](#性能优化)

## 项目架构

```
ai-eduaction/
├── server/              # Python FastAPI 后端服务
├── admin/               # React + Ant Design Pro 管理后台
├── student/             # React + Rsbuild 学生端
├── nginx/               # Nginx 网关配置
├── scripts/             # 部署脚本
├── docker-compose.yml   # Docker Compose 配置
└── .env.example         # 环境变量模板
```

### 服务组件

| 服务 | 端口 | 说明 |
|------|------|------|
| **Nginx** | 80, 443 | 反向代理和静态资源服务器 |
| **Server** | 7890 | FastAPI 后端服务 |
| **Admin** | - | 管理后台(由 Nginx 托管) |
| **Student** | - | 学生端(由 Nginx 托管) |
| **MySQL** | 3306 | 数据库 |
| **Redis** | 6379 | 缓存服务 |

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 内存
- 10GB 可用磁盘空间

### 一键启动

```bash
# 1. 克隆项目(如果还没有)
git clone <repository-url>
cd ai-eduaction

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入真实的配置信息
vim .env

# 3. 一键启动
./scripts/quickstart.sh
```

启动成功后访问:
- 管理后台: http://localhost/admin
- 学生端: http://localhost/student
- API 文档: http://localhost/api/docs

## 详细部署步骤

### 1. 环境准备

#### 1.1 安装 Docker

**macOS:**
```bash
brew install --cask docker
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**验证安装:**
```bash
docker --version
docker-compose --version
```

#### 1.2 配置 Docker

建议调整 Docker 资源限制:
- CPU: 2核+
- 内存: 4GB+
- 磁盘: 10GB+

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
vim .env
```

**必须修改的配置项:**

```bash
# 数据库密码(强密码)
MYSQL_PASSWORD=your_strong_password
MYSQL_ROOT_PASSWORD=your_strong_root_password

# Redis 密码
REDIS_PASSWORD=your_redis_password

# 应用密钥(至少32位随机字符串)
APP_SECRET_KEY=your_random_secret_key_at_least_32_chars

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

# AI 平台配置
AI_PLATFORM_KEY=your_ai_platform_key

# 阿里云配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_BUCKET=your_bucket_name
```

### 3. 构建镜像

```bash
# 方式1: 使用构建脚本(推荐)
./scripts/build.sh

# 方式2: 使用 docker-compose
docker-compose build

# 方式3: 构建单个服务
./scripts/build.sh server   # 只构建后端
./scripts/build.sh admin    # 只构建管理后台
./scripts/build.sh student  # 只构建学生端
```

### 4. 启动服务

```bash
# 启动所有服务
./scripts/deploy.sh start

# 或使用 docker-compose
docker-compose up -d

# 查看服务状态
./scripts/deploy.sh status
```

### 5. 验证部署

```bash
# 查看所有容器状态
docker-compose ps

# 查看服务日志
./scripts/deploy.sh logs

# 查看特定服务日志
./scripts/deploy.sh logs server
./scripts/deploy.sh logs admin
```

**健康检查:**
```bash
# 检查后端服务
curl http://localhost/api/admin/health

# 检查前端服务
curl http://localhost/admin
curl http://localhost/student
```

## 配置说明

### 数据库初始化

如需自定义数据库初始化脚本，在 `mysql/init/` 目录下创建 `.sql` 文件:

```sql
-- mysql/init/01-init.sql
CREATE TABLE IF NOT EXISTS custom_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);
```

### Nginx 配置

#### 自定义域名

编辑 `nginx/default.conf`:

```nginx
# 管理后台
server {
    listen 80;
    server_name admin.yourdomain.com;
    # ...
}

# 学生端
server {
    listen 80;
    server_name student.yourdomain.com;
    # ...
}
```

#### HTTPS 配置

1. 将 SSL 证书放到 `nginx/ssl/` 目录:
```bash
nginx/ssl/
├── cert.pem
└── key.pem
```

2. 修改 `nginx/default.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ...其他配置
}
```

### 环境变量详解

| 变量名 | 说明 | 示例 | 必需 |
|--------|------|------|------|
| `RUN_ENV` | 运行环境 | production/development | 是 |
| `MYSQL_PASSWORD` | 数据库密码 | - | 是 |
| `REDIS_PASSWORD` | Redis密码 | - | 是 |
| `APP_SECRET_KEY` | 应用密钥 | 随机32位字符 | 是 |
| `ADMIN_USERNAME` | 管理员用户名 | admin | 是 |
| `ADMIN_PASSWORD` | 管理员密码 | - | 是 |
| `AI_PLATFORM_KEY` | AI平台密钥 | - | 是 |
| `CORS_ORIGINS` | 跨域白名单 | * 或域名列表 | 否 |

## 常用命令

### 部署管理

```bash
# 启动服务
./scripts/deploy.sh start

# 停止服务
./scripts/deploy.sh stop

# 重启服务
./scripts/deploy.sh restart

# 查看状态
./scripts/deploy.sh status

# 查看日志
./scripts/deploy.sh logs          # 所有服务
./scripts/deploy.sh logs server   # 特定服务

# 构建并启动
./scripts/deploy.sh build

# 更新服务(拉取代码+备份数据+重新构建)
./scripts/deploy.sh update

# 备份数据库
./scripts/deploy.sh backup

# 清理资源
./scripts/deploy.sh cleanup
```

### Docker 操作

```bash
# 进入容器
docker exec -it ai-education-server bash
docker exec -it ai-education-mysql bash

# 查看容器日志
docker logs -f ai-education-server
docker logs -f ai-education-admin

# 重启单个容器
docker restart ai-education-server

# 查看容器资源使用
docker stats
```

### 数据库操作

```bash
# 连接数据库
docker exec -it ai-education-mysql mysql -uroot -p

# 导入数据
docker exec -i ai-education-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < backup.sql

# 导出数据
docker exec ai-education-mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > backup.sql
```

## 生产环境部署

### 1. 安全加固

**修改默认端口:**
```bash
# .env
NGINX_HTTP_PORT=8080
SERVER_PORT=8890
MYSQL_PORT=33060
REDIS_PORT=63790
```

**禁用外部访问数据库:**
```yaml
# docker-compose.yml
services:
  mysql:
    # ports:
    #   - "3306:3306"  # 注释掉端口映射
```

**使用强密码:**
```bash
# 生成随机密码
openssl rand -base64 32
```

### 2. 性能优化

**调整 worker 数量:**
```dockerfile
# server/Dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7890", "--workers", "4"]
```

**启用 Redis 持久化:**
```yaml
# docker-compose.yml
redis:
  command: redis-server --appendonly yes --save 60 1000
```

**配置 Nginx 缓存:**
```nginx
# nginx/default.conf
location /api/ {
    proxy_cache_valid 200 5m;
    proxy_cache_bypass $http_cache_control;
}
```

### 3. 监控和日志

**日志轮转:**
```yaml
# docker-compose.yml
services:
  server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**健康检查:**
```bash
# 定期检查服务状态
watch -n 5 'docker-compose ps'
```

### 4. 备份策略

**定时备份数据库:**
```bash
# 添加到 crontab
0 2 * * * cd /path/to/project && ./scripts/deploy.sh backup
```

**备份持久化数据:**
```bash
# 备份 Docker volumes
docker run --rm \
  -v ai-education_mysql_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/mysql-$(date +%Y%m%d).tar.gz /data
```

## 故障排查

### 常见问题

#### 1. 容器无法启动

```bash
# 查看详细错误
docker-compose logs service_name

# 检查端口占用
lsof -i :80
lsof -i :7890

# 清理并重启
docker-compose down
docker-compose up -d
```

#### 2. 数据库连接失败

```bash
# 检查数据库是否启动
docker-compose ps mysql

# 查看数据库日志
docker-compose logs mysql

# 测试数据库连接
docker exec -it ai-education-mysql mysql -uroot -p
```

#### 3. API 请求失败

```bash
# 检查后端日志
docker-compose logs server

# 检查网络连通性
docker exec ai-education-admin curl http://server:7890/api/admin/health

# 检查环境变量
docker exec ai-education-server env | grep DATABASE
```

#### 4. 前端无法访问

```bash
# 检查 Nginx 配置
docker exec ai-education-nginx nginx -t

# 重载 Nginx 配置
docker exec ai-education-nginx nginx -s reload

# 查看 Nginx 日志
docker-compose logs nginx
```

### 性能问题

#### 1. 内存不足

```bash
# 查看内存使用
docker stats

# 限制容器内存
# docker-compose.yml
services:
  server:
    mem_limit: 2g
```

#### 2. 磁盘空间不足

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 查看磁盘使用
docker system df
```

## 更新和维护

### 版本更新

```bash
# 1. 备份数据
./scripts/deploy.sh backup

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建并启动
./scripts/deploy.sh update

# 或手动执行
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 数据迁移

```bash
# 1. 备份旧数据
./scripts/deploy.sh backup

# 2. 停止服务
./scripts/deploy.sh stop

# 3. 迁移数据
# (根据具体需求执行迁移脚本)

# 4. 启动服务
./scripts/deploy.sh start
```

## 技术支持

如有问题，请查看:
- 项目文档: `/docs`
- API 文档: http://localhost/api/docs
- 提交 Issue: <repository-url>/issues

## 许可证

请查看项目根目录的 LICENSE 文件
