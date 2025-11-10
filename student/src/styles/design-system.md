# 学生端设计系统

## 设计理念
**目标用户**：低学龄小学生（6-12岁）
**核心原则**：简洁、明亮、轻快、友好

## 配色方案

### 主色调 - 明亮温暖
```css
--primary-blue: #60A5FA (蓝400)     /* 主要操作 */
--primary-purple: #A78BFA (紫400)   /* 评测相关 */
--primary-green: #34D399 (绿400)    /* 成功/完成 */
--primary-yellow: #FBBF24 (黄400)   /* 强调/奖励 */
--primary-pink: #F472B6 (粉400)     /* 装饰/可爱 */
--primary-orange: #FB923C (橙400)   /* 警告/待办 */
```

### 背景色 - 柔和渐变
```css
--bg-gradient-main: from-blue-50 via-purple-50 to-pink-50
--bg-gradient-warm: from-yellow-50 via-orange-50 to-red-50
--bg-gradient-cool: from-blue-50 via-cyan-50 to-teal-50
--bg-card: white with shadow-lg
```

### 文字颜色
```css
--text-primary: gray-800    /* 主要文字 */
--text-secondary: gray-600  /* 次要文字 */
--text-muted: gray-500      /* 提示文字 */
```

## 字体规范

### 字号
```css
--text-hero: text-4xl (36px)      /* 页面标题 */
--text-heading: text-2xl (24px)   /* 卡片标题 */
--text-title: text-xl (20px)      /* 小标题 */
--text-body: text-base (16px)     /* 正文 */
--text-small: text-sm (14px)      /* 辅助文字 */
--text-tiny: text-xs (12px)       /* 标签文字 */
```

### 字重
```css
--font-bold: font-bold (700)      /* 强调标题 */
--font-semibold: font-semibold (600) /* 次级标题 */
--font-medium: font-medium (500)  /* 按钮文字 */
--font-normal: font-normal (400)  /* 正文 */
```

## 间距规范

### 容器间距
```css
--spacing-section: space-y-8 (32px)  /* 页面区块间距 */
--spacing-card: space-y-6 (24px)     /* 卡片间距 */
--spacing-content: space-y-4 (16px)  /* 内容间距 */
--spacing-item: space-y-3 (12px)     /* 列表项间距 */
```

### 内边距
```css
--padding-page: px-4 py-6           /* 页面内边距 */
--padding-card: p-6                 /* 卡片内边距 */
--padding-button: px-8 py-4         /* 按钮内边距（大） */
--padding-button-sm: px-6 py-3      /* 按钮内边距（小） */
```

## 圆角规范
```css
--rounded-card: rounded-3xl        /* 卡片圆角 */
--rounded-button: rounded-2xl      /* 按钮圆角 */
--rounded-tag: rounded-full        /* 标签圆角 */
--rounded-image: rounded-xl        /* 图片圆角 */
```

## 组件规范

### 按钮设计
**大按钮（主要操作）**
```tsx
<Button className="
  w-full h-16 text-xl font-bold rounded-2xl
  bg-gradient-to-r from-blue-500 to-purple-500
  hover:from-blue-600 hover:to-purple-600
  shadow-lg hover:shadow-xl
  transition-all duration-200
  flex items-center justify-center gap-3
">
  <Icon className="h-7 w-7" />
  开始练习
</Button>
```

**小按钮（次要操作）**
```tsx
<Button className="
  px-6 py-3 text-base font-medium rounded-xl
  border-2 border-gray-200
  hover:border-blue-400 hover:bg-blue-50
  transition-all duration-200
">
  查看详情
</Button>
```

### 卡片设计
**主卡片**
```tsx
<Card className="
  border-2 border-blue-200
  rounded-3xl shadow-lg
  hover:shadow-xl hover:-translate-y-1
  transition-all duration-300
  overflow-hidden
">
  <CardContent className="p-6">
    {/* 内容 */}
  </CardContent>
</Card>
```

**功能卡片**
```tsx
<Card className="
  rounded-3xl shadow-md
  hover:shadow-xl hover:scale-[1.02]
  transition-all duration-200
  cursor-pointer
  bg-white
">
  {/* 内容 */}
</Card>
```

### 图标使用
- 使用 lucide-react 图标库
- 图标大小：h-6 w-6 (正常)，h-8 w-8 (大号)
- 图标颜色：与主题色搭配
- 可添加动画效果（如 animate-pulse）

### 进度条设计
```tsx
<div className="w-full bg-gray-200 rounded-full h-3">
  <div 
    className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>
```

### 标签设计
```tsx
<span className="
  inline-flex items-center gap-1
  px-3 py-1 rounded-full
  text-sm font-medium
  bg-blue-100 text-blue-700
">
  <Icon className="h-4 w-4" />
  标签文字
</span>
```

## 动画效果

### 页面过渡
```css
/* 淡入 */
animate-fadeIn: opacity-0 to opacity-100 (duration-300)

/* 滑入 */
animate-slideIn: translate-y-4 to translate-y-0 (duration-300)

/* 弹跳 */
animate-bounce: scale-0 to scale-100 (duration-500, bounce)
```

### 交互反馈
```css
/* 悬停放大 */
hover:scale-[1.02]

/* 点击缩小 */
active:scale-[0.98]

/* 阴影过渡 */
hover:shadow-xl transition-shadow duration-200
```

### 加载动画
```tsx
<div className="flex flex-col items-center gap-4">
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500" />
  <p className="text-lg font-medium text-gray-600 animate-pulse">加载中...</p>
</div>
```

## 表情和装饰

### 使用场景
- 成功完成：🎉 🌟 ⭐ 🏆
- 继续加油：💪 🔥 ⚡ 🎯
- 学习进度：📚 📖 ✏️ 📝
- 奖励徽章：🥇 🥈 🥉 🏅

### 使用方式
```tsx
<div className="text-5xl">🎉</div>
<p className="font-bold">太棒了！</p>
```

## 响应式设计

### 断点
```css
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 桌面 */
xl: 1280px  /* 大屏 */
```

### 网格布局
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 卡片 */}
</div>
```

## 文案规范

### 语气
- 友好亲切，使用"你"而非"您"
- 多用鼓励性语言
- 避免专业术语
- 语句简短明了

### 示例
❌ 请完成今日的练习任务以获取积分奖励
✅ 今天也要加油练习哦~ 🌟

❌ 您的当前能力评估等级为中等水平
✅ 你已经很棒了！继续努力会更厉害 💪

❌ 建议针对薄弱知识点进行专项训练
✅ 多练练这些题目，很快就能掌握啦 📚

## 无障碍设计

### 色彩对比度
- 文字与背景对比度 ≥ 4.5:1
- 大号文字对比度 ≥ 3:1

### 可点击区域
- 最小尺寸：44x44px (iOS标准)
- 按钮之间间距：≥ 8px

### 焦点状态
```tsx
focus:ring-4 focus:ring-blue-200 focus:outline-none
```

## 性能优化

### 图片
- 使用 WebP 格式
- 懒加载：loading="lazy"
- 响应式图片：srcset

### 动画
- 使用 transform 和 opacity (硬件加速)
- 避免 layout 改变
- 使用 will-change 提示浏览器

### 加载状态
- 骨架屏优于 loading 图标
- 乐观更新提升体验
- 错误状态友好提示

