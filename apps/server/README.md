# AI Education Platform - 服务端

## 项目简介

AI Education Platform 是一个基于人工智能的教育辅助平台，为学生提供智能化的学习体验，包括日常练习、单元练习和综合评估等功能。平台通过阿里云百炼AI技术，自动生成题目、分析学生能力，并提供个性化的学习建议。

## 核心功能

### 管理端功能

#### 1. 管理员系统

- 管理员认证与授权（JWT）
- 多级管理员权限管理（超级管理员/普通管理员）
- 密码管理和重置

#### 2. 教材管理

- 教材信息管理（科目、版本、年级、学期）
- 教材文件上传（PDF格式）
- 教材智能解析（提取单元和知识点）
- 基于教材自动生成题目
- 教材状态管理（启用/禁用）
- 教材搜索和分页查询

#### 3. 课程单元管理

- 单元创建和编辑
- 单元内容管理
- 基于单元自动生成题目
- 单元知识点关联
- 单元题目查询

#### 4. 知识点管理

- 知识点创建和编辑
- 知识点难度和重要性设置
- 知识点排序管理
- 知识点题目关联

#### 5. 题目管理

- 题目搜索和筛选（按教材、单元、知识点、难度等）
- 题目编辑和删除
- 多种题型支持（选择题、填空题、口语题等）
- 题目图片自动生成
- 题目语音自动生成
- 资源题目库管理

#### 6. 学生管理

- 学生信息管理（创建、编辑、删除）
- 学生搜索和分页查询
- 学生教材绑定
- 学生密码重置
- 学生详情查看

#### 7. 练习管理

- 为学生生成日常练习
- 为学生生成单元练习
- 为学生生成综合评估
- 查看学生练习历史
- 查看练习会话详情和报告

### 学生端功能

#### 1. 认证系统

- 学生登录（手机号 + 密码）
- 登录状态检查
- 自动返回当前使用教材

#### 2. 教材功能

- 查看已绑定教材列表
- 选择当前使用教材
- 查看教材单元列表

#### 3. 日常练习

- 获取当日练习题目
- 创建新的日常练习
- 查看日常练习历史记录

#### 4. 单元练习

- 查看各单元练习状态
- 开始单元练习
- 查看单元练习历史

#### 5. 综合评估

- 参与综合评估测试
- 获取综合评估报告
- 查看历史评估记录

#### 6. 答题功能

- 文本答题
- 语音答题（支持音频上传）
- 实时答题反馈
- 答题计时
- 练习完成后生成报告

## 技术架构

### 技术栈

- **Web框架**: FastAPI 0.115+
- **数据库**: MySQL (通过 SQLAlchemy 2.0 异步ORM)
- **缓存**: Redis
- **对象存储**: 阿里云OSS
- **认证**: JWT (PyJWT)
- **日志**: Loguru
- **语音处理**: PyTorch + TorchAudio
- **文档处理**: PyMuPDF
- **任务队列**: Celery (Redis 作为 Broker 和 Backend)
- **AI 工作流**: LangChain + LangGraph
- **运行时**: Python 3.12

### 项目结构

```
server/
├── admin/                  # 管理端模块
│   ├── routes/            # 路由层（API 端点）
│   │   ├── auth.py        # 认证相关
│   │   ├── manager.py     # 管理员管理
│   │   ├── textbook.py    # 教材管理
│   │   ├── teacher_book.py # 教师用书管理
│   │   ├── unit.py        # 单元管理
│   │   ├── knowledge.py   # 知识点管理
│   │   ├── question.py    # 题目管理
│   │   ├── student.py     # 学生管理
│   │   ├── practice.py    # 练习管理
│   │   └── config.py      # 配置管理
│   ├── services/          # 业务逻辑层
│   └── schema.py           # 请求/响应模型定义
│
├── student/               # 学生端模块
│   ├── routes/            # 路由层
│   │   ├── auth.py       # 学生认证
│   │   ├── profile.py    # 学生资料
│   │   ├── textbook.py   # 教材功能
│   │   └── practice.py   # 练习功能（每日/单元/评估）
│   ├── services/          # 业务逻辑层
│   │   ├── practice_generate.py # 练习生成服务
│   │   ├── answer.py     # 答题服务
│   │   └── report.py     # 报告生成服务
│   └── schema.py          # 数据模型定义
│
├── ai/                    # AI 功能模块
│   ├── question/         # 题目相关 AI
│   │   ├── answer.py     # 答题分析
│   │   └── resource.py   # 资源生成（图片/语音）
│   ├── question_generate/ # 题目生成（LangGraph 工作流）
│   │   ├── graph.py      # 工作流定义
│   │   ├── prompts/      # Prompt 模板
│   │   └── services/     # 生成服务
│   ├── practice/         # 练习分析
│   │   └── analysis.py   # 能力分析
│   ├── texttbook/        # 教材解析
│   │   └── parse.py      # PDF 解析
│   ├── utils/            # AI 工具
│   │   ├── llm.py        # LLM 工具函数
│   │   ├── question.py   # 题目处理工具
│   │   └── rag.py        # RAG 工具
│   └── schema.py         # AI 相关数据模型
│
├── shared/                # 共享模块
│   ├── core/             # 核心功能
│   │   ├── database.py   # 数据库模型和配置
│   │   ├── settings.py   # 环境配置
│   │   ├── logger.py     # 日志配置
│   │   ├── middleware.py # 中间件
│   │   ├── exception.py  # 异常处理
│   │   ├── constants.py  # 常量定义
│   │   └── schema.py     # 共享数据模型
│   ├── worker/           # 任务处理模块（Celery Worker）
│   │   ├── celery.py     # Celery 应用配置和任务管理
│   │   ├── executor.py   # 任务执行器（Worker 实际执行的函数）
│   │   ├── README.md     # Worker 模块文档
│   │   └── CONFIG.md     # Worker 配置文档
│   └── utils/            # 工具函数
│       ├── encrypt.py    # 加密工具
│       ├── oss.py        # OSS 存储工具
│       ├── time.py       # 时间工具
│       └── validation.py # 验证工具
│
├── main.py               # 应用入口
├── worker.py            # Celery Worker 启动脚本
├── pyproject.toml        # 项目依赖配置
├── ecosystem.config.js   # PM2 配置
├── langgraph.json        # LangGraph 配置
└── README.md             # 项目文档
```

### 数据库模型

#### 核心表结构

1. **ah_manager** - 管理员表
2. **ah_textbook** - 教材表
3. **ah_unit** - 课程单元表
4. **ah_knowledge** - 知识点表
5. **ah_question** - 题目表
6. **ah_student** - 学生表
7. **ah_student_subject_version** - 学生科目版本关联表
8. **ah_practice_session** - 练习会话表
9. **ah_practice_answer** - 答题记录表
10. **ah_practice_wrong_record** - 错题记录表
11. **ah_practice_report** - 练习报告表

### AI功能特性

#### 1. 智能题目生成

- 基于教材内容生成题目
- 基于单元知识点生成题目
- 支持多种题型（选择题、填空题、口语题、匹配题等）
- 自动设置题目难度
- 题目去重和质量控制

#### 2. 综合评估系统

- 基于IRT（项目反应理论）评估学生能力
- 动态调整题目难度
- 生成详细的能力报告
- 提供学习建议

#### 3. 个性化练习

- 根据学生历史表现生成日常练习
- 错题重点练习
- 知识点薄弱项针对性练习

#### 4. 多媒体支持

- 自动生成题目配图
- 自动生成题目语音
- 支持语音答题

## 环境配置

### 必需环境变量

创建 `.env` 文件，配置以下变量：

```bash
# 运行环境
RUN_ENV=development

# 目录配置
TMP_DIR=./tmp
LOG_DIR=./tmp/logs

# 安全密钥
APP_SECRET_KEY=your-secret-key

# 数据库配置
DATABASE_URL=mysql+asyncmy://user:password@localhost:3306/ai_education
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
DATABASE_POOL_TIMEOUT=30

# 阿里云配置
ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
ALIYUN_OSS_BUCKET=your-bucket-name
ALIYUN_OSS_REGION=cn-hangzhou
ALIYUN_WORKSPACE_ID=your-workspace-id
ALIYUN_RAG_INDEX_ID=your-index-id
ALIYUN_RAG_CATEGORY_ID=your-category-id

# Redis 配置（用于任务队列）
REDIS_URL=redis://redis:6379/0  # 完整的 Redis 连接 URL

# 任务配置
TASK_QUEUE_NAME=ai-education-task  # Celery 队列名称
TASK_TIMEOUT=1800  # 任务默认超时时间（秒）- 30分钟
TASK_CONCURRENCY=0  # Worker 并发数，0 表示自动检测（CPU 核心数）
TASK_LOGLEVEL=info  # Worker 日志级别

# 管理员账号（初始化）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS配置
CORS_ORIGINS=*
```

## 安装部署

### 1. 安装依赖管理工具

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. 创建虚拟环境

```sh
uv venv
source .venv/bin/activate
```

### 3. 安装依赖

```sh
uv sync
```

### 4. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置信息。

### 5. 启动服务

**开发模式**（带热重载）:

```sh
uv run main.py
```

**生产模式**:

```sh
uvicorn main:app --host 0.0.0.0 --port 7890 --workers 4
```

**使用 PM2**:

```sh
pm2 start ecosystem.config.js
```

**启动 Worker（处理异步任务）**:

```sh
# 开发模式（推荐）
npm run dev:worker

# 或者直接运行
uv run worker.py

# 或者使用原始 Celery 命令
npm run dev:worker:raw

# 自定义并发数
uv run worker.py --concurrency 8

# 生产模式（使用 PM2）
# 需要在 ecosystem.config.js 中配置 Celery worker
```

**Redis URL 配置**:

```bash
# 标准 Redis URL 格式
REDIS_URL=redis://redis:6379/0

# 带密码的 Redis URL
REDIS_URL=redis://:password@redis:6379/0

# 使用不同数据库
REDIS_URL=redis://redis:6379/2

# 使用不同主机
REDIS_URL=redis://redis-cluster:6379/0
```

**环境变量配置**:

```bash
# 设置 Worker 并发数
export CELERY_WORKER_CONCURRENCY=8
npm run dev:worker

# 或者在 .env 文件中设置
echo "CELERY_WORKER_CONCURRENCY=8" >> .env
```

**并发数规则**:

- `0`: 自动检测 CPU 核心数（默认）
- `1`: 单进程模式（调试用）
- `>1`: 指定的进程数

注意：Worker 需要单独启动，用于处理异步任务（如练习生成）。Celery Worker 通过 `shared/worker/` 模块实现，提供了完整的任务管理功能（提交、查询状态、取消等），支持通过环境变量灵活配置并发数、超时时间等参数。详细文档请参考 `shared/worker/README.md` 和 `shared/worker/CONFIG.md`。

## API文档

服务启动后，可以访问以下地址查看API文档：

- **Swagger UI**: http://localhost:7890/docs
- **ReDoc**: http://localhost:7890/redoc

详细接口文档请查看 [API.md](./API.md)

## 开发规范

### API命名规范

- **patch**: 字段修改，使用 `update_xxx`
- **put**: 全量修改，使用 `modify_xxx`
- **搜索**: 使用 `search_xxx`
- **通过ID查询**: 使用 `get_xxx`
- **通过字段单个查询**: 使用 `find_by_xxx`
- **通过字段批量查询**: 使用 `query_by_xxx`

### 代码规范

- 遵循 PEP 8 Python代码规范
- 使用类型注解（Type Hints）
- 业务逻辑放在 `services/` 层
- 路由层只负责参数验证和调用服务
- 使用异步编程（async/await）
- 统一的错误处理和日志记录

## 性能优化

- **数据库连接池**: 配置连接池大小和回收策略
- **异步IO**: 全面使用异步数据库和HTTP客户端
- **GZip压缩**: 自动压缩响应内容
- **Eager Loading**: 优化数据库查询，避免N+1问题
- **Redis缓存**: 缓存热点数据

## 监控与日志

### 日志配置

日志文件位于 `tmp/logs/` 目录：

- `app.log`: 应用日志
- `error.log`: 错误日志

日志级别根据环境自动调整：

- 开发环境: DEBUG
- 生产环境: INFO

### 日志格式

```
{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}
```

## 安全性

- **JWT认证**: 所有API接口需要JWT token认证
- **密码加密**: 使用bcrypt加密存储密码
- **CORS配置**: 可配置允许的跨域来源
- **SQL注入防护**: 使用ORM参数化查询
- **请求验证**: 使用Pydantic进行数据验证

## 常见问题

### 1. 数据库连接失败

检查 `DATABASE_URL` 配置是否正确，确保数据库服务已启动。

### 2. 阿里云服务调用失败

检查阿里云访问密钥配置是否正确，确保账号有相应服务的访问权限。

### 3. 题目生成失败

检查 AI 平台配置和API密钥是否正确，确保账号有足够的调用额度。

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 许可证

[MIT License](LICENSE)

## 联系方式

如有问题或建议，请联系项目维护者。
