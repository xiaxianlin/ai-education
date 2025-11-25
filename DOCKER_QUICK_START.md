# Docker 部署 - 快速参考

## 文件结构

```
ai-eduaction/
├── docker-compose.yml              # Docker Compose 主配置
├── .dockerignore                   # Docker 忽略文件
├── .env.example                    # 环境变量模板
├── DOCKER_DEPLOYMENT.md            # 详细部署文档
│
├── server/
│   ├── Dockerfile                  # 后端服务镜像
│   └── .dockerignore
│
├── admin/
│   ├── Dockerfile                  # 管理后台镜像
│   ├── nginx.conf                  # 管理后台 Nginx 配置
│   └── .dockerignore
│
├── student/
│   ├── Dockerfile                  # 学生端镜像
│   ├── nginx.conf                  # 学生端 Nginx 配置
│   └── .dockerignore
│
├── nginx/
│   └── default.conf                # 主网关 Nginx 配置
│
└── scripts/
    ├── quickstart.sh               # 一键启动脚本
    ├── build.sh                    # 构建脚本
    └── deploy.sh                   # 部署管理脚本
```

## 快速开始

### 1. 配置环境变量
```bash
cp .env.example .env
vim .env  # 修改配置
```

### 2. 一键启动
```bash
./scripts/quickstart.sh
```

### 3. 访问应用
- 管理后台: http://localhost/admin
- 学生端: http://localhost/student
- API: http://localhost/api

## 常用命令速查

### 启动和停止
```bash
./scripts/deploy.sh start          # 启动所有服务
./scripts/deploy.sh stop           # 停止所有服务
./scripts/deploy.sh restart        # 重启所有服务
./scripts/deploy.sh status         # 查看状态
```

### 日志查看
```bash
./scripts/deploy.sh logs           # 查看所有日志
./scripts/deploy.sh logs server    # 查看后端日志
./scripts/deploy.sh logs admin     # 查看管理后台日志
./scripts/deploy.sh logs student   # 查看学生端日志
```

### 构建和更新
```bash
./scripts/build.sh                 # 构建所有镜像
./scripts/build.sh server          # 构建单个服务
./scripts/deploy.sh build          # 构建并启动
./scripts/deploy.sh update         # 更新服务
```

### 数据库操作
```bash
./scripts/deploy.sh backup         # 备份数据库
./scripts/deploy.sh cleanup        # 清理资源(会删除数据!)
```

## 服务端口

| 服务 | 内部端口 | 外部端口 | 说明 |
|------|---------|---------|------|
| Nginx | 80 | 80 | HTTP 入口 |
| Server | 7890 | 7890 | FastAPI 后端 |
| MySQL | 3306 | 3306 | 数据库 |
| Redis | 6379 | 6379 | 缓存 |

## 故障排查

### 容器无法启动
```bash
docker-compose ps                   # 查看状态
docker-compose logs service_name    # 查看日志
docker-compose down && docker-compose up -d  # 重启
```

### 端口被占用
```bash
lsof -i :80                        # 查看端口占用
```

### 数据库连接失败
```bash
docker exec -it ai-education-mysql mysql -uroot -p
```

### 清理并重建
```bash
docker-compose down -v              # 停止并删除卷
docker system prune -a              # 清理所有资源
./scripts/deploy.sh build           # 重新构建
```

## 重要提示

1. **首次启动前必须配置 .env 文件**
2. **生产环境请修改所有默认密码**
3. **定期备份数据库**: `./scripts/deploy.sh backup`
4. **查看完整文档**: 阅读 `DOCKER_DEPLOYMENT.md`

## 环境变量检查清单

- [ ] MYSQL_PASSWORD (数据库密码)
- [ ] REDIS_PASSWORD (Redis密码)
- [ ] APP_SECRET_KEY (应用密钥,32位+)
- [ ] ADMIN_USERNAME (管理员用户名)
- [ ] ADMIN_PASSWORD (管理员密码)
- [ ] AI_PLATFORM_KEY (AI平台密钥)
- [ ] ALIYUN_ACCESS_KEY_ID (阿里云密钥ID)
- [ ] ALIYUN_ACCESS_KEY_SECRET (阿里云密钥Secret)
- [ ] ALIYUN_OSS_BUCKET (OSS存储桶名称)

## 获取帮助

```bash
./scripts/deploy.sh help           # 查看部署脚本帮助
./scripts/build.sh --help          # 查看构建脚本帮助
```

详细文档请查看: `DOCKER_DEPLOYMENT.md`
