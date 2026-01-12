# 管理端前端 - Agent 配置

## 应用概述
管理后台前端应用，基于 React 18 + Rsbuild + Ant Design 5 构建。

## 技术栈
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: ahooks + unstated-next
- **HTTP 客户端**: Axios
- **样式**: Less + Tailwind CSS
- **语言**: TypeScript 5

## 功能模块

### 认证与管理员 (Auth)
- **登录**: `pages/Auth/Login/` - 管理员登录页面
- **管理员管理**: `pages/Auth/Manager/` - 管理员账号管理
- **密码修改**: `pages/Auth/Password/` - 修改密码
- **个人资料**: `pages/Auth/Profile/` - 管理员个人资料

### 首页 (Home)
- **首页**: `pages/Home/` - 管理后台首页

### 教材管理 (Textbook)
- **教材列表**: `pages/Textbook/List/` - 教材CRUD操作
- **教材详情**: `pages/Textbook/Detail/` - 教材详情、单元管理、知识点管理

### 教师参考书管理 (TeacherBook)
- **参考书列表**: `pages/TeacherBook/List/` - 教师参考书CRUD
- **参考书详情**: `pages/TeacherBook/Detail/` - 参考书详情

### 题目管理 (Question)
- **题目列表**: `pages/Question/List/` - 题目CRUD操作
- **题目详情**: `pages/Question/Detail/` - 题目详情查看
- **题目表单**: `pages/Question/Form/` - 题目编辑表单
- **题型管理**: `pages/Question/Type/` - 题型配置管理（包含AI生成指令）

### 能力管理 (Ability)
- **能力列表**: `pages/Ability/AbilityList/` - 能力域CRUD操作
- **能力详情**: `pages/Ability/AbilityDetail/` - 能力域详情、原子能力管理

### 练习管理 (Practice)
- **练习列表**: `pages/Practice/List/` - 练习类型管理
- **练习配置**: `pages/Practice/Config/` - 练习参数配置（JSON编辑）
- **练习Prompt**: `pages/Practice/Prompt/` - 练习与Prompt关联配置

### 学生管理 (Student)
- **学生列表**: `pages/Student/List/` - 学生CRUD操作
- **学生详情**: `pages/Student/Detail/` - 学生信息、教材配置、练习配置
- **练习会话列表**: `pages/Student/PracticeSessionList/` - 学生练习会话查看
- **练习会话详情**: `pages/Student/PraticeSessionDetail/` - 练习答题详情

## 共享组件

| 组件名 | 说明 |
|--------|------|
| `AudioPlayer` | 音频播放器组件 |
| `DeleteButton` | 带确认的删除按钮 |
| `DescriptionList` | 描述列表组件 |
| `DetailCard` | 详情卡片组件 |
| `PageHeader` | 页面头部组件 |
| `PromptDisplay` | 提示词展示组件（支持编辑、优化功能） |
| `StatusTag` | 状态标签组件 |
| `SubjectGradeTabs` | 科目年级选项卡 |
| `UploadButton` | 文件上传按钮 |

## 共享 Hooks

| Hook 名 | 说明 |
|---------|------|
| `useConfigs` | 配置数据获取（科目、年级、题型等） |
| `useDelete` | 通用删除操作 |
| `useSimpleForm` | 简单表单状态管理 |
| `useTableColumns` | 表格列配置生成 |

## 开发原则

### React 最佳实践
1. 使用函数式组件和 Hooks
2. 使用 `React.memo`、`useMemo`、`useCallback` 优化性能
3. 遵循 React Hooks 规则
4. 组件保持单一职责

### Ant Design 使用规范
1. 优先使用 Ant Design 和 Ant Design Pro 组件
2. 保持设计系统一致性
3. 使用 `PageContainer` 包裹页面内容
4. 使用 `ProTable`、`ProForm` 等高级组件

### 状态管理
1. 页面级状态使用 `unstated-next` 的 `createContainer`
2. 异步操作使用 `ahooks` 的 `useRequest`
3. 从全局 Model 获取数据，计算派生状态

### 页面编码规范

#### 目录结构
```
pages/[Feature]/[PageName]/
├── index.tsx                    # 页面入口
├── models/
│   └── page.ts                 # 页面级状态管理
├── views/
│   └── Main.tsx                # 主视图组件
├── hooks/
│   └── use[PageName]Hook.ts    # 业务逻辑 Hook
└── components/
    └── [ComponentName]/
        ├── index.tsx           # 组件入口
        └── [SubComponent].tsx  # 子组件
```

#### 导入顺序
1. React 相关
2. 第三方库（ahooks, antd 等）
3. Ant Design Pro 组件
4. 业务组件
5. UI 组件（antd）
6. 类型定义
7. 工具函数/常量

### API 调用
- Web 端请求通过 `@ai-education/shared-web` 的 `ApiClient`（内部基于 Axios）
- 基础 API 客户端：`src/lib/api.ts` 中的 `apiClient`（基于 `ApiClient`）和 `CommonApi`（通用接口如 `check`、`getConfigs`）
- 业务模块 API：按模块拆分到各业务目录下的 `api.ts`（如 `TextbookApi`、`StudentApi`、`PracticeApi`、`QuestionApi`、`TeacherBookApi`、`AuthApi`、`AbilityApi`）
- 新增/修改接口优先在对应模块的 `api.ts` 中维护
- 认证 Token 存储在 `localStorage`，key 为 `_token_`（`ApiClient` 默认值）
- API 响应格式：`{ status: 0, message: "ok", data: T }`，`ApiClient` 会自动提取 `data` 字段

## 注意事项

1. **类型安全**: 充分利用 TypeScript 类型系统
2. **错误处理**: 所有 API 调用必须有错误处理
3. **加载状态**: 使用 `useRequest` 的 `loading` 状态
4. **权限控制**: 实现适当的权限检查
5. **响应式设计**: 考虑不同屏幕尺寸

## 相关资源

- 后端 API: `apps/server/admin/`
- 共享类型: `packages/shared-web/src/types/`
- Ant Design Pro: `https://pro.ant.design/`
