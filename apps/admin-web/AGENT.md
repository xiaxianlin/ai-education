# Admin Web UI 说明

后台管理端 UI 已迁出 Ant Design / Ant Design Pro / ProLayout 架构，统一采用本地 shadcn-admin 风格的组件体系与 Tailwind CSS 实现。

## UI 架构

- 全局布局使用 `src/layouts/AdminLayout.tsx`，提供侧栏、顶部栏、主题切换、用户菜单和内容区。
- 基础 UI 能力集中在 `src/components/ui/`，包括 `Button`、`Card`、`Badge`、`Modal`、`DataTable`、`PageShell`、`Input`、`Select`、`Textarea`、`Field`、`Switch`、`Rating`、`Spinner`、`EmptyState` 和 `toast`。
- 页面内容优先使用 `PageShell` 作为页面容器，使用 `Card` 承载分组内容，使用 `DataTable` 展示表格数据。
- 全局主题 token 在 `src/index.less` 和 `tailwind.config.cjs` 中维护，支持 light / dark 模式。

## UI 开发约定

- 不再新增 `antd`、`@ant-design/icons`、`@ant-design/pro-components`、`antd-style` 相关依赖或 import。
- 不使用 `ProLayout`、`PageContainer`、`ProTable`、`ModalForm`、`ProForm`、`FooterToolbar`。
- 新增页面应复用 `src/components/ui/` 和已有共享组件，不为单页重复造一套 UI 基础件。
- 表单使用本地 `Field` + `Input` / `Select` / `Textarea` / `Switch` / `Rating` 组合。
- 操作反馈使用 `src/components/ui/toast`。
- 删除、重置等危险操作可先使用原生 `window.confirm`，后续如需更强体验再统一升级确认弹层。

## 视觉风格

- 保持 shadcn-admin 风格：轻边框、低阴影、紧凑间距、清晰层级、8px 以内圆角。
- 页面首屏应直接呈现后台工作界面，不做营销式 landing page。
- 操作按钮优先使用 icon + 文本；纯图标按钮需有明确语义。
- 卡片仅用于具体内容分组、表格容器、弹层等，不做过度嵌套。
- 移动端布局需要自然换行，避免文本溢出或控件重叠。
