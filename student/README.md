# Student Project

一个使用现代技术栈构建的 React 应用。

## 技术栈

- **React 18** - UI 框架
- **Rsbuild** - 构建工具
- **TanStack Router** - 路由管理
- **TanStack Query** - 数据获取和状态管理
- **Zustand** - 状态管理
- **shadcn/ui** - UI 组件库
- **Tailwind CSS** - 样式框架

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口: 7030)
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 项目结构

```
student/
├── src/
│   ├── components/    # React 组件
│   │   └── ui/        # shadcn/ui 组件
│   ├── lib/           # 工具函数
│   ├── pages/         # 页面组件
│   ├── stores/        # Zustand stores
│   ├── index.tsx      # 应用入口
│   └── index.css      # 全局样式
├── rsbuild.config.ts  # Rsbuild 配置
├── tailwind.config.js # Tailwind 配置
└── tsconfig.json      # TypeScript 配置
```

