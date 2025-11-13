# Admin 通用组件使用指南

本文档详细介绍 admin 项目中所有通用组件和工具函数的使用方法。

## 目录

- [业务组件](#业务组件)
  - [PageHeader](#pageheader)
  - [CommonTable](#commontable)
  - [FormModal](#formmodal)
  - [DeleteButton](#deletebutton)
  - [DetailCard](#detailcard)
  - [DescriptionList](#descriptionlist)
- [工具函数](#工具函数)
  - [表格列配置](#表格列配置)
  - [标签渲染](#标签渲染)
- [Hooks](#hooks)
  - [useDelete](#usedelete)
  - [useTableRequest](#usetablerequest)

---

## 业务组件

### PageHeader

统一的页面头部组件，包含返回按钮和标题。

**位置**: `src/components/business/PageHeader/index.tsx`

**Props**:
```typescript
interface PageHeaderProps {
  title: string;        // 页面标题
  onBack?: () => void;  // 自定义返回逻辑（可选）
}
```

**使用示例**:
```tsx
import { PageHeader } from '@/components/business';
import { PageContainer } from '@ant-design/pro-components';

<PageContainer title={<PageHeader title="学生详情" />}>
  {/* 页面内容 */}
</PageContainer>

// 自定义返回逻辑
<PageContainer 
  title={
    <PageHeader 
      title="学生详情" 
      onBack={() => history.push('/student')} 
    />
  }
>
  {/* 页面内容 */}
</PageContainer>
```

---

### CommonTable

封装了常用配置的 ProTable 组件。

**位置**: `src/components/business/CommonTable/index.tsx`

**Props**: 继承 ProTable 的所有 props，并预设了以下配置：
- `bordered`: true
- `scroll`: { x: 'max-content' }
- `options`: false
- `toolbar.settings`: []

**额外 Props**:
```typescript
interface CommonTableProps {
  enableSettings?: boolean;  // 是否启用设置按钮，默认 false
}
```

**使用示例**:
```tsx
import { CommonTable } from '@/components/business';

<CommonTable<Student>
  actionRef={actionRef}
  rowKey="id"
  columns={columns}
  request={async (params) => {
    const res = await StudentApi.search(params);
    return {
      data: res.data,
      total: res.total,
      success: true,
    };
  }}
  search={{ labelWidth: 'auto' }}
/>
```

---

### FormModal

封装了常用配置的 ModalForm 组件。

**位置**: `src/components/business/FormModal/index.tsx`

**Props**:
```typescript
interface FormModalProps<T> {
  form: FormInstance<T>;      // 表单实例
  visible: boolean;           // 是否显示
  onCancel: () => void;       // 取消回调
  isEdit?: boolean;           // 是否为编辑模式
  addTitle?: string;          // 新增标题，默认"新增"
  editTitle?: string;         // 编辑标题，默认"编辑"
  onFinish: (values: T) => Promise<boolean>;  // 提交回调
  children?: ReactNode;       // 表单内容
  // ... 其他 ModalForm props
}
```

**使用示例**:
```tsx
import { FormModal } from '@/components/business';
import { ProFormText } from '@ant-design/pro-components';

<FormModal
  form={instance}
  visible={visible}
  onCancel={onCancel}
  isEdit={!!edited}
  addTitle="新增学生"
  editTitle="更新学生"
  onFinish={handleSubmit}
>
  <ProFormText
    name="name"
    label="姓名"
    rules={[{ required: true }]}
  />
  <ProFormText
    name="phone"
    label="手机号"
    rules={[{ required: true }]}
  />
</FormModal>
```

---

### DeleteButton

封装了删除确认的按钮组件。

**位置**: `src/components/business/DeleteButton/index.tsx`

**Props**:
```typescript
interface DeleteButtonProps {
  onConfirm: () => void;              // 确认删除回调
  title?: string;                     // 确认标题
  description?: string;               // 确认描述
  buttonText?: string;                // 按钮文字
  buttonProps?: ButtonProps;          // 按钮属性
  popconfirmProps?: PopconfirmProps;  // Popconfirm 属性
}
```

**使用示例**:
```tsx
import { DeleteButton } from '@/components/business';

<DeleteButton
  title="确定要删除这道题目吗？"
  description="删除后无法恢复，请谨慎操作。"
  onConfirm={() => handleDelete(record.id)}
/>

// 自定义按钮样式
<DeleteButton
  title="确定删除吗？"
  onConfirm={() => handleDelete(record.id)}
  buttonText="移除"
  buttonProps={{ size: 'middle' }}
/>
```

---

### DetailCard

通用详情卡片组件。

**位置**: `src/components/business/DetailCard/index.tsx`

**Props**:
```typescript
interface DetailCardProps extends CardProps {
  title: string;        // 卡片标题
  extra?: ReactNode;    // 右上角额外内容
  children: ReactNode;  // 卡片内容
}
```

**使用示例**:
```tsx
import { DetailCard, DescriptionList } from '@/components/business';
import { Button } from 'antd';

<DetailCard 
  title="基本信息" 
  extra={<Button onClick={handleEdit}>编辑</Button>}
>
  <DescriptionList
    items={[
      { label: '姓名', value: student.name },
      { label: '手机号', value: student.phone },
    ]}
  />
</DetailCard>
```

---

### DescriptionList

通用描述列表组件。

**位置**: `src/components/business/DescriptionList/index.tsx`

**Props**:
```typescript
interface DescriptionItem {
  label: string;      // 标签
  value: ReactNode;   // 值
  span?: number;      // 跨列数
}

interface DescriptionListProps {
  items: DescriptionItem[];  // 描述项列表
  column?: number;           // 列数，默认 2
  // ... 其他 Descriptions props
}
```

**使用示例**:
```tsx
import { DescriptionList } from '@/components/business';
import { StatusTag } from '@/components/ui';

<DescriptionList
  column={3}
  items={[
    { label: '姓名', value: student.name },
    { label: '手机号', value: student.phone },
    { label: '状态', value: <StatusTag status={student.status} /> },
    { label: '创建时间', value: fmtTime(student.create_time) },
    { label: '备注', value: student.remark, span: 2 },
  ]}
/>
```

---

## 工具函数

### 表格列配置

**位置**: `src/hooks/useTableColumns.tsx`

#### createTimeColumn

创建时间列配置。

```typescript
function createTimeColumn<T>(
  title: string,
  dataIndex: string,
  options?: Partial<ProColumns<T>>
): ProColumns<T>
```

**使用示例**:
```tsx
import { createTimeColumn } from '@/hooks';

const columns = [
  createTimeColumn<Student>('创建时间', 'create_time'),
  createTimeColumn<Student>('更新时间', 'update_time', { width: 200 }),
];
```

#### createStatusColumn

创建状态显示列配置。

```typescript
function createStatusColumn<T>(
  title?: string,
  dataIndex?: string,
  options?: Partial<ProColumns<T>>
): ProColumns<T>
```

**使用示例**:
```tsx
import { createStatusColumn } from '@/hooks';

const columns = [
  createStatusColumn<Student>(),  // 默认标题"状态"，字段"status"
  createStatusColumn<Student>('启用状态', 'enabled'),
];
```

#### createStatusSearchColumn

创建状态搜索列配置。

```typescript
function createStatusSearchColumn<T>(
  title?: string,
  dataIndex?: string,
  options?: Partial<ProColumns<T>>
): ProColumns<T>
```

**使用示例**:
```tsx
import { createStatusSearchColumn } from '@/hooks';

const columns = [
  createStatusSearchColumn<Student>(),
];
```

#### createActionColumn

创建操作列配置。

```typescript
function createActionColumn<T>(
  render: ProColumns<T>['render'],
  options?: Partial<ProColumns<T>>
): ProColumns<T>
```

**使用示例**:
```tsx
import { createActionColumn } from '@/hooks';
import { Link } from '@umijs/max';

const columns = [
  createActionColumn<Student>(
    (_, record) => (
      <Space>
        <Link to={`/student/detail/${record.id}`}>详情</Link>
        <Button onClick={() => handleEdit(record)}>编辑</Button>
      </Space>
    ),
    { width: 120 }
  ),
];
```

---

### 标签渲染

**位置**: `src/utils/tag.tsx`

#### renderResourceTypeTag

渲染资源类型标签。

```typescript
function renderResourceTypeTag(resourceType?: string): ReactNode
```

**使用示例**:
```tsx
import { renderResourceTypeTag } from '@/utils/tag';

{
  title: '资源类型',
  render: (_, record) => renderResourceTypeTag(record.resource_type),
}
```

#### renderResourceStatusTag

渲染资源生成状态标签。

```typescript
function renderResourceStatusTag(
  hasResource: boolean,
  resourceType?: string
): ReactNode
```

**使用示例**:
```tsx
import { renderResourceStatusTag } from '@/utils/tag';

{
  title: '资源状态',
  render: (_, record) => renderResourceStatusTag(
    Boolean(record.resource),
    record.resource_type
  ),
}
```

#### renderBooleanTag

渲染布尔值标签。

```typescript
function renderBooleanTag(
  value: boolean,
  trueText?: string,
  falseText?: string
): ReactNode
```

**使用示例**:
```tsx
import { renderBooleanTag } from '@/utils/tag';

{
  title: '是否解析',
  render: (_, record) => renderBooleanTag(record.is_parsed, '已解析', '未解析'),
}
```

---

## Hooks

### useDelete

通用的删除操作 Hook。

**位置**: `src/hooks/useDelete.ts`

**类型定义**:
```typescript
interface UseDeleteOptions {
  onSuccess?: () => void;      // 成功回调
  successMessage?: string;     // 成功提示，默认"删除成功"
  errorMessage?: string;       // 失败提示，默认"删除失败"
}

function useDelete<T = string>(
  deleteFn: (id: T) => Promise<any>,
  options?: UseDeleteOptions
): {
  handleDelete: (id: T) => Promise<void>;
  loading: boolean;
}
```

**使用示例**:
```tsx
import { useDelete } from '@/hooks';
import { QuestionApi } from '@/services/question';

const { handleDelete, loading } = useDelete(QuestionApi.delete, {
  onSuccess: () => {
    message.success('删除成功');
    actionRef.current?.reload();
  },
  successMessage: '题目已删除',
});

// 在组件中使用
<DeleteButton onConfirm={() => handleDelete(record.id)} />
```

---

### useTableRequest

统一的表格请求处理逻辑。

**位置**: `src/hooks/useTableRequest.ts`

**类型定义**:
```typescript
function useTableRequest<T, P = any>(
  requestFn: (params: P) => Promise<{ data: T[]; total: number }>
): (params: any) => Promise<{
  data: T[];
  total: number;
  success: boolean;
}>
```

**使用示例**:
```tsx
import { useTableRequest } from '@/hooks';
import { StudentApi } from '@/services/student';

const request = useTableRequest(StudentApi.search);

<CommonTable
  request={request}
  // ... 其他配置
/>
```

---

## 最佳实践

### 1. 列表页面开发

```tsx
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { CommonTable, DeleteButton } from '@/components/business';
import { createTimeColumn, createStatusColumn, useDelete } from '@/hooks';

export default function ListPage() {
  const actionRef = useRef<any>();
  
  const { handleDelete } = useDelete(Api.delete, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const columns: ProColumns<Entity>[] = [
    { title: '名称', dataIndex: 'name' },
    createStatusColumn<Entity>(),
    createTimeColumn<Entity>('创建时间', 'create_time'),
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Link to={`/detail/${record.id}`}>详情</Link>
          <DeleteButton onConfirm={() => handleDelete(record.id)} />
        </Space>
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

### 2. 详情页面开发

```tsx
import { PageContainer } from '@ant-design/pro-components';
import { PageHeader, DetailCard, DescriptionList } from '@/components/business';

export default function DetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<Entity>();

  return (
    <PageContainer title={<PageHeader title="详情页" />}>
      <DetailCard title="基本信息">
        <DescriptionList
          items={[
            { label: '名称', value: data?.name },
            { label: '状态', value: <StatusTag status={data?.status} /> },
            { label: '创建时间', value: fmtTime(data?.create_time) },
          ]}
        />
      </DetailCard>
    </PageContainer>
  );
}
```

---

## 注意事项

1. **类型安全**: 所有组件和函数都支持泛型，使用时请指定正确的类型
2. **性能优化**: 使用 `useMemo` 缓存列配置，避免不必要的重渲染
3. **错误处理**: 所有 API 调用都应该有适当的错误处理
4. **一致性**: 保持整个项目使用相同的组件和工具函数

---

## 更新日志

- 2025-01-13: 初始版本，包含 6 个业务组件和 9 个工具函数
