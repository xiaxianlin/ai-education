# admin-web 重构后代码梳理

## 当前分层

- `src/index.tsx`: 应用入口，只负责挂载路由。
- `src/lib/router.tsx`: 路由表，所有后台页面统一挂在 `AdminLayout` 下。
- `src/layouts/AdminLayout.tsx`: 后台应用壳，负责侧边栏、顶部栏、角色导航可见性、主题切换和退出登录。
- `src/models/initialState.ts`: 全局初始化状态，包含当前管理员、系统配置、全局科目/年级筛选。
- `src/lib/api.ts`: 管理端 API 客户端和统一响应拦截。

## UI 组件边界

- `src/components/ui`: shadcn 风格基础组件层，包含 `Button`、`Card`、`Modal`、`DataTable`、`Field`、`Input`、`Select`、`Badge`、`PageShell` 等。
- `src/components`: 业务可复用组件层，只保留跨页面业务组件，例如 `SubjectGradeTabs`、`StatusTag`、`TextbookVersionSelect`、`UploadButton`、`DeleteButton`。
- 页面内专属 UI 放在对应页面目录的 `views` 或 `components` 下，避免提升到全局组件。

## 页面模块

- `Auth`: 登录、个人中心、修改密码、老师管理。
- `Home`: 后台工作台。
- `Ability`: 能力管理。
- `Textbook` / `TeacherBook` / `TextbookVersion`: 教材、教师用书和版本管理。
- `Question`: 题目、题型、题型配置、AI 生成调试。
- `Practice`: 练习列表、练习详情、进度和报告。
- `Student`: 学生列表、学生详情、学生教材配置。

## 页面约定

- `index.tsx`: 页面入口，只组合模型 Provider 和主视图。
- `models/page.ts`: 页面状态、请求、副作用和动作。
- `views/*.tsx`: 页面视图，尽量只处理渲染和轻交互。
- `components/*.tsx`: 页面私有组件。
- `api.ts`: 领域 API 封装。
- `types.d.ts`: 领域类型补充。

## 已清理项

- 删除旧的 `components/DescriptionList` 转发包装，统一使用 `components/ui` 中的 `DescriptionList`。
- 老师管理页改为复用 `Card`、`DataTable`、`Modal`、`Field`、`Input`、`Select`、`Button`。
- `Manager` 页面 action ref 改为 `TableActionRef`，创建和重置密码响应改为 `PasswordResponse`。
- 科目缓存 key 从历史拼写 `suject_cache` 迁移到 `subject_cache`，保留旧 key 读取兼容。
- 删除未使用的 AntD 风格 `ManagerTypeTagColor` 常量。

## 后续建议

- 逐步把 `window.confirm` 替换为统一确认弹窗组件，避免浏览器原生弹窗破坏后台风格。
- 继续收敛 `any`，优先处理详情页中的接口字段类型和学生掌握度表格类型。
- 将 `AudioPlayer` 的使用场景重新确认；如果题目资源不再需要音频预览，可以删除。
- `components/ui/index.tsx` 体积继续增长时，可拆分为 `button.tsx`、`table.tsx`、`modal.tsx` 等文件，并保持 `ui/index.ts` 作为出口。
