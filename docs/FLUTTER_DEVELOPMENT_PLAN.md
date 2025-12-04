# AI 教育平台 - Flutter 移动端开发计划

## 📋 项目概述

### 项目背景
AI 教育平台移动端，为学生提供智能化的学习体验，包括每日练习、单元练习、能力评估等功能。

### 技术栈
- **框架**: Flutter 3.x
- **状态管理**: Riverpod 2.x
- **Hooks**: flutter_hooks
- **HTTP 客户端**: dio + retrofit (可选)
- **路由**: go_router
- **UI 组件**: Material 3
- **本地存储**: shared_preferences / hive
- **音频录制**: record / flutter_sound
- **图片加载**: cached_network_image
- **JSON 序列化**: json_serializable / freezed

### 后端 API 基础信息
- **Base URL**: `/api/student`
- **认证方式**: JWT Token (Header: `x-access-token`)
- **响应格式**: `{ data: T, message?: string, status?: number }`

---

## 📁 项目结构

```
mobile/
├── lib/
│   ├── main.dart                    # 应用入口
│   │
│   ├── core/                        # 核心功能
│   │   ├── api/
│   │   │   ├── api_client.dart      # Dio 客户端配置
│   │   │   ├── interceptors/        # 请求拦截器
│   │   │   │   ├── auth_interceptor.dart
│   │   │   │   └── error_interceptor.dart
│   │   │   └── endpoints/           # API 端点定义
│   │   │       ├── auth_endpoints.dart
│   │   │       ├── practice_endpoints.dart
│   │   │       ├── textbook_endpoints.dart
│   │   │       └── wrong_records_endpoints.dart
│   │   │
│   │   ├── models/                  # 数据模型
│   │   │   ├── student.dart
│   │   │   ├── textbook.dart
│   │   │   ├── question.dart
│   │   │   ├── practice_session.dart
│   │   │   ├── practice_answer.dart
│   │   │   └── practice_report.dart
│   │   │
│   │   ├── constants/               # 常量定义
│   │   │   ├── api_constants.dart
│   │   │   ├── app_constants.dart
│   │   │   └── practice_constants.dart
│   │   │
│   │   ├── utils/                   # 工具函数
│   │   │   ├── storage.dart         # 本地存储工具
│   │   │   ├── validators.dart     # 表单验证
│   │   │   └── formatters.dart     # 格式化工具
│   │   │
│   │   └── theme/                   # 主题配置
│   │       ├── app_theme.dart
│   │       └── app_colors.dart
│   │
│   ├── features/                    # 功能模块
│   │   ├── auth/                    # 认证模块
│   │   │   ├── data/
│   │   │   │   └── auth_repository.dart
│   │   │   ├── domain/
│   │   │   │   └── auth_service.dart
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   │   └── login_page.dart
│   │   │   │   └── widgets/
│   │   │   │       └── login_form.dart
│   │   │   └── providers/
│   │   │       └── auth_provider.dart
│   │   │
│   │   ├── profile/                 # 个人中心
│   │   │   ├── data/
│   │   │   │   └── profile_repository.dart
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   │   └── profile_page.dart
│   │   │   │   └── widgets/
│   │   │   └── providers/
│   │   │       └── profile_provider.dart
│   │   │
│   │   ├── textbook/               # 教材管理
│   │   │   ├── data/
│   │   │   │   └── textbook_repository.dart
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   │   └── textbook_list_page.dart
│   │   │   │   └── widgets/
│   │   │   └── providers/
│   │   │       └── textbook_provider.dart
│   │   │
│   │   ├── practice/               # 练习模块
│   │   │   ├── daily/             # 每日练习
│   │   │   │   ├── data/
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── daily_practice_page.dart
│   │   │   │   │   └── widgets/
│   │   │   │   └── providers/
│   │   │   │
│   │   │   ├── unit/              # 单元练习
│   │   │   │   ├── data/
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── unit_practice_page.dart
│   │   │   │   │   └── widgets/
│   │   │   │   └── providers/
│   │   │   │
│   │   │   ├── assessment/        # 能力评测
│   │   │   │   ├── data/
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── assessment_page.dart
│   │   │   │   │   └── widgets/
│   │   │   │   └── providers/
│   │   │   │
│   │   │   ├── session/           # 练习会话（核心）
│   │   │   │   ├── data/
│   │   │   │   │   └── practice_repository.dart
│   │   │   │   ├── domain/
│   │   │   │   │   └── practice_service.dart
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── practice_session_page.dart
│   │   │   │   │   │   ├── start_panel.dart
│   │   │   │   │   │   ├── question_panel.dart
│   │   │   │   │   │   └── result_panel.dart
│   │   │   │   │   └── widgets/
│   │   │   │   │       ├── question_card.dart
│   │   │   │   │       ├── answer_input/
│   │   │   │   │       │   ├── text_input.dart
│   │   │   │   │       │   ├── choice_input.dart
│   │   │   │   │       │   ├── judge_input.dart
│   │   │   │   │       │   └── audio_input.dart
│   │   │   │   │       ├── audio_recorder.dart
│   │   │   │   │       ├── audio_player.dart
│   │   │   │   │       └── progress_indicator.dart
│   │   │   │   └── providers/
│   │   │   │       └── session_provider.dart
│   │   │   │
│   │   │   ├── history/           # 练习历史
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── practice_history_page.dart
│   │   │   │   │   └── widgets/
│   │   │   │   └── providers/
│   │   │   │
│   │   │   ├── detail/            # 练习详情
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── practice_detail_page.dart
│   │   │   │   │   └── widgets/
│   │   │   │   └── providers/
│   │   │   │
│   │   │   └── report/            # 练习报告
│   │   │       ├── presentation/
│   │   │       │   ├── pages/
│   │   │       │   │   └── practice_report_page.dart
│   │   │       │   └── widgets/
│   │   │       └── providers/
│   │   │
│   │   └── wrong_records/          # 错题本
│   │       ├── data/
│   │       ├── presentation/
│   │       │   ├── pages/
│   │       │   │   └── wrong_records_page.dart
│   │       │   └── widgets/
│   │       └── providers/
│   │
│   ├── shared/                     # 共享组件和工具
│   │   ├── widgets/
│   │   │   ├── loading_indicator.dart
│   │   │   ├── error_widget.dart
│   │   │   ├── empty_state.dart
│   │   │   └── custom_button.dart
│   │   └── hooks/
│   │       └── use_api.dart
│   │
│   └── app/                        # 应用配置
│       ├── router.dart            # 路由配置
│       └── app.dart               # 应用根组件
│
├── test/                           # 测试文件
├── pubspec.yaml                    # 依赖配置
└── README.md
```

---

## 🗺️ 开发阶段规划

### 阶段 0: 项目初始化（1-2 天）

#### 任务清单
- [ ] 创建 Flutter 项目
- [ ] 配置 `pubspec.yaml` 依赖
- [ ] 设置项目结构
- [ ] 配置代码规范（analysis_options.yaml）
- [ ] 配置 Git 忽略文件

#### 关键依赖
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # 状态管理
  flutter_riverpod: ^2.4.9
  hooks_riverpod: ^2.4.9
  flutter_hooks: ^0.20.5
  
  # 网络请求
  dio: ^5.4.0
  retrofit: ^4.0.3
  json_annotation: ^4.8.1
  
  # 路由
  go_router: ^13.0.0
  
  # 本地存储
  shared_preferences: ^2.2.2
  
  # UI 组件
  cached_network_image: ^3.3.1
  
  # 音频录制
  record: ^5.0.4
  permission_handler: ^11.1.0
  
  # 工具
  intl: ^0.19.0
  freezed_annotation: ^2.4.1

dev_dependencies:
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
  retrofit_generator: ^8.0.6
  freezed: ^2.4.6
```

#### AI 实现指导
1. 创建 Flutter 项目：`flutter create mobile`
2. 添加所有依赖到 `pubspec.yaml`
3. 创建上述目录结构
4. 配置 `analysis_options.yaml` 代码规范

---

### 阶段 1: 核心基础设施（3-5 天）

#### 1.1 API 客户端搭建

**任务清单**
- [ ] 创建 Dio 客户端配置
- [ ] 实现认证拦截器（自动添加 JWT token）
- [ ] 实现错误拦截器（统一错误处理）
- [ ] 实现响应拦截器（统一数据解析）
- [ ] 创建 API 端点接口定义

**API 端点清单**

```dart
// 认证相关
POST   /api/student/login          // 登录
GET    /api/student/check          // 检查登录状态

// 个人中心
GET    /api/student/profile        // 获取个人信息和教材列表

// 教材相关
GET    /api/student/textbook/{textbook_id}/units        // 获取单元列表
GET    /api/student/textbook/{unit_id}/knowledges       // 获取知识点列表

// 练习相关
GET    /api/student/practice/daily                      // 获取每日练习
GET    /api/student/practice/unit                       // 获取单元练习
GET    /api/student/practice/assessment                 // 获取能力评测
POST   /api/student/practice/create                     // 创建练习
POST   /api/student/practice/{session_id}/begin         // 开始练习
POST   /api/student/practice/answer                    // 提交答案
POST   /api/student/practice/answer/{session_id}/{question_id}/upload  // 上传录音
POST   /api/student/practice/{session_id}/complete      // 完成练习
GET    /api/student/practice/detail/{session_id}        // 获取练习详情
GET    /api/student/practice/history/{type}             // 获取练习历史

// 错题本
GET    /api/student/wrong-records                       // 获取错题列表
POST   /api/student/wrong-records/{question_id}/master  // 标记已掌握
```

**AI 实现指导**
1. 创建 `lib/core/api/api_client.dart`，配置 Dio 实例
2. 实现拦截器：
   - `auth_interceptor.dart`: 从本地存储读取 token 并添加到 header
   - `error_interceptor.dart`: 统一处理 HTTP 错误和业务错误
3. 创建 API 端点接口（使用 retrofit 或直接使用 dio）

#### 1.2 数据模型定义

**任务清单**
- [ ] 定义所有数据模型（基于后端 schema）
- [ ] 实现 JSON 序列化/反序列化
- [ ] 创建模型工厂方法

**核心模型列表**
- `Student`
- `Textbook`
- `Unit`
- `Knowledge`
- `Question`
- `PracticeSession`
- `PracticeAnswer`
- `PracticeReport`
- `PracticeWrongRecord`
- `SubmitAnswerParams`
- `SubmitAnswerResponse`
- `UploadRecordingResult`

**AI 实现指导**
1. 参考 `student/src/types/schema.d.ts` 定义模型
2. 使用 `json_serializable` 或 `freezed` 生成序列化代码
3. 确保字段名与后端 API 响应一致

#### 1.3 本地存储工具

**任务清单**
- [ ] 实现 Token 存储
- [ ] 实现用户信息缓存
- [ ] 实现配置存储

**AI 实现指导**
1. 创建 `lib/core/utils/storage.dart`
2. 封装 `shared_preferences` 操作
3. 提供类型安全的存储接口

#### 1.4 路由配置

**任务清单**
- [ ] 配置 go_router
- [ ] 定义所有路由路径
- [ ] 实现路由守卫（登录检查）

**路由列表**
```dart
/login                    // 登录页
/home                     // 首页
/profile                  // 个人中心
/practice/daily           // 每日练习
/practice/unit            // 单元练习
/practice/assessment      // 能力评测
/practice/session/:id     // 练习会话
/practice/detail/:id      // 练习详情
/practice/report/:id      // 练习报告
/practice/history         // 练习历史
/wrong-records            // 错题本
```

**AI 实现指导**
1. 创建 `lib/app/router.dart`
2. 配置路由表
3. 实现 `Redirect` 逻辑进行登录检查

#### 1.5 主题配置

**任务清单**
- [ ] 定义应用主题
- [ ] 配置颜色方案
- [ ] 配置字体和样式

**AI 实现指导**
1. 参考 Web 端的 Tailwind 颜色配置
2. 创建 Material 3 主题
3. 定义常用文本样式

---

### 阶段 2: 认证和个人中心（2-3 天）

#### 2.1 登录功能

**任务清单**
- [ ] 创建登录页面 UI
- [ ] 实现登录表单验证
- [ ] 实现登录 API 调用
- [ ] 实现 Token 存储
- [ ] 实现登录状态管理（Riverpod）
- [ ] 实现自动登录检查

**API 接口**
```dart
POST /api/student/login
Body: { phone: string, password: string }
Response: string (token)
```

**AI 实现指导**
1. 创建 `lib/features/auth/presentation/pages/login_page.dart`
2. 使用 `flutter_hooks` 管理表单状态
3. 使用 Riverpod 管理认证状态
4. 登录成功后保存 token 并跳转到首页

#### 2.2 个人中心

**任务清单**
- [ ] 创建个人中心页面
- [ ] 实现个人信息展示
- [ ] 实现教材列表展示
- [ ] 实现当前教材选择

**API 接口**
```dart
GET /api/student/profile
Response: { student: Student, textbooks: Textbook[] }
```

**AI 实现指导**
1. 创建 `lib/features/profile/presentation/pages/profile_page.dart`
2. 使用 Riverpod 获取和缓存用户信息
3. 参考 Web 端的 Profile 页面布局

---

### 阶段 3: 教材和单元管理（2-3 天）

#### 3.1 教材列表

**任务清单**
- [ ] 创建教材列表页面
- [ ] 实现教材筛选（按科目、年级）
- [ ] 实现教材选择功能

**AI 实现指导**
1. 从 Profile 数据中获取教材列表
2. 实现筛选和排序逻辑
3. 参考 Web 端的教材展示方式

#### 3.2 单元列表

**任务清单**
- [ ] 创建单元列表页面
- [ ] 实现单元展示
- [ ] 实现知识点展示

**API 接口**
```dart
GET /api/student/textbook/{textbook_id}/units
GET /api/student/textbook/{unit_id}/knowledges
```

**AI 实现指导**
1. 创建 `lib/features/textbook/presentation/pages/textbook_list_page.dart`
2. 实现单元和知识点的层级展示
3. 参考 Web 端的 Unit 页面

---

### 阶段 4: 练习核心功能（5-7 天）

#### 4.1 每日练习

**任务清单**
- [ ] 创建每日练习页面
- [ ] 实现练习状态展示（未生成/生成中/已完成）
- [ ] 实现创建练习功能
- [ ] 实现跳转到练习会话

**API 接口**
```dart
GET /api/student/practice/daily
POST /api/student/practice/create
```

**状态处理**
- `generate_status = 0`: 显示"生成中"状态
- `generate_status = 1`: 显示"开始练习"按钮
- `generate_status = -1`: 显示"生成失败"错误

**AI 实现指导**
1. 创建 `lib/features/practice/daily/presentation/pages/daily_practice_page.dart`
2. 参考 Web 端的 `Practice/Daily/index.tsx`
3. 实现状态轮询（生成中时定期检查）

#### 4.2 单元练习

**任务清单**
- [ ] 创建单元练习页面
- [ ] 实现教材切换（Tab）
- [ ] 实现单元列表展示
- [ ] 实现单元练习状态展示
- [ ] 实现创建单元练习功能

**API 接口**
```dart
GET /api/student/practice/unit
POST /api/student/practice/create (with unit_id)
```

**AI 实现指导**
1. 创建 `lib/features/practice/unit/presentation/pages/unit_practice_page.dart`
2. 参考 Web 端的 `Practice/Unit/index.tsx`
3. 实现教材 Tab 切换和单元状态管理

#### 4.3 能力评测

**任务清单**
- [ ] 创建能力评测页面
- [ ] 实现评测状态展示
- [ ] 实现创建评测功能

**API 接口**
```dart
GET /api/student/practice/assessment
POST /api/student/practice/create (type: assessment)
```

**AI 实现指导**
1. 参考每日练习的实现方式
2. 处理评测的特殊逻辑

---

### 阶段 5: 练习会话（核心功能，7-10 天）

#### 5.1 练习会话状态管理

**任务清单**
- [ ] 创建 SessionProvider（Riverpod）
- [ ] 实现会话状态管理
- [ ] 实现题目列表管理
- [ ] 实现答案状态管理
- [ ] 实现进度跟踪

**状态管理设计**
```dart
class SessionState {
  PracticeSession? session;
  List<Question> questions;
  int currentQuestionIndex;
  Map<int, String> userAnswers;      // questionId -> answer
  Map<int, String> audioAnswers;     // questionId -> audioPath
  Map<int, AnswerStatus> answerStatus; // questionId -> status
  bool loading;
  bool submitting;
}
```

**AI 实现指导**
1. 创建 `lib/features/practice/session/providers/session_provider.dart`
2. 参考 Web 端的 `session-store.ts`
3. 使用 `StateNotifier` 管理复杂状态

#### 5.2 开始面板（StartPanel）

**任务清单**
- [ ] 创建开始面板 UI
- [ ] 实现练习信息展示
- [ ] 实现开始练习功能
- [ ] 根据年级显示不同风格

**API 接口**
```dart
POST /api/student/practice/{session_id}/begin
```

**AI 实现指导**
1. 创建 `lib/features/practice/session/presentation/pages/start_panel.dart`
2. 参考 Web 端的 `StartPanel.tsx`
3. 实现低年级（≤2年级）和高年级的不同 UI 风格

#### 5.3 题目展示组件

**任务清单**
- [ ] 创建题目卡片组件
- [ ] 实现题目内容展示
- [ ] 实现题目资源展示（图片/音频）
- [ ] 实现题目类型识别

**题目类型**
- `choice`: 选择题
- `judge`: 判断题
- `fill`: 填空题
- `oral`: 口语题

**AI 实现指导**
1. 创建 `lib/features/practice/session/presentation/widgets/question_card.dart`
2. 参考 Web 端的 `QuestionCard.tsx`
3. 使用 `cached_network_image` 加载图片

#### 5.4 答案输入组件

**任务清单**
- [ ] 实现文本输入（填空题）
- [ ] 实现选择题输入
- [ ] 实现判断题输入
- [ ] 实现语音输入（口语题）

**答案输入组件**
- `TextInput`: 文本输入
- `ChoiceInput`: 选择题（单选/多选）
- `JudgeInput`: 判断题（对/错）
- `AudioInput`: 语音录制

**AI 实现指导**
1. 创建 `lib/features/practice/session/presentation/widgets/answer_input/` 目录
2. 参考 Web 端的答案输入组件
3. 实现各种输入类型的 UI 和逻辑

#### 5.5 语音录制功能

**任务清单**
- [ ] 集成录音插件（record）
- [ ] 实现录音 UI 组件
- [ ] 实现录音权限请求
- [ ] 实现录音播放预览
- [ ] 实现录音上传
- [ ] 实现语音识别结果展示

**API 接口**
```dart
POST /api/student/practice/answer/{session_id}/{question_id}/upload
Body: FormData (audio_file)
Response: UploadRecordingResult
```

**AI 实现指导**
1. 创建 `lib/features/practice/session/presentation/widgets/audio_recorder.dart`
2. 使用 `record` 插件实现录音
3. 使用 `permission_handler` 请求麦克风权限
4. 参考 Web 端的 `AudioRecorder` 组件
5. 实现录音波形动画（可选）

#### 5.6 提交答案功能

**任务清单**
- [ ] 实现答案提交逻辑
- [ ] 实现答题耗时计算
- [ ] 实现提交结果展示
- [ ] 实现错误分析展示

**API 接口**
```dart
POST /api/student/practice/answer
Body: SubmitAnswerParams
Response: SubmitAnswerResponse
```

**AI 实现指导**
1. 在 SessionProvider 中实现 `submitAnswer` 方法
2. 计算从开始答题到提交的耗时
3. 处理提交结果（正确/错误）
4. 显示错误分析（如果答错）

#### 5.7 题目导航

**任务清单**
- [ ] 实现上一题/下一题导航
- [ ] 实现题目进度指示
- [ ] 实现题目跳转（可选）

**AI 实现指导**
1. 创建 `lib/features/practice/session/presentation/widgets/navigation_buttons.dart`
2. 创建 `lib/features/practice/session/presentation/widgets/progress_indicator.dart`
3. 参考 Web 端的导航组件

#### 5.8 完成练习

**任务清单**
- [ ] 实现完成练习功能
- [ ] 实现完成确认对话框
- [ ] 跳转到结果页面

**API 接口**
```dart
POST /api/student/practice/{session_id}/complete
Response: { report_id: number }
```

**AI 实现指导**
1. 在 SessionProvider 中实现 `completePractice` 方法
2. 显示确认对话框
3. 完成后跳转到报告页面

#### 5.9 结果展示

**任务清单**
- [ ] 创建结果展示页面
- [ ] 实现答题统计展示
- [ ] 实现动画效果（印章动画等）

**AI 实现指导**
1. 创建 `lib/features/practice/session/presentation/pages/result_panel.dart`
2. 参考 Web 端的 `ResultView.tsx` 和 `StampAnimation.tsx`
3. 实现庆祝动画（低年级）

---

### 阶段 6: 练习历史和详情（3-4 天）

#### 6.1 练习历史

**任务清单**
- [ ] 创建练习历史页面
- [ ] 实现历史记录列表
- [ ] 实现按类型筛选
- [ ] 实现跳转到详情

**API 接口**
```dart
GET /api/student/practice/history/{type}?limit=20
```

**AI 实现指导**
1. 创建 `lib/features/practice/history/presentation/pages/practice_history_page.dart`
2. 参考 Web 端的 `Practice/History/index.tsx`
3. 实现下拉刷新和上拉加载更多

#### 6.2 练习详情

**任务清单**
- [ ] 创建练习详情页面
- [ ] 实现题目列表展示
- [ ] 实现答案对比展示
- [ ] 实现错题标记

**API 接口**
```dart
GET /api/student/practice/detail/{session_id}
```

**AI 实现指导**
1. 创建 `lib/features/practice/detail/presentation/pages/practice_detail_page.dart`
2. 参考 Web 端的 `Practice/Detail/index.tsx`
3. 实现题目和答案的对比展示

#### 6.3 练习报告

**任务清单**
- [ ] 创建练习报告页面
- [ ] 实现报告数据展示
- [ ] 实现知识点掌握情况
- [ ] 实现学习建议展示

**AI 实现指导**
1. 创建 `lib/features/practice/report/presentation/pages/practice_report_page.dart`
2. 参考 Web 端的 `Practice/Report/index.tsx`
3. 实现数据可视化（图表）

---

### 阶段 7: 错题本（2-3 天）

#### 7.1 错题列表

**任务清单**
- [ ] 创建错题本页面
- [ ] 实现错题列表展示
- [ ] 实现筛选功能（已掌握/未掌握）
- [ ] 实现错题详情展示

**API 接口**
```dart
GET /api/student/wrong-records?mastered=0|1
```

**AI 实现指导**
1. 创建 `lib/features/wrong_records/presentation/pages/wrong_records_page.dart`
2. 参考 Web 端的 `WrongRecords/index.tsx`
3. 实现筛选和排序功能

#### 7.2 标记已掌握

**任务清单**
- [ ] 实现标记已掌握功能
- [ ] 实现确认对话框

**API 接口**
```dart
POST /api/student/wrong-records/{question_id}/master
```

**AI 实现指导**
1. 在错题本页面添加"标记已掌握"按钮
2. 调用 API 更新状态

---

### 阶段 8: 首页和导航（2-3 天）

#### 8.1 首页

**任务清单**
- [ ] 创建首页
- [ ] 实现欢迎卡片
- [ ] 实现快速入口（每日练习、单元练习、能力评测）
- [ ] 实现最近练习展示

**AI 实现指导**
1. 创建 `lib/features/home/presentation/pages/home_page.dart`
2. 参考 Web 端的 `Home/index.tsx`
3. 实现卡片式布局

#### 8.2 底部导航

**任务清单**
- [ ] 实现底部导航栏
- [ ] 配置导航路由

**导航项**
- 首页
- 练习
- 错题本
- 我的

**AI 实现指导**
1. 使用 `BottomNavigationBar` 或自定义组件
2. 集成到主布局中

---

### 阶段 9: 优化和测试（3-5 天）

#### 9.1 性能优化

**任务清单**
- [ ] 优化图片加载（使用缓存）
- [ ] 优化列表滚动性能
- [ ] 优化状态管理（减少不必要的重建）
- [ ] 实现懒加载

#### 9.2 错误处理

**任务清单**
- [ ] 统一错误处理
- [ ] 实现错误提示
- [ ] 实现网络错误重试

#### 9.3 UI/UX 优化

**任务清单**
- [ ] 优化加载状态
- [ ] 优化空状态展示
- [ ] 优化动画效果
- [ ] 实现下拉刷新

#### 9.4 测试

**任务清单**
- [ ] 单元测试（关键业务逻辑）
- [ ] Widget 测试（关键组件）
- [ ] 集成测试（关键流程）

---

## 📝 API 接口详细清单

### 认证相关

#### 登录
```dart
POST /api/student/login
Request: { phone: string, password: string }
Response: string (token)
```

#### 检查登录状态
```dart
GET /api/student/check
Headers: { x-access-token: string }
Response: string (student_id)
```

### 个人中心

#### 获取个人信息
```dart
GET /api/student/profile
Response: { student: Student, textbooks: Textbook[] }
```

### 教材相关

#### 获取单元列表
```dart
GET /api/student/textbook/{textbook_id}/units
Response: Unit[]
```

#### 获取知识点列表
```dart
GET /api/student/textbook/{unit_id}/knowledges
Response: Knowledge[]
```

### 练习相关

#### 获取每日练习
```dart
GET /api/student/practice/daily
Response: PracticeSession[]
```

#### 获取单元练习
```dart
GET /api/student/practice/unit
Response: PracticeSession[]
```

#### 获取能力评测
```dart
GET /api/student/practice/assessment
Response: PracticeSession[]
```

#### 创建练习
```dart
POST /api/student/practice/create
Request: { type: string, textbook_id: int, unit_id?: int }
Response: number (session_id)
```

#### 开始练习
```dart
POST /api/student/practice/{session_id}/begin
Response: void
```

#### 提交答案
```dart
POST /api/student/practice/answer
Request: {
  session_id: int,
  question_id: int,
  answer: string,
  time_spent: int,
  is_audio_answer?: bool,
  audio_data?: string,
  audio_match?: bool,
  audio_analysis?: string
}
Response: {
  is_correct: bool,
  correct_answer: string,
  user_answer?: string,
  analysis?: string,
  session_progress: {
    answer_count: int,
    correct_count: int,
    total_count: int,
    status: int
  }
}
```

#### 上传录音
```dart
POST /api/student/practice/answer/{session_id}/{question_id}/upload
Request: FormData { audio_file: File }
Response: {
  oss_path: string,
  transcription: string,
  match: bool,
  analysis: string
}
```

#### 完成练习
```dart
POST /api/student/practice/{session_id}/complete
Response: { report_id: int }
```

#### 获取练习详情
```dart
GET /api/student/practice/detail/{session_id}
Response: {
  session: PracticeSession,
  questions: Question[],
  answers: PracticeAnswer[],
  report?: PracticeReport
}
```

#### 获取练习历史
```dart
GET /api/student/practice/history/{type}?limit=20
Response: PracticeSession[]
```

### 错题本

#### 获取错题列表
```dart
GET /api/student/wrong-records?mastered=0|1
Response: PracticeWrongRecord[]
```

#### 标记已掌握
```dart
POST /api/student/wrong-records/{question_id}/master
Response: void
```

---

## 🎨 UI/UX 设计参考

### 设计原则
1. **一致性**: 与 Web 端保持视觉风格一致
2. **响应式**: 适配不同屏幕尺寸
3. **易用性**: 符合移动端操作习惯
4. **性能**: 流畅的动画和交互

### 颜色方案
参考 Web 端的 Tailwind 配置：
- Primary: Sky/Blue 色系
- Success: Emerald/Green 色系
- Warning: Amber/Yellow 色系
- Error: Red 色系

### 字体
- 中文: 系统默认字体
- 英文: Roboto (Material 默认)

### 组件风格
- 使用 Material 3 设计语言
- 圆角卡片设计
- 柔和的阴影效果
- 流畅的页面转场动画

---

## 🔧 开发规范

### 代码规范
1. 遵循 Dart 官方代码规范
2. 使用 `dart format` 格式化代码
3. 使用 `dart analyze` 检查代码质量

### 命名规范
- 文件: `snake_case.dart`
- 类: `PascalCase`
- 变量/函数: `camelCase`
- 常量: `UPPER_SNAKE_CASE`

### 状态管理规范
- 使用 Riverpod 管理全局状态
- 使用 `StateNotifier` 管理复杂状态
- 使用 `FutureProvider` 管理异步数据
- 避免过度使用 Provider，优先使用局部状态

### 错误处理规范
- 统一使用 try-catch 处理异常
- 使用 Result 类型处理可能失败的操作
- 提供友好的错误提示

### 测试规范
- 为核心业务逻辑编写单元测试
- 为关键组件编写 Widget 测试
- 为关键流程编写集成测试

---

## 📚 参考资料

### 项目文档
- Web 端学生端代码: `student/src/`
- 后端 API 文档: `server/student/routes/`
- 数据模型定义: `student/src/types/schema.d.ts`

### Flutter 官方文档
- [Flutter 官方文档](https://flutter.dev/docs)
- [Riverpod 文档](https://riverpod.dev/)
- [go_router 文档](https://pub.dev/packages/go_router)

### 相关插件文档
- [dio](https://pub.dev/packages/dio)
- [record](https://pub.dev/packages/record)
- [cached_network_image](https://pub.dev/packages/cached_network_image)

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有核心功能已实现
- [ ] 所有 API 接口已对接
- [ ] 错误处理完善
- [ ] 边界情况处理完善

### 性能要求
- [ ] 启动时间 < 3 秒
- [ ] 页面切换流畅（60 FPS）
- [ ] 列表滚动流畅
- [ ] 图片加载优化

### 用户体验
- [ ] UI 美观统一
- [ ] 交互流畅自然
- [ ] 错误提示友好
- [ ] 加载状态明确

### 代码质量
- [ ] 代码规范统一
- [ ] 注释完善
- [ ] 测试覆盖关键功能
- [ ] 无严重 Bug

---

## 🚀 快速开始指南

### 对于 AI 助手

当开始实现某个阶段时，请遵循以下步骤：

1. **阅读阶段任务清单**
   - 理解该阶段的目标和任务
   - 查看相关的 API 接口定义
   - 参考 Web 端的实现

2. **创建必要的文件**
   - 按照项目结构创建文件
   - 确保文件路径正确

3. **实现核心功能**
   - 先实现基础功能
   - 再添加优化和细节
   - 确保错误处理完善

4. **测试验证**
   - 测试功能是否正常
   - 检查边界情况
   - 验证 API 调用

5. **代码优化**
   - 优化性能
   - 优化代码结构
   - 添加必要注释

### 对于开发者

1. **环境准备**
   ```bash
   flutter --version  # 确保 Flutter 3.x
   cd mobile
   flutter pub get
   ```

2. **运行项目**
   ```bash
   flutter run
   ```

3. **代码生成**（如果使用代码生成）
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

---

## 📞 问题反馈

如果在开发过程中遇到问题：
1. 查看相关文档
2. 参考 Web 端实现
3. 检查后端 API 文档
4. 查看错误日志

---

**文档版本**: v1.0  
**最后更新**: 2024-12  
**维护者**: AI 开发团队

