# Admin 性能优化指南

本文档提供 admin 项目的性能优化最佳实践和技巧。

## 目录

- [React 性能优化](#react-性能优化)
- [表格性能优化](#表格性能优化)
- [请求优化](#请求优化)
- [打包优化](#打包优化)
- [监控和分析](#监控和分析)

---

## React 性能优化

### 1. 使用 useMemo 缓存计算结果

**问题**: 每次渲染都重新计算列配置

```tsx
// ❌ 不好的做法
export default function ListPage() {
  const columns = [
    { title: '名称', dataIndex: 'name' },
    createTimeColumn('创建时间', 'create_time'),
  ];
  
  return <CommonTable columns={columns} />;
}
```

**解决方案**: 使用 useMemo 缓存

```tsx
// ✅ 好的做法
export default function ListPage() {
  const columns = useMemo(() => [
    { title: '名称', dataIndex: 'name' },
    createTimeColumn('创建时间', 'create_time'),
  ], []);
  
  return <CommonTable columns={columns} />;
}
```

### 2. 使用 useCallback 缓存回调函数

**问题**: 每次渲染都创建新的函数引用

```tsx
// ❌ 不好的做法
export default function ListPage() {
  return (
    <CommonTable
      request={async (params) => {
        const res = await Api.search(params);
        return { data: res.data, total: res.total };
      }}
    />
  );
}
```

**解决方案**: 使用 useCallback 缓存

```tsx
// ✅ 好的做法
export default function ListPage() {
  const handleRequest = useCallback(async (params) => {
    const res = await Api.search(params);
    return { data: res.data, total: res.total };
  }, []);
  
  return <CommonTable request={handleRequest} />;
}
```

### 3. 避免在渲染函数中创建对象

**问题**: 每次渲染都创建新对象

```tsx
// ❌ 不好的做法
<CommonTable
  search={{ labelWidth: 'auto', layout: 'inline' }}
/>
```

**解决方案**: 提取到组件外部或使用 useMemo

```tsx
// ✅ 好的做法 1: 提取到组件外部
const SEARCH_CONFIG = {
  labelWidth: 'auto',
  layout: 'inline',
};

export default function ListPage() {
  return <CommonTable search={SEARCH_CONFIG} />;
}

// ✅ 好的做法 2: 使用 useMemo
export default function ListPage() {
  const searchConfig = useMemo(() => ({
    labelWidth: 'auto',
    layout: 'inline',
  }), []);
  
  return <CommonTable search={searchConfig} />;
}
```

### 4. 使用 React.memo 优化组件

**适用场景**: 组件接收的 props 不经常变化

```tsx
// ✅ 使用 React.memo
export const DetailCard = React.memo(({ title, children }) => {
  return (
    <Card title={title}>
      {children}
    </Card>
  );
});
```

### 5. 避免不必要的状态更新

**问题**: 状态更新导致不必要的重渲染

```tsx
// ❌ 不好的做法
const [data, setData] = useState([]);

useEffect(() => {
  fetchData().then(res => {
    setData(res.data); // 即使数据相同也会更新
  });
}, []);
```

**解决方案**: 比较数据后再更新

```tsx
// ✅ 好的做法
const [data, setData] = useState([]);

useEffect(() => {
  fetchData().then(res => {
    if (JSON.stringify(data) !== JSON.stringify(res.data)) {
      setData(res.data);
    }
  });
}, [data]);
```

---

## 表格性能优化

### 1. 虚拟滚动

**适用场景**: 大数据量表格（>1000 条）

```tsx
import { ProTable } from '@ant-design/pro-components';

<ProTable
  virtual
  scroll={{ y: 600 }}
  // ... 其他配置
/>
```

### 2. 分页优化

**最佳实践**: 合理设置每页条数

```tsx
// ✅ 推荐配置
<CommonTable
  pagination={{
    defaultPageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }}
/>
```

### 3. 列宽优化

**问题**: 未设置列宽导致表格重新计算

```tsx
// ❌ 不好的做法
const columns = [
  { title: '名称', dataIndex: 'name' },
  { title: '描述', dataIndex: 'description' },
];
```

**解决方案**: 为所有列设置宽度

```tsx
// ✅ 好的做法
const columns = [
  { title: '名称', dataIndex: 'name', width: 120 },
  { title: '描述', dataIndex: 'description', width: 200 },
];
```

### 4. 搜索防抖

**适用场景**: 实时搜索

```tsx
import { useDebounceFn } from 'ahooks';

export default function ListPage() {
  const { run: handleSearch } = useDebounceFn(
    (value) => {
      actionRef.current?.reload();
    },
    { wait: 500 }
  );
  
  return (
    <CommonTable
      search={{
        onSearch: handleSearch,
      }}
    />
  );
}
```

---

## 请求优化

### 1. 使用 useRequest 管理请求状态

**优势**: 自动管理 loading、error 状态，支持缓存

```tsx
import { useRequest } from 'ahooks';

export default function DetailPage() {
  const { data, loading, error } = useRequest(
    () => Api.getDetail(id),
    {
      cacheKey: `detail-${id}`,
      staleTime: 5000, // 5秒内使用缓存
    }
  );
  
  if (loading) return <Spin />;
  if (error) return <Alert message="加载失败" />;
  
  return <DetailCard data={data} />;
}
```

### 2. 请求合并

**适用场景**: 多个组件需要相同的数据

```tsx
// ✅ 使用 SWR 或 React Query 实现请求合并
import { useRequest } from 'ahooks';

// 多个组件调用相同的请求，只会发送一次
const { data } = useRequest(
  () => Api.getConfig(),
  { cacheKey: 'global-config' }
);
```

### 3. 并行请求

**适用场景**: 多个独立的请求

```tsx
// ✅ 使用 Promise.all 并行请求
const loadData = async () => {
  const [students, textbooks, questions] = await Promise.all([
    StudentApi.list(),
    TextbookApi.list(),
    QuestionApi.list(),
  ]);
  
  return { students, textbooks, questions };
};
```

### 4. 请求取消

**适用场景**: 组件卸载时取消请求

```tsx
import { useRequest } from 'ahooks';

export default function ListPage() {
  const { data, loading } = useRequest(
    () => Api.search(params),
    {
      ready: !!params, // 参数准备好才请求
      refreshDeps: [params], // 参数变化时重新请求
    }
  );
}
```

---

## 打包优化

### 1. 代码分割

**配置路由懒加载**:

```tsx
// config/routes.ts
export default [
  {
    path: '/student',
    component: '@/pages/Student/List',
    // 自动代码分割
  },
];
```

**手动代码分割**:

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default function Page() {
  return (
    <Suspense fallback={<Spin />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 2. 按需加载

**Ant Design 按需加载** (已自动配置):

```tsx
// 只导入需要的组件
import { Button, Table } from 'antd';
```

**图标按需加载**:

```tsx
// ✅ 好的做法
import { UserOutlined } from '@ant-design/icons';

// ❌ 不好的做法
import * as Icons from '@ant-design/icons';
```

### 3. 依赖优化

**分析打包体积**:

```bash
# 分析打包体积
pnpm run analyze
```

**优化大依赖**:

```tsx
// ❌ 导入整个 lodash
import _ from 'lodash';

// ✅ 只导入需要的函数
import debounce from 'lodash/debounce';
```

### 4. 资源压缩

**图片优化**:
- 使用 WebP 格式
- 压缩图片大小
- 使用 CDN

**代码压缩** (已自动配置):
- JavaScript 压缩
- CSS 压缩
- HTML 压缩

---

## 监控和分析

### 1. React DevTools Profiler

**使用步骤**:
1. 安装 React DevTools
2. 打开 Profiler 标签
3. 录制性能数据
4. 分析渲染时间

### 2. Chrome DevTools

**Performance 面板**:
- 录制页面加载过程
- 分析 JavaScript 执行时间
- 查找性能瓶颈

**Network 面板**:
- 查看请求时间
- 分析资源大小
- 优化加载顺序

### 3. Lighthouse

**使用方法**:
```bash
# 运行 Lighthouse
lighthouse http://localhost:8000 --view
```

**关注指标**:
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- TTI (Time to Interactive)
- CLS (Cumulative Layout Shift)

### 4. 性能监控

**添加性能监控**:

```tsx
// src/utils/performance.ts
export const reportWebVitals = (metric) => {
  console.log(metric);
  // 发送到分析服务
};

// src/app.tsx
import { reportWebVitals } from './utils/performance';

export function onRouteChange() {
  reportWebVitals({
    name: 'route-change',
    value: performance.now(),
  });
}
```

---

## 性能检查清单

### 开发阶段
- [ ] 使用 useMemo 缓存列配置
- [ ] 使用 useCallback 缓存回调函数
- [ ] 避免在渲染函数中创建对象
- [ ] 为表格列设置固定宽度
- [ ] 使用虚拟滚动处理大数据
- [ ] 实现搜索防抖
- [ ] 使用 useRequest 管理请求

### 构建阶段
- [ ] 启用代码分割
- [ ] 按需加载组件和图标
- [ ] 优化依赖包大小
- [ ] 压缩图片资源
- [ ] 启用 Gzip 压缩

### 部署阶段
- [ ] 使用 CDN 加速静态资源
- [ ] 启用浏览器缓存
- [ ] 配置 HTTP/2
- [ ] 实施性能监控

---

## 性能优化案例

### 案例 1: 优化大数据表格

**问题**: 1000+ 条数据渲染卡顿

**解决方案**:
```tsx
<CommonTable
  virtual // 启用虚拟滚动
  scroll={{ y: 600 }}
  pagination={{
    defaultPageSize: 50,
    showSizeChanger: true,
  }}
  columns={useMemo(() => columns, [])} // 缓存列配置
/>
```

**效果**: 渲染时间从 2s 降低到 200ms

### 案例 2: 优化详情页加载

**问题**: 详情页加载慢

**解决方案**:
```tsx
// 并行加载数据
const loadData = async () => {
  const [basic, records, stats] = await Promise.all([
    Api.getBasic(id),
    Api.getRecords(id),
    Api.getStats(id),
  ]);
  return { basic, records, stats };
};

// 使用缓存
const { data } = useRequest(
  () => loadData(),
  { cacheKey: `detail-${id}`, staleTime: 10000 }
);
```

**效果**: 加载时间从 1.5s 降低到 500ms

### 案例 3: 优化打包体积

**问题**: 打包体积过大（2MB+）

**解决方案**:
1. 按需加载图标
2. 移除未使用的依赖
3. 启用代码分割
4. 压缩图片资源

**效果**: 打包体积从 2.1MB 降低到 800KB

---

## 总结

性能优化是一个持续的过程，需要：

1. **开发时注意**: 遵循最佳实践，避免常见问题
2. **定期检查**: 使用工具分析性能瓶颈
3. **持续优化**: 根据监控数据不断改进
4. **权衡取舍**: 在性能和开发效率之间找到平衡

记住：**过早优化是万恶之源，但忽视性能同样危险**。
