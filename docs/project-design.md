# 小学生 AI 练习系统 — 项目设计文档

> **版本**: v2.0 | **更新日期**: 2026-06-12 | **维护者**: 架构组

---

## 一、系统概述

### 1.1 产品定位

面向小学生的 AI 驱动在线练习平台，覆盖**语文、数学、英语**三学科，支持**能力练习**和**单元练习**两种模式。系统通过 AI 动态生成个性化练习题，基于学生的练习表现实时评估能力掌握度，形成「练习 → 评估 → 调整 → 再练习」的闭环学习路径。

### 1.2 终极目标

```
学生根据能力或单元进行练习
        ↓
   AI 生成练习题（动态调整难度）
        ↓
   学生完成练习
        ↓
   生成评估报告
        ↓
   更新学生学习档案（掌握度、薄弱项）
        ↓
   下次练习根据最新学习情况调整
```

### 1.3 核心用户

| 角色 | 入口 | 核心诉求 |
|------|------|----------|
| **学生** | PC Web / 移动端 | 能力练习、单元练习、查看报告、了解薄弱项 |
| **教师** | 管理端 | 管理学生、查看练习数据、分配教材 |
| **管理员** | 管理端 | 管理教材/能力/题型/学生/教师、系统配置 |

---

## 二、系统架构

### 2.1 总体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────┐        │
│  │ Admin Web │  │ Student Web  │  │ Student Mobile │        │
│  │ (React 18)│  │ (React 18)   │  │ (React Native) │        │
│  │ Ant Design│  │ shadcn/ui    │  │ Expo + Tamagui │        │
│  └─────┬─────┘  └──────┬──────┘  └───────┬────────┘        │
│        │               │                  │                  │
│        └───────────────┼──────────────────┘                  │
│                        │ HTTP / WebSocket                    │
│                        ▼                                     │
├─────────────────────────────────────────────────────────────┤
│                      网关层 (Nginx)                           │
│            反向代理 + 静态资源 + CORS                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Go 后端服务                                │
│                  (apps/server-go)                             │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │ Practice │  │ Question │  │ Mastery  │   │
│  │ Module   │  │ Module   │  │ Module   │  │ Module   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Ability  │  │ Textbook │  │ Student  │  │ Teacher  │   │
│  │ Module   │  │ Module   │  │ Module   │  │ Module   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    AI 适配层                          │   │
│  │  QuestionGenerator │ AnswerEvaluator │ ReportGenerator│  │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    任务队列                           │   │
│  │  practice.generate │ answer.evaluate │ report.generate│  │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  MySQL   │ │  Redis   │ │ AI (LLM) │
    │  数据库   │ │  队列/缓存│ │  Gemini  │
    └──────────┘ └──────────┘ └──────────┘
```

### 2.2 技术选型

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| **Monorepo** | pnpm workspace + Turborepo | 统一依赖、增量构建、代码共享 |
| **管理端** | React 18 + Rsbuild + Ant Design 5 | 企业级 UI 组件、表单/表格开箱即用 |
| **学生 PC** | React 18 + Rsbuild + shadcn/ui | 轻量、可定制、现代设计感 |
| **学生移动端** | React Native + Expo 54 + Tamagui | 跨平台、热更新、统一设计系统 |
| **后端** | Go 1.25 + net/http | 高性能、强类型、协程并发 |
| **数据库** | MySQL 8 | 关系型、事务支持、JSON 字段 |
| **AI** | Google ADK (Gemini) | 多模态、中文能力强 |
| **共享包** | @ai-education/shared-web | API 客户端、类型定义、工具函数 |

### 2.3 项目结构

```
ai-education/
├── apps/
│   ├── admin-web/          # 管理端 (React 18 + Ant Design 5)
│   │   ├── src/
│   │   │   ├── pages/      # 页面 (Feature/PageName/ 结构)
│   │   │   ├── components/ # 公共组件
│   │   │   ├── layouts/    # 布局
│   │   │   └── utils/      # 工具函数
│   │   └── package.json
│   │
│   ├── student-web/        # 学生 PC 端 (React 18 + shadcn/ui)
│   │   ├── src/
│   │   │   ├── pages/      # 页面
│   │   │   ├── components/ # 组件
│   │   │   └── styles/     # 样式
│   │   └── package.json
│   │
│   ├── student-mobile/     # 学生移动端 (React Native + Expo)
│   │   ├── app/            # Expo Router 页面
│   │   ├── components/     # 组件
│   │   └── package.json
│   │
│   ├── server-go/          # Go 后端 (主力)
│   │   ├── cmd/
│   │   │   ├── api/        # HTTP API 入口 (:7891)
│   │   │   └── worker/     # 异步 Worker 入口
│   │   ├── internal/       # 业务模块 (Handler→Service→Repository)
│   │   ├── migrations/     # 数据库迁移
│   │   ├── sql/            # SQL 参考
│   │   └── tests/          # 集成测试
│   │
│   └── server/             # Python 后端 (Legacy, 逐步废弃)
│
├── packages/
│   └── shared-web/         # @ai-education/shared-web
│       ├── src/
│       │   ├── api/        # ApiClient (Axios)
│       │   ├── types/      # 共享类型定义
│       │   └── utils/      # 工具函数
│       └── package.json
│
├── infra/
│   ├── mysql/              # 数据库初始化 SQL
│   └── nginx/              # Nginx 配置
│
├── docs/                   # 文档
├── turbo.json              # Turborepo 配置
├── pnpm-workspace.yaml     # pnpm workspace 配置
└── package.json            # 根 package.json
```

---

## 三、核心模块设计

### 3.1 能力模型 (Ability)

能力模型是整个系统的**知识骨架**，连接教材、题型和掌握度。

```
学科 (Subject)
  └── 年级 (Grade)
       └── 能力点 (Ability)
            ├── code: 唯一编码 (如 "chinese_1_understanding")
            ├── name: 能力名称 (如 "阅读理解")
            ├── description: 能力描述
            └── category: 分类
```

**预置能力点**:
- 语文 (1-6 年级): 18 个能力点
- 数学 (1-6 年级): 24 个能力点
- 英语 (1-6 年级): 12 个能力点

### 3.2 练习系统 (Practice)

练习系统是**核心业务引擎**，管理练习的全生命周期。

#### 练习状态机

```
                    ┌──────────────┐
                    │   CREATED    │
                    │ generate_    │
                    │ status: 0    │
                    │ (生成中)     │
                    └──────┬───────┘
                           │ AI 生成题目完成
                           ▼
                    ┌──────────────┐
         ┌────────│   READY      │─────────┐
         │        │ generate_    │         │
         │        │ status: 1    │         │
         │        │ status: 0    │         │
         │        │ (未开始)     │         │
         │        └──────────────┘         │
    生成失败│                            学生开始│
         │        ┌──────────────┐         │
         └───────►│   FAILED     │         │
                  │ generate_    │         │
                  │ status: -1   │         │
                  └──────────────┘         │
                                           ▼
                                    ┌──────────────┐
                                    │  IN_PROGRESS │
                                    │ status: 1    │
                                    │ (进行中)     │
                                    └──────┬───────┘
                                           │ 学生完成
                                           ▼
                                    ┌──────────────┐
                                    │  COMPLETED   │
                                    │ status: 2    │
                                    │ (已完成)     │
                                    └──────────────┘

                    ┌──────────────┐
                    │  ABANDONED   │  ← 任何阶段都可废弃
                    │ status: 3    │
                    └──────────────┘
```

#### 练习创建流程

```
学生选择练习模式 (能力/单元)
        ↓
选择具体能力点 或 教材单元
        ↓
POST /api/student/practice/create
        ↓
创建 practice.generate 任务入队
        ↓
Worker 调用 AI 生成题目
  ├── 获取题型配置 (QuestionType)
  ├── 获取 Prompt 模板
  ├── 调用 Gemini API
  ├── 校验生成结果 (ValidateGeneratedQuestions)
  └── 持久化到 ah_question + ah_practice_answer
        ↓
更新 generate_status = 1 (完成)
        ↓
学生开始答题
        ↓
逐题提交答案 → 自动评判 (客观题) / AI评判 (主观题)
        ↓
POST /api/student/practice/{id}/complete
        ↓
创建 report.generate 任务入队
        ↓
AI 生成练习报告 → 更新掌握度
```

### 3.3 掌握度系统 (Mastery)

掌握度系统是**自适应学习**的核心，跟踪学生在每个能力点上的表现。

#### 掌握度计算模型

```
能力掌握度 = f(历史练习正确率, 最近练习表现, 练习次数, 难度系数)

维度:
  ├── correct_rate: 正确率 (0-100%)
  ├── practice_count: 练习次数
  ├── latest_score: 最近一次得分
  └── trend: 趋势 (上升/稳定/下降)

等级:
  ├── 未掌握 (0-40%)
  ├── 初步掌握 (40-60%)
  ├── 基本掌握 (60-80%)
  └── 熟练掌握 (80-100%)
```

#### 自适应调整策略

```
练习历史 → 分析薄弱能力点
        ↓
  ┌─────────────────────────────────┐
  │         难度调整策略              │
  ├─────────────────────────────────┤
  │ 正确率 < 40% → 降低难度，强化基础 │
  │ 正确率 40-70% → 维持难度，巩固   │
  │ 正确率 > 70% → 提升难度，拓展    │
  └─────────────────────────────────┘
        ↓
影响 Prompt 模板中的难度参数 → AI 生成对应难度题目
```

### 3.4 题型系统 (Question Type)

题型系统是 AI 生成题目的**配置中心**，管理题型定义和 Prompt 模板。

```
题型 (QuestionType)
  ├── code: 唯一编码
  ├── name: 题型名称
  ├── category: ability_practice | unit_practice
  ├── ability_code: 关联能力点
  ├── prompt: AI Prompt 模板
  └── configs: JSON 配置
```

**支持的题型**:
| 类型 | 说明 | 答案格式 |
|------|------|----------|
| `choice` | 选择题 | 选项索引 |
| `judge` | 判断题 | true/false |
| `sorting` | 排序题 | 有序数组 |
| `matching` | 匹配题 | 映射对象 |
| `input` | 填空题 | 文本 |

### 3.5 评估报告 (Practice Report)

每次练习完成后自动生成的**多维度评估报告**。

```
练习报告 (PracticeReport)
  ├── 总分 & 正确率
  ├── 各题详情 (题目、学生答案、正确答案、是否正确)
  ├── 能力分析 (各能力点得分)
  ├── 错题分析 (错误原因归类)
  ├── 建议 (AI 生成的改进建议)
  └── 对比分析 (与历史表现对比)
```

---

## 四、数据库设计

### 4.1 ER 关系图

```
                    ┌──────────────┐
                    │  ah_manager  │
                    │ (管理员/教师) │
                    └──────────────┘

┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ah_textbook│────<│   ah_unit    │     │ ah_ability   │
│ (教材)    │     │ (教材单元)   │     │ (能力点)     │
└──────────┘     └──────────────┘     └──────┬───────┘
                                              │
┌──────────┐     ┌──────────────────────┐     │
│ah_student│────<│ah_student_ability_   │>────┘
│ (学生)   │     │  mastery (掌握度)    │
│          │     └──────────────────────┘
│          │
│          │────<┌──────────────┐────<┌──────────────┐
│          │     │ ah_practice  │     │ah_question   │
│          │     │ (练习会话)   │     │ (题目)       │
│          │     └──────┬───────┘     └──────┬───────┘
│          │            │                     │
│          │            │    ┌────────────────┘
│          │            │    │
│          │     ┌──────┴────┴───────┐
│          │     │ah_practice_answer │
│          │     │ (练习答案)         │
│          │     └───────────────────┘
│          │
│          │────<┌──────────────────────┐
│          │     │ah_practice_report    │
│          │     │ (练习报告)           │
│          │     └──────────────────────┘
│          │
└──────────┘
```

### 4.2 核心表结构

#### ah_student (学生表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 自增主键 |
| name | VARCHAR | 学生姓名 |
| username | VARCHAR UNIQUE | 登录名 |
| password | VARCHAR | 密码哈希 |
| grade | INT | 年级 (1-6) |
| subject | VARCHAR | 学科 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### ah_ability (能力表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 自增主键 |
| subject | VARCHAR | 学科 |
| grade | INT | 年级 |
| code | VARCHAR | 能力编码 (联合唯一) |
| name | VARCHAR | 能力名称 |
| description | TEXT | 能力描述 |

#### ah_practice (练习会话表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| student_id | BIGINT FK | 学生 ID |
| type | VARCHAR | 练习类型 (ability/unit) |
| generate_status | INT | 生成状态 (0/1/-1) |
| status | INT | 练习状态 (0/1/2/3) |
| question_count | INT | 题目数量 |
| config | JSON | 练习配置 |
| created_at | DATETIME | 创建时间 |
| completed_at | DATETIME | 完成时间 |

#### ah_question (题目表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| practice_id | VARCHAR(36) FK | 练习会话 ID |
| type_code | VARCHAR | 题型编码 |
| content | JSON | 题目内容 (题干+选项等) |
| answer | JSON | 正确答案 |
| difficulty | INT | 难度等级 |

#### ah_student_ability_mastery (掌握度表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 自增主键 |
| student_id | BIGINT FK | 学生 ID |
| ability_code | VARCHAR | 能力编码 |
| correct_rate | DECIMAL | 正确率 |
| practice_count | INT | 练习次数 |
| latest_score | DECIMAL | 最近得分 |
| mastery_level | INT | 掌握等级 |
| updated_at | DATETIME | 更新时间 |

---

## 五、API 设计

### 5.1 统一响应格式

```json
{
  "status": 0,
  "message": "ok",
  "data": { ... }
}
```

- `status: 0` 成功，非 0 为错误码
- `message`: 成功时 "ok"，失败时错误描述
- `data`: 业务数据

### 5.2 认证机制

- 管理端: `POST /api/admin/login` → Token 存 localStorage
- 学生端: `POST /api/student/login` → Token 存 localStorage
- 请求头: `x-access-token: <token>`

### 5.3 API 分组

| 前缀 | 说明 |
|------|------|
| `/api/admin/*` | 管理端接口 (需 admin token) |
| `/api/student/*` | 学生端接口 (需 student token) |

---

## 六、部署架构

```
                    ┌───────────┐
                    │   Nginx   │
                    │  (反向代理) │
                    └─────┬─────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
     ┌────────────┐ ┌──────────┐ ┌──────────┐
     │ Admin Web  │ │Student   │ │  Go API  │
     │ (静态资源)  │ │Web (静态) │ │ (:7891)  │
     └────────────┘ └──────────┘ └─────┬────┘
                                        │
                              ┌─────────┼─────────┐
                              ▼         ▼         ▼
                         ┌───────┐ ┌───────┐ ┌───────┐
                         │ MySQL │ │ Redis │ │  LLM  │
                         └───────┘ └───────┘ └───────┘
```

---

## 七、后续演进路线

### Phase 1 — 基础能力完善 (当前)
- [x] 能力/单元练习基础流程
- [x] AI 题目生成 (Gemini)
- [x] 客观题自动评判
- [x] 练习报告生成
- [x] 掌握度追踪
- [ ] 主观题 AI 评判
- [ ] 学生移动端功能完善
- [ ] Redis 队列正式对接

### Phase 2 — 智能化升级
- [ ] 自适应难度调整算法优化
- [ ] RAG 知识库检索接入
- [ ] 错题本 & 薄弱项专项练习
- [ ] 学习路径推荐
- [ ] 图片/音频题目支持

### Phase 3 — 规模化
- [ ] 多租户支持 (学校/机构)
- [ ] 数据分析与教学大屏
- [ ] 家长端
- [ ] 离线练习支持
- [ ] 性能优化与缓存策略
