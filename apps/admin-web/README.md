# Admin 管理后台

AI 教育平台的管理后台系统，基于 Ant Design Pro 构建。

## 项目结构

```
admin/
├── src/
│   ├── components/          # 组件目录
│   │   ├── business/       # 业务组件
│   │   │   ├── PageHeader/        # 页面头部组件
│   │   │   ├── CommonTable/       # 通用表格组件
│   │   │   ├── FormModal/         # 表单弹窗组件
│   │   │   ├── DeleteButton/      # 删除按钮组件
│   │   │   ├── DetailCard/        # 详情卡片组件
│   │   │   └── DescriptionList/   # 描述列表组件
│   │   ├── ui/             # UI 组件
│   │   └── util/           # 工具组件
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useTableColumns.tsx    # 表格列配置
│   │   ├── useTableRequest.ts     # 表格请求处理
│   │   ├── useDelete.ts           # 删除操作
│   │   ├── useSimpleForm.ts       # 简单表单
│   │   └── useConfigs.ts          # 配置管理
│   ├── pages/              # 页面目录
│   │   ├── Home/           # 首页
│   │   ├── Login/          # 登录页
│   │   ├── Manager/        # 账号管理
│   │   ├── Student/        # 学生管理
│   │   ├── Question/       # 题目管理
│   │   ├── Task/           # 任务管理
│   │   └── Textbook/       # 教材管理
│   ├── services/           # API 服务
│   ├── utils/              # 工具函数
│   │   ├── format.ts       # 格式化工具
│   │   ├── time.ts         # 时间工具
│   │   ├── tag.tsx         # 标签渲染工具
│   │   └── validation.ts   # 验证工具
│   ├── constants/          # 常量定义
│   └── assets/             # 静态资源
├── rsbuild.config.ts      # Rsbuild 配置文件
├── types/                  # 类型定义
├── COMPONENT_GUIDE.md      # 组件使用指南
├── OPTIMIZATION_REPORT.md  # 优化报告
└── package.json
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 核心功能

### 1. 账号管理
- 管理员账号的增删改查
- 账号状态管理
- 密码重置

### 2. 学生管理
- 学生信息管理
- 教材分配
- 练习记录查看
- 学习数据统计

### 3. 题目管理
- 题目的增删改查
- 题目资源管理（图片、音频）
- 题目分类和筛选

### 4. 教材管理
- 教材信息管理
- 单元管理
- 知识点管理

### 5. 任务管理
- 异步任务监控
- 任务状态查看
- 任务进度跟踪

## 技术栈

- **框架**: React 18 + React Router 6
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: ahooks
- **HTTP 客户端**: axios
- **构建工具**: Rsbuild
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript 5

## 开发指南

### 组件使用

项目提供了一套完整的通用组件库，详见 [组件使用指南](./COMPONENT_GUIDE.md)。

**常用组件**:
- `PageHeader` - 页面头部
- `CommonTable` - 通用表格
- `FormModal` - 表单弹窗
- `DeleteButton` - 删除按钮
- `DetailCard` - 详情卡片
- `DescriptionList` - 描述列表

### Hooks 使用

**常用 Hooks**:
- `useDelete` - 删除操作
- `useTableRequest` - 表格请求
- `createTimeColumn` - 时间列配置
- `createStatusColumn` - 状态列配置

### 代码示例

#### 列表页面

```tsx
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { CommonTable, DeleteButton } from '@/components';
import { createTimeColumn, useDelete } from '@/hooks';

export default function ListPage() {
  const actionRef = useRef<any>();
  const { handleDelete } = useDelete(Api.delete, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const columns: ProColumns<Entity>[] = [
    { title: '名称', dataIndex: 'name' },
    createTimeColumn<Entity>('创建时间', 'create_time'),
    {
      title: '操作',
      render: (_, record) => (
        <DeleteButton onConfirm={() => handleDelete(record.id)} />
      ),
    },
  ];

  return (
    <PageContainer title="列表页">
      <CommonTable
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const res = await Api.search(params);
          return { data: res.data, total: res.total, success: true };
        }}
      />
    </PageContainer>
  );
}
```

#### 详情页面

```tsx
import { PageContainer } from '@ant-design/pro-components';
import { PageHeader, DetailCard, DescriptionList } from '@/components';

export default function DetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<Entity>();

  return (
    <PageContainer title={<PageHeader title="详情页" />}>
      <DetailCard title="基本信息">
        <DescriptionList
          items={[
            { label: '名称', value: data?.name },
            { label: '创建时间', value: formatDateTime(data?.create_time) },
          ]}
        />
      </DetailCard>
    </PageContainer>
  );
}
```

## 代码规范

### 命名规范

- **组件**: PascalCase (如 `PageHeader`)
- **文件**: kebab-case (如 `page-header.tsx`)
- **变量/函数**: camelCase (如 `handleDelete`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **类型**: PascalCase (如 `StudentForm`)

### 目录规范

- 页面组件放在 `pages/` 目录
- 业务组件放在 `components/business/` 目录
- UI 组件放在 `components/ui/` 目录
- 工具函数放在 `utils/` 目录
- 自定义 Hooks 放在 `hooks/` 目录

### 导入顺序

```tsx
// 1. React 相关
import { useState, useEffect } from 'react';

// 2. 第三方库
import { Button, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';

// 3. 项目内部
import { CommonTable } from '@/components';
import { useDelete } from '@/hooks';
import { StudentApi } from '@/services/student';

// 4. 类型定义
import type { Student } from '@/types';

// 5. 样式文件
import './index.less';
```

## 性能优化

### 1. 组件优化
- 使用 `useMemo` 缓存列配置
- 使用 `useCallback` 缓存回调函数
- 避免在渲染函数中创建新对象

### 2. 请求优化
- 使用 `ahooks` 的 `useRequest` 管理请求状态
- 合理使用请求缓存
- 避免重复请求

### 3. 打包优化
- 代码分割
- 按需加载
- 资源压缩

## 项目优化

本项目经过系统性优化，详见 [优化报告](./OPTIMIZATION_REPORT.md)。

**优化成果**:
- 新增 6 个通用组件
- 新增 9 个工具函数和 Hooks
- 优化 6 个页面
- 代码减少 30-40%
- 开发效率提升 50%

## 常见问题

### 1. 如何添加新页面？

1. 在 `pages/` 目录创建页面组件
2. 在 `src/lib/router.tsx` 添加路由配置
3. 使用通用组件快速开发

### 2. 如何添加新的 API？

1. 在 `services/` 目录创建 API 文件
2. 定义 API 函数
3. 在 `types/` 目录添加类型定义

### 3. 如何自定义主题？

修改 `rsbuild.config.ts` 中的相关配置，或使用 Ant Design 的主题定制功能。

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT

## 联系方式

如有问题，请联系项目维护者。
