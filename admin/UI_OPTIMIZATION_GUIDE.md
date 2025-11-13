# Admin UI 优化指南

本文档说明 admin 项目的 UI 优化内容和使用方法。

## 优化概述

本次 UI 优化主要包括：
- 全局样式优化
- 组件样式优化
- 动画效果增强
- 响应式设计改进
- 主题配置优化

## 优化内容

### 1. 全局样式优化

#### 1.1 背景色优化
- 页面背景色改为 `#f5f5f5`，提供更好的视觉层次
- 卡片和表格使用白色背景，形成对比

#### 1.2 圆角优化
- 卡片圆角：8px
- 按钮圆角：6px
- 输入框圆角：6px
- 标签圆角：4px

#### 1.3 阴影优化
- 卡片阴影：三层阴影叠加，提供微妙的立体感
- 悬停阴影：增强交互反馈
- 按钮阴影：主按钮添加轻微阴影

### 2. 组件样式优化

#### 2.1 卡片组件
```less
.ant-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
              0 1px 6px -1px rgba(0, 0, 0, 0.02),
              0 2px 4px 0 rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05),
                0 2px 8px -2px rgba(0, 0, 0, 0.04),
                0 6px 16px 0 rgba(0, 0, 0, 0.04);
  }
}
```

**效果**:
- 默认状态：轻微阴影
- 悬停状态：阴影加深，提供交互反馈

#### 2.2 表格组件
```less
.ant-table {
  border-radius: 8px;
  overflow: hidden;

  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
    padding: 12px 16px;
  }

  .ant-table-tbody > tr {
    transition: all 0.2s ease;

    &:hover > td {
      background: #fafafa;
    }
  }
}
```

**效果**:
- 表头背景色区分
- 行悬停效果
- 平滑过渡动画

#### 2.3 按钮组件
```less
.ant-btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;

  &.ant-btn-primary {
    box-shadow: 0 2px 0 rgba(5, 145, 255, 0.1);

    &:hover {
      box-shadow: 0 4px 8px rgba(5, 145, 255, 0.2);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
```

**效果**:
- 悬停时轻微上浮
- 点击时回弹
- 阴影变化提供反馈

#### 2.4 表单组件
```less
.ant-input,
.ant-select-selector {
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4096ff;
  }

  &:focus {
    border-color: #4096ff;
    box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  }
}
```

**效果**:
- 悬停时边框颜色变化
- 聚焦时显示光晕效果

### 3. 动画效果

#### 3.1 淡入动画
```less
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease;
}
```

**使用方法**:
```tsx
<div className="fade-in">
  {/* 内容 */}
</div>
```

#### 3.2 过渡动画
所有交互元素都添加了 `transition` 属性：
- 按钮：0.2s
- 卡片：0.3s
- 表格行：0.2s
- 输入框：0.2s

### 4. 滚动条优化

```less
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 4px;

  &:hover {
    background: #8c8c8c;
  }
}
```

**效果**:
- 更细的滚动条（8px）
- 圆角设计
- 悬停时颜色加深

### 5. 响应式设计

#### 5.1 移动端适配
```less
@media (max-width: 768px) {
  .ant-pro-layout {
    .ant-pro-layout-content {
      padding: 0 16px;
    }
  }

  .ant-card {
    .ant-card-head {
      padding: 12px 16px;
    }

    .ant-card-body {
      padding: 16px;
    }
  }
}
```

**效果**:
- 移动端减少内边距
- 优化触摸体验

#### 5.2 打印样式
```less
@media print {
  .ant-pro-sider,
  .ant-pro-global-header,
  .ant-btn,
  .ant-pagination {
    display: none !important;
  }

  .ant-table {
    page-break-inside: avoid;
  }
}
```

**效果**:
- 打印时隐藏导航和按钮
- 表格避免跨页断行

### 6. 工具类

#### 6.1 文本省略
```less
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**使用方法**:
```tsx
<div className="text-ellipsis">很长的文本内容...</div>
<div className="text-ellipsis-2">很长的多行文本内容...</div>
```

#### 6.2 布局工具类
```less
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

**使用方法**:
```tsx
<div className="flex-center">居中内容</div>
<div className="flex-between">
  <span>左侧</span>
  <span>右侧</span>
</div>
```

## 使用示例

### 示例 1: 优化的卡片
```tsx
import { DetailCard } from '@/components/business';

<DetailCard title="基本信息" className="fade-in">
  <DescriptionList items={items} />
</DetailCard>
```

**效果**:
- 圆角卡片
- 淡入动画
- 悬停阴影

### 示例 2: 优化的表格
```tsx
import { CommonTable } from '@/components/business';

<CommonTable
  className="fade-in"
  columns={columns}
  request={request}
/>
```

**效果**:
- 圆角表格
- 行悬停效果
- 平滑过渡

### 示例 3: 优化的按钮
```tsx
<Button type="primary">
  提交
</Button>
```

**效果**:
- 悬停上浮
- 点击回弹
- 阴影变化

## 颜色规范

### 主色调
- 主色：`#1677ff`
- 悬停色：`#4096ff`
- 激活色：`#0958d9`

### 中性色
- 文本主色：`rgba(0, 0, 0, 0.88)`
- 文本次色：`rgba(0, 0, 0, 0.65)`
- 文本辅助色：`rgba(0, 0, 0, 0.45)`
- 边框色：`#f0f0f0`
- 背景色：`#fafafa`

### 功能色
- 成功：`#52c41a`
- 警告：`#faad14`
- 错误：`#ff4d4f`
- 信息：`#1677ff`

## 间距规范

### 内边距
- 小：8px
- 中：16px
- 大：24px

### 外边距
- 小：8px
- 中：16px
- 大：24px

### 组件间距
- 卡片间距：16px
- 表单项间距：20px
- 按钮间距：8px

## 字体规范

### 字号
- 标题：16px (font-weight: 600)
- 正文：14px
- 辅助文字：12px

### 字重
- 常规：400
- 中等：500
- 加粗：600

## 最佳实践

### 1. 使用工具类
优先使用提供的工具类，保持样式一致性：
```tsx
<div className="flex-between">
  <span className="text-ellipsis">标题</span>
  <Button>操作</Button>
</div>
```

### 2. 添加动画
为新内容添加淡入动画：
```tsx
<Card className="fade-in">
  {/* 内容 */}
</Card>
```

### 3. 保持间距一致
使用规范的间距值：
```tsx
<Space size={16}>
  <Button>按钮1</Button>
  <Button>按钮2</Button>
</Space>
```

### 4. 响应式设计
考虑移动端体验：
```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8}>
    {/* 内容 */}
  </Col>
</Row>
```

## 注意事项

1. **不要覆盖全局样式**
   - 使用 CSS Modules 或 scoped 样式
   - 避免使用 `!important`

2. **保持动画性能**
   - 优先使用 `transform` 和 `opacity`
   - 避免动画 `width`、`height` 等属性

3. **测试响应式**
   - 在不同屏幕尺寸下测试
   - 确保移动端可用性

4. **保持一致性**
   - 遵循设计规范
   - 使用统一的颜色和间距

## 更新日志

- 2025-01-13: 初始版本，完成全局样式优化
