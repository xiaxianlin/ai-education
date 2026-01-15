# 学生端 Web - Agent 配置

## 应用概述
小学生练习系统的学生 PC 端应用，基于 React 18 + Rsbuild + shadcn/ui + Tailwind CSS 构建。

## 技术栈
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: unstated-next + ahooks
- **路由**: react-router-dom
- **HTTP 客户端**: Axios（封装于 `@ai-education/shared-web` 的 `ApiClient`）
- **样式**: Tailwind CSS
- **语言**: TypeScript 5

## 项目结构

```
src/
├── components/                   # 组件库
│   ├── business/                # 业务组件
│   ├── ui/                      # UI 基础组件 (shadcn/ui)
│   └── theme-provider.tsx       # 主题提供者
├── hooks/                        # 共享 Hooks
├── lib/                          # 工具库
├── models/                       # 全局状态
├── pages/                        # 页面模块
├── layouts/                      # 布局组件
└── constants/                    # 常量定义
```

## 功能模块

### 登录 (Login)
- **登录页**: `pages/Login/index.tsx`

### 首页 (Home)
- **首页**: `pages/Home/index.tsx`
- **组件**: WelcomeCard, QuickActions, PracticeCard

### 练习模块 (Practice)
| 页面 | 路径 | 说明 |
|------|------|------|
| 能力练习 | `PracticeAbility/` | 基于能力的能力练习，展示当前设置学科的能力列表 |
| 单元练习 | `PracticeUnit/` | 选择教材单元进行练习 |
| 练习会话 | `PracticeSession/` | 答题页面，核心交互模块 |
| 练习结果 | `PracticeResult/` | 练习完成后的结果查看 |
| 练习记录 | `PracticeRecord/` | 历史练习记录 |

**能力练习 (Ability) 核心组件：**
| 组件 | 说明 |
|------|------|
| `AbilityPracticeCard` | 能力卡片，展示能力信息并支持创建练习 |

**练习会话 (Session) 核心组件：**
| 组件 | 说明 |
|------|------|
| `QuestionCard` | 题目卡片 |
| `AnswerCard` | 答案展示 |
| `AnswerAnalysis` | 答案解析 |
| `ProgressIndicator` | 进度指示器 |
| `AnswerForm/` | 答题表单（ChoiceInput, TextInput, AudioInput, JudgeInput） |
| `LowerGradeReadyPanel` | 低年级准备面板 |
| `UpperGradeReadyPanel` | 高年级准备面板 |

**练习会话视图：**
| 视图 | 说明 |
|------|------|
| `ReadyView` | 准备开始（根据年级显示不同风格） |
| `ProcessingView` | 答题进行中 |
| `ResultView` | 练习结果 |
| `SettlementView` | 结算页面 |
| `EmptyView` | 空状态/错误状态 |

**练习会话状态管理：**
- 使用 `PracticeSessionModel` 管理页面级状态
- 状态类型：`LOADING`（加载中/生成中）、`READY`（准备开始）、`PROCESSING`（答题中）、`SETTLEMENT`（结算中）、`RESULT`（已完成）、`EMPTY`（错误/空状态）
- 状态判断：首先检查 `generate_status`（生成状态），然后检查 `status`（会话状态）

### 个人中心 (Profile)
- **个人页**: `pages/Profile/index.tsx`

### 设置 (Settings)
- **设置页**: `pages/Settings/index.tsx`
- **组件**: TextbookCard（教材配置）

### 错题记录 (WrongRecords)
- **错题页**: `pages/WrongRecords/index.tsx`

## 组件库

### 业务组件 (components/business)
| 组件 | 说明 |
|------|------|
| `AudioPlayer` | 音频播放器 |
| `AudioRecorder` | 语音录制 |
| `Header` | 页面头部 |
| `LoadingSpinner` | 加载动画 |
| `ModeToggle` | 主题切换 |
| `SubjectTab` | 科目选项卡 |

### UI 组件 (components/ui)
基于 shadcn/ui 的组件：
- `alert`, `badge`, `button`, `card`, `dialog`
- `dropdown`, `input`, `progress`, `separator`
- `skeleton`, `tabs`, `toast`

## 共享 Hooks

| Hook | 说明 |
|------|------|
| `useCreatePractice` | 创建练习会话 |
| `useFormValidation` | 表单验证 |
| `useGradeTheme` | 年级主题样式 |
| `useOnce` | 只执行一次 |

## 开发原则

### React 最佳实践
1. 使用函数式组件和 Hooks
2. 使用 `React.memo`、`useMemo`、`useCallback` 优化性能
3. 遵循 React Hooks 规则
4. 组件保持单一职责

### UI 组件规范
1. 使用 shadcn/ui 组件库保持 UI 一致性
2. 使用 Tailwind CSS 进行样式设计
3. 确保响应式设计和移动端适配
4. 考虑可访问性 (a11y)

### 状态管理
1. 全局/页面级状态使用 `unstated-next` 的 `createContainer`
2. 异步操作使用 `ahooks` 的 `useRequest`
3. 从全局 Model 获取数据，计算派生状态

### 页面编码规范

#### 目录结构
```
pages/[Feature]/[PageName]/
├── index.tsx                    # 页面入口
├── models/
│   └── PageModel.ts            # 页面级状态管理
├── views/
│   └── Main.tsx                # 主视图组件
├── hooks/
│   └── use[PageName]Hook.ts    # 业务逻辑 Hook
└── components/
    └── [ComponentName]/
        ├── index.tsx           # 组件入口
        ├── types.ts            # 类型定义
        └── [SubComponent].tsx  # 子组件
```

#### 导入顺序
1. React 相关
2. 第三方库（ahooks, react-router-dom 等）
3. 业务组件（@/components/business）
4. UI 组件（@/components/ui）
5. 类型定义
6. 工具函数/常量（@/lib, @/constants）

### API 调用
- Web 端请求通过 `@ai-education/shared-web` 的 `ApiClient`（内部基于 Axios）
- API 统一封装在 `src/lib/api.ts` 中的 `studentApi`
- 新增/修改接口优先在这里集中维护
- 认证 Token 存储在 `localStorage`，key 为 `_token_`（`ApiClient` 默认值）
- API 响应格式：`{ status: 0, message: "ok", data: T }`，`ApiClient` 会自动提取 `data` 字段
- **重要**: `ApiClient.get()` 方法的第二个参数是查询参数字典，直接传递对象，不要嵌套在 `params` 字段中
  ```typescript
  // ✅ 正确
  apiClient.get("/ability/atomics", { subject, grade })
  
  // ❌ 错误
  apiClient.get("/ability/atomics", { params: { subject, grade } })
  ```

## 注意事项

1. **类型安全**: 充分利用 TypeScript 类型系统
2. **错误处理**: 所有 API 调用必须有错误处理
3. **加载状态**: 使用适当的加载状态提示
4. **用户体验**: 关注交互反馈和动画效果
5. **CSS 动画**: 使用内联样式定义动画时，确保动画已在 CSS 中定义，或使用已定义的动画类（如 `animate-springy`）
6. **可选链访问**: 访问嵌套对象属性时，确保使用完整的可选链（如 `obj?.prop?.subProp`），避免在中间属性为 undefined 时访问导致错误
7. **状态检查**: 在判断练习会话状态时，需要同时检查 `generate_status`（生成状态）和 `status`（会话状态）

## 相关资源

- 后端 API: `apps/server/student/routes/`
- 共享类型: `packages/shared-web/src/types/`
- shadcn/ui: `https://ui.shadcn.com/`
