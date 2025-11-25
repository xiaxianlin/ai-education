# Docker 部署文件清单

## 📋 完整文件列表

### 核心配置文件
- [x] `docker-compose.yml` - Docker Compose 主配置
- [x] `.env.example` - 环境变量模板
- [x] `.dockerignore` - Docker 构建忽略文件

### 后端服务 (Server)
- [x] `server/Dockerfile` - Python FastAPI 后端镜像
- [x] `server/.dockerignore` - 后端构建忽略文件

### 管理后台 (Admin)
- [x] `admin/Dockerfile` - React 管理后台镜像
- [x] `admin/nginx.conf` - 管理后台 Nginx 配置
- [x] `admin/.dockerignore` - 管理后台构建忽略文件

### 学生端 (Student)
- [x] `student/Dockerfile` - React 学生端镜像
- [x] `student/nginx.conf` - 学生端 Nginx 配置
- [x] `student/.dockerignore` - 学生端构建忽略文件

### Nginx 网关
- [x] `nginx/default.conf` - 主网关配置(包含路由和反向代理)

### 数据库初始化
- [x] `mysql/init/00-init.sql` - MySQL 初始化脚本
- [x] `mysql/init/README.md` - 初始化脚本说明

### 部署脚本
- [x] `scripts/quickstart.sh` - 一键启动脚本
- [x] `scripts/build.sh` - 镜像构建脚本
- [x] `scripts/deploy.sh` - 部署管理脚本

### 文档
- [x] `DOCKER_DEPLOYMENT.md` - 完整部署文档(详细)
- [x] `DOCKER_QUICK_START.md` - 快速开始指南(简洁)
- [x] `DOCKER_FILES_CHECKLIST.md` - 本文件清单

## 🎯 部署前检查清单

### 1. 环境准备
- [ ] Docker 已安装 (20.10+)
- [ ] Docker Compose 已安装 (2.0+)
- [ ] 系统资源充足 (内存 4GB+, 磁盘 10GB+)

### 2. 配置文件
- [ ] 已复制 `.env.example` 为 `.env`
- [ ] 已修改数据库密码
- [ ] 已修改 Redis 密码
- [ ] 已配置应用密钥 (32位+随机字符串)
- [ ] 已配置管理员账号
- [ ] 已配置 AI 平台密钥
- [ ] 已配置阿里云密钥
- [ ] 已配置 OSS 存储

### 3. 网络配置
- [ ] 端口 80 未被占用
- [ ] 端口 7890 未被占用
- [ ] (可选) 端口 3306 未被占用
- [ ] (可选) 端口 6379 未被占用

### 4. 域名和证书 (生产环境)
- [ ] 已配置域名解析
- [ ] 已准备 SSL 证书
- [ ] 已更新 nginx 配置为域名

## 🚀 快速部署步骤

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env

# 2. 一键启动
./scripts/quickstart.sh

# 3. 验证部署
./scripts/deploy.sh status
```

## 📊 服务架构

```
                     ┌─────────────┐
                     │   Browser   │
                     └─────┬───────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   Nginx Gateway      │
                │   (Port 80/443)      │
                └─────┬────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    ┌───────┐    ┌────────┐    ┌──────────┐
    │ Admin │    │Student │    │  Server  │
    │Frontend    │Frontend│    │  (API)   │
    └───────┘    └────────┘    └────┬─────┘
                                     │
                          ┌──────────┼──────────┐
                          │                     │
                          ▼                     ▼
                    ┌──────────┐         ┌──────────┐
                    │  MySQL   │         │  Redis   │
                    │ Database │         │  Cache   │
                    └──────────┘         └──────────┘
```

## 🛠 常用命令速查

| 操作 | 命令 |
|------|------|
| 启动服务 | `./scripts/deploy.sh start` |
| 停止服务 | `./scripts/deploy.sh stop` |
| 重启服务 | `./scripts/deploy.sh restart` |
| 查看状态 | `./scripts/deploy.sh status` |
| 查看日志 | `./scripts/deploy.sh logs [service]` |
| 构建镜像 | `./scripts/build.sh` |
| 更新服务 | `./scripts/deploy.sh update` |
| 备份数据库 | `./scripts/deploy.sh backup` |

## 📝 环境变量说明

### 必填配置

| 变量 | 说明 | 示例 |
|------|------|------|
| `MYSQL_PASSWORD` | 数据库密码 | `strong_password123` |
| `REDIS_PASSWORD` | Redis密码 | `redis_password123` |
| `APP_SECRET_KEY` | 应用密钥(32位+) | `your_random_32_chars_key` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin_password123` |
| `AI_PLATFORM_KEY` | AI平台密钥 | `sk-xxxxxxxx` |
| `ALIYUN_ACCESS_KEY_ID` | 阿里云密钥ID | `LTAI5txxxxx` |
| `ALIYUN_ACCESS_KEY_SECRET` | 阿里云密钥Secret | `xxxxxx` |
| `ALIYUN_OSS_BUCKET` | OSS存储桶 | `your-bucket` |

### 可选配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `RUN_ENV` | 运行环境 | `production` |
| `CORS_ORIGINS` | 跨域白名单 | `*` |
| `SERVER_PORT` | 后端端口 | `7890` |
| `NGINX_HTTP_PORT` | Nginx HTTP端口 | `80` |
| `NGINX_HTTPS_PORT` | Nginx HTTPS端口 | `443` |
| `MYSQL_PORT` | MySQL端口 | `3306` |
| `REDIS_PORT` | Redis端口 | `6379` |

## 🔒 生产环境安全建议

1. **修改所有默认密码**
   - 使用强密码(大小写字母+数字+特殊字符,16位+)
   - 定期更换密码

2. **配置 HTTPS**
   - 申请 SSL 证书(Let's Encrypt 免费)
   - 配置 nginx 支持 HTTPS
   - 强制 HTTP 跳转 HTTPS

3. **限制数据库访问**
   - 注释掉 docker-compose.yml 中数据库的 ports 映射
   - 只允许内部容器访问

4. **配置防火墙**
   - 只开放 80/443 端口
   - 限制 SSH 访问

5. **启用日志监控**
   - 配置日志轮转
   - 监控异常访问

## 📈 性能优化建议

1. **调整 worker 数量**
   - 根据 CPU 核心数调整后端 worker
   - 建议: `worker数 = CPU核心数 * 2 + 1`

2. **启用缓存**
   - Nginx 静态资源缓存
   - API 响应缓存
   - Redis 数据缓存

3. **资源限制**
   - 限制容器内存使用
   - 限制容器 CPU 使用

4. **数据库优化**
   - 配置连接池
   - 添加适当索引
   - 定期优化表

## 🆘 故障排查

### 容器无法启动
```bash
docker-compose logs service_name
docker-compose down && docker-compose up -d
```

### 端口冲突
```bash
lsof -i :80
# 修改 .env 文件中的端口配置
```

### 数据库连接失败
```bash
docker exec -it ai-education-mysql mysql -uroot -p
# 检查 .env 中的数据库配置
```

### 内存不足
```bash
docker stats
# 增加 Docker 内存限制或优化配置
```

## 📚 相关文档

- **快速开始**: `DOCKER_QUICK_START.md`
- **详细文档**: `DOCKER_DEPLOYMENT.md`
- **脚本帮助**: `./scripts/deploy.sh help`

## ✅ 部署完成验证

部署成功后,以下地址应该可以访问:

- [ ] http://localhost/admin (管理后台)
- [ ] http://localhost/student (学生端)
- [ ] http://localhost/api/docs (API 文档)

## 🎉 恭喜!

所有 Docker 部署文件已准备就绪,现在可以开始部署了!

如有问题,请查看详细文档或提交 Issue。
