# AI 教育辅导平台 - 项目上下文

## 项目概述

这是一个 K12 教育辅导平台，提供智能化的学习体验。项目采用微服务架构，包含管理后台、学生端和后端服务三个主要组件。

### 核心功能
- 智能题目生成（基于 AI）
- 教材内容解析和管理
- 多种练习模式（每日练习、单元练习、能力评估）
- 错题记录和掌握度追踪
- 学生学习报告生成

### 技术栈
- **后端**: Python + FastAPI + SQLAlchemy + Redis + MySQL
- **管理后台**: React + Ant Design Pro + TypeScript
- **学生端**: React + Rsbuild + Tailwind CSS + TypeScript
- **部署**: Docker + Docker Compose + Nginx
- **AI 服务**: 阿里云百炼、OpenAI
- **存储**: 阿里云 OSS

## 项目结构

```
ai-education/
├── server/                    # 后端服务 (FastAPI)
│   ├── admin/                # 管理端路由和服务
│   ├── student/              # 学生端路由和服务
│   ├── core/                 # 核心配置和工具
│   ├── shared/               # 共享组件
│   └── main.py              # 应用入口
├── admin/                    # 管理后台前端
│   ├── src/                 # 源代码
│   ├── config/              # 配置文件
│   └── package.json         # 依赖配置
├── student/                  # 学生端前端
│   ├── src/                 # 源代码
│   ├── components/          # 组件
│   └── package.json         # 依赖配置
├── nginx/                    # Nginx 配置
├── mysql/                    # 数据库初始化脚本
├── scripts/                  # 部署和管理脚本
└── docker-compose.yml        # Docker 编排配置
```

## 构建和运行

### 环境要求
- Docker & Docker Compose
- Node.js 18+ (本地开发)
- Python 3.12+ (本地开发)

### 快速启动

1. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入必要的配置
   ```

2. **一键启动**
   ```bash
   ./scripts/quickstart.sh
   ```

3. **访问应用**
   - 管理后台: http://localhost/admin
   - 学生端: http://localhost/student
   - API 文档: http://localhost/api/docs

### 本地开发

#### 后端服务
```bash
cd server
uv install
uvicorn main:app --reload --port 7890
```

#### 管理后台
```bash
cd admin
npm install
npm run start:dev
```

#### 学生端
```bash
cd student
npm install
npm run dev
```

### 常用命令

```bash
# 查看服务状态
./scripts/deploy.sh status

# 查看日志
./scripts/deploy.sh logs

# 重启服务
./scripts/deploy.sh restart

# 停止服务
./scripts/deploy.sh stop

# 构建镜像
./scripts/build.sh
```

## 开发约定

### 代码规范
- **Python**: 遵循 PEP 8，使用 Black 格式化
- **TypeScript**: 使用 ESLint + Prettier，遵循 Ant Design Pro 约定
- **Git**: 使用 Conventional Commits 规范

### API 设计
- RESTful API 设计
- 统一的响应格式: `{ code: number, message: string, data: any }`
- JWT Token 认证
- 完整的错误处理和日志记录

### 数据库约定
- 使用 SQLAlchemy ORM
- 表名使用下划线命名
- 字段名使用下划线命名
- 必须包含 create_time 和 update_time 字段

### 前端组件规范
- 管理后台使用 Ant Design 组件库
- 学生端使用 Radix UI + Tailwind CSS
- 组件文件使用 PascalCase 命名
- 使用 TypeScript 严格类型检查

## 核心业务流程

### 1. 教材管理流程
1. 管理员创建教材（科目、年级、版本等）
2. 上传教材 PDF 文件
3. AI 解析教材内容，提取单元和知识点
4. 基于教材内容生成题目
5. 为学生绑定教材

### 2. 练习生成流程
1. 选择练习类型（每日/单元/能力评估）
2. 系统根据学生水平和教材内容选题
3. AI 生成个性化题目
4. 可选生成题目配图和语音

### 3. 学习流程
1. 学生登录系统
2. 选择练习类型开始学习
3. 逐题作答，系统实时反馈
4. 完成练习生成学习报告
5. 错题自动记录，可针对性练习

## 重要配置说明

### 环境变量
- `AI_PLATFORM`: AI 平台选择（dashscope/openai）
- `AI_PLATFORM_KEY`: AI 平台密钥
- `ALIYUN_*`: 阿里云服务配置
- `DATABASE_URL`: 数据库连接字符串
- `ADMIN_USERNAME/PASSWORD`: 默认管理员账号

### 数据库初始化
数据库初始化脚本位于 `mysql/init/00-init.sql`，包含：
- 表结构创建
- 默认数据插入
- 索引优化

### 权限系统
- **超级管理员**: 拥有所有权限
- **普通管理员**: 除删除教材外的所有权限
- **学生**: 只能访问分配的教材和功能

## 部署说明

### 生产环境部署
1. 修改 `.env` 文件中的生产环境配置
2. 确保所有密钥和密码已更新
3. 运行 `./scripts/deploy.sh build` 构建镜像
4. 运行 `./scripts/deploy.sh start` 启动服务

### 监控和日志
- 应用日志: `/app/tmp/logs`
- Nginx 日志: 通过 Docker 卷挂载
- 数据库日志: MySQL 容器内
- 健康检查: 所有服务都配置了健康检查

### 备份策略
```bash
# 数据库备份
./scripts/deploy.sh backup

# 恢复数据库
mysql -h localhost -u root -p ai_helper < backup.sql
```

## 故障排查

### 常见问题
1. **服务无法启动**: 检查环境变量和端口占用
2. **数据库连接失败**: 验证数据库服务和连接配置
3. **AI 服务异常**: 检查 AI 平台密钥和网络连接
4. **文件上传失败**: 检查 OSS 配置和权限

### 调试命令
```bash
# 查看容器状态
docker-compose ps

# 查看服务日志
docker-compose logs server

# 进入容器调试
docker exec -it ai-education-server bash

# 测试数据库连接
docker exec -it ai-education-mysql mysql -u root -p
```

## API 接口

详细的 API 文档请参考 `server/API.md` 文件，包含：
- 管理端接口（认证、教材、题目、学生管理等）
- 学生端接口（练习、答题、错题记录等）
- 请求/响应示例
- 错误码说明

## 开发建议

1. **性能优化**: 
   - 使用 Redis 缓存热点数据
   - 数据库查询优化和索引设计
   - 前端代码分割和懒加载

2. **安全考虑**:
   - 所有 API 接口需要认证
   - 敏感信息使用环境变量
   - 定期更新依赖包

3. **测试策略**:
   - 后端使用 pytest 进行单元测试
   - 前端使用 Jest + Testing Library
   - API 接口使用 Postman 测试

## 联系方式

如有技术问题或建议，请通过以下方式联系：
- 项目仓库: https://github.com/xiaxianlin/ai-education
- 技术文档: 参考 `docs/` 目录下的相关文档