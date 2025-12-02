# 学生应用分级配色规范

本文档定义了针对低、中、高三个年级段的 UI 配色和风格规范。基于现有的 Tailwind CSS + shadcn/ui 架构，通过调整 CSS 变量来实现不同年级的界面风格切换。

## 1. 低年级（1-2年级）：快乐乐园 (Joyful Land)

针对 6-8 岁儿童。设计风格需要高饱和度、暖色调、大圆角，强调趣味性和亲和力，以此吸引注意力并降低学习的枯燥感。

### 设计理念
*   **色彩心理**：使用类似于玩具的糖果色。
*   **对比度**：高对比度，但背景保持柔和，避免刺眼。
*   **形状**：大圆角 (Large Radius)，给人安全、柔软的感觉。

### 配色方案 (CSS Variables)

#### Light Mode (亮色)
```css
/* Theme: Low Grade - Light */
:root, [data-grade="low"] {
  /* 主色：明亮的天空蓝/糖果蓝，充满活力 */
  --primary: 210 90% 60%;
  --primary-foreground: 0 0% 100%;

  /* 辅助色：淡奶油色/柔和的暖白，用于次级背景，营造温馨感 */
  --secondary: 45 100% 96%;
  --secondary-foreground: 25 90% 45%;

  /* 强调色：鲜艳的太阳黄/橙，用于奖励和重点提示 */
  --accent: 35 95% 60%;
  --accent-foreground: 0 0% 100%;

  /* 破坏/警告色：柔和的红/粉红 */
  --destructive: 0 80% 65%;
  --destructive-foreground: 0 0% 100%;

  /* 背景：纯白或极淡的暖调白 */
  --background: 0 0% 100%;
  --foreground: 222 47% 15%;

  --card: 0 0% 100%;
  --card-foreground: 222 47% 15%;

  --border: 210 40% 90%;
  --input: 210 40% 90%;
  --ring: 210 90% 60%;

  --radius: 1rem; /* 16px */
}
```

#### Dark Mode (暗色)
低年级的暗色模式不应过于压抑，建议使用深邃的午夜蓝作为背景，像夜晚的星空。

```css
/* Theme: Low Grade - Dark */
.dark [data-grade="low"], [data-grade="low"].dark {
  /* 主色：提亮的天空蓝，确保在深色背景上的可见度 */
  --primary: 210 90% 70%;
  --primary-foreground: 222 47% 11%;

  /* 辅助色：深午夜蓝，比背景稍亮 */
  --secondary: 220 40% 20%;
  --secondary-foreground: 210 40% 98%;

  /* 强调色：萤火虫黄，发光感 */
  --accent: 35 95% 60%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 60% 60%;
  --destructive-foreground: 0 0% 100%;

  /* 背景：深蓝色系，而非纯黑 */
  --background: 225 40% 10%;
  --foreground: 210 40% 98%;

  --card: 225 40% 13%;
  --card-foreground: 210 40% 98%;

  --border: 220 30% 20%;
  --input: 220 30% 20%;
  --ring: 210 90% 70%;
}
```

## 2. 中年级（3-4年级）：探索世界 (Adventure World)

针对 9-10 岁儿童。设计风格开始向标准化过渡，颜色保持明快但降低了饱和度，增加了一些秩序感和探索感。

### 设计理念
*   **色彩心理**：自然色系（森林绿、海洋蓝），象征成长和探索。
*   **对比度**：适中，注重阅读体验。
*   **形状**：中等圆角，既不幼稚也不过于死板。

### 配色方案 (CSS Variables)

#### Light Mode (亮色)
```css
/* Theme: Middle Grade - Light */
[data-grade="middle"] {
  /* 主色：翡翠绿/蓝绿色，象征成长与平静 */
  --primary: 160 84% 39%;
  --primary-foreground: 0 0% 100%;

  /* 辅助色：淡薄荷绿/灰绿 */
  --secondary: 150 30% 96%;
  --secondary-foreground: 160 40% 20%;

  /* 强调色：珊瑚红/橙红 */
  --accent: 12 85% 65%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  --background: 0 0% 100%;
  --foreground: 215 25% 15%;

  --card: 0 0% 100%;
  --card-foreground: 215 25% 15%;

  --border: 160 20% 90%;
  --input: 160 20% 90%;
  --ring: 160 84% 39%;

  --radius: 0.75rem; /* 12px */
}
```

#### Dark Mode (暗色)
中年级暗色模式采用深森林绿或深灰绿，营造一种丛林探险的静谧感。

```css
/* Theme: Middle Grade - Dark */
.dark [data-grade="middle"], [data-grade="middle"].dark {
  /* 主色：明亮的翡翠绿 */
  --primary: 160 70% 50%;
  --primary-foreground: 0 0% 100%;

  /* 辅助色：深苔藓绿 */
  --secondary: 160 30% 15%;
  --secondary-foreground: 150 20% 98%;

  --accent: 12 85% 65%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 60% 50%;
  --destructive-foreground: 0 0% 100%;

  /* 背景：深灰绿/Slate */
  --background: 170 30% 8%;
  --foreground: 150 20% 98%;

  --card: 170 30% 10%;
  --card-foreground: 150 20% 98%;

  --border: 160 20% 18%;
  --input: 160 20% 18%;
  --ring: 160 70% 50%;
}
```

## 3. 高年级（5-6年级）：专注学堂 (Focus Studio)

针对 11-12 岁少年。设计风格接近成人应用，极简、干净、科技感，强调效率和专注，减少干扰元素。

### 设计理念
*   **色彩心理**：智慧蓝、深紫、高级灰。体现专业感和沉稳。
*   **对比度**：高对比度的文字，低对比度的背景装饰。
*   **形状**：小圆角或直角，显得干练。

### 配色方案 (CSS Variables)

#### Light Mode (亮色)
```css
/* Theme: High Grade - Light */
[data-grade="high"] {
  /* 主色：经典的科技蓝/靛蓝 */
  --primary: 220 80% 50%;
  --primary-foreground: 0 0% 100%;

  /* 辅助色：冷灰色 */
  --secondary: 210 20% 96%;
  --secondary-foreground: 222 47% 11%;

  /* 强调色：电光紫或青色 */
  --accent: 262 80% 60%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 100%;

  --background: 0 0% 100%;
  --foreground: 222 47% 10%;

  --card: 0 0% 100%;
  --card-foreground: 222 47% 10%;

  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 80% 50%;

  --radius: 0.5rem; /* 8px */
}
```

#### Dark Mode (暗色)
高年级暗色模式采用标准的极简暗黑风格（Zinc/Slate），减少视觉疲劳，适合长时间学习。

```css
/* Theme: High Grade - Dark */
.dark [data-grade="high"], [data-grade="high"].dark {
  /* 主色：稍亮的科技蓝 */
  --primary: 220 80% 60%;
  --primary-foreground: 0 0% 100%;

  /* 辅助色：深灰 */
  --secondary: 217 32% 17%;
  --secondary-foreground: 210 40% 98%;

  --accent: 262 80% 60%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 62% 30%;
  --destructive-foreground: 210 40% 98%;

  /* 背景：接近纯黑的深灰 */
  --background: 240 10% 4%;
  --foreground: 210 40% 98%;

  --card: 240 10% 6%;
  --card-foreground: 210 40% 98%;

  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 220 80% 60%;
}
```

## 实现建议

1.  **动态切换**：
    可以通过在 `<body>` 或应用根节点添加 `data-grade="low" | "middle" | "high"` 属性，然后在全局 CSS 中使用属性选择器来覆盖变量。

    ```css
    /* 基础设置（可作为 fallback） */
    :root { ... }

    /* 年级主题覆盖 - 亮色模式 */
    [data-grade="low"] { ... }
    [data-grade="middle"] { ... }
    [data-grade="high"] { ... }

    /* 年级主题覆盖 - 暗色模式 */
    /* 确保 HTML 标签上有 class="dark" 且 body/div 上有 data-grade="..." */
    .dark [data-grade="low"] { ... }
    .dark [data-grade="middle"] { ... }
    .dark [data-grade="high"] { ... }
    ```

2.  **暗色模式适配**：
    已为每个年级设计了专属的暗色模式（Dark Mode）。
    - **低年级**：午夜蓝背景，保持梦幻感。
    - **中年级**：深森林绿背景，保持探索感。
    - **高年级**：标准深空灰背景，保持专注感。
    
    请确保 Tailwind 配置中开启了 `darkMode: 'class'`，并在切换开关时同步切换 `class="dark"` 和 `data-grade` 属性。
