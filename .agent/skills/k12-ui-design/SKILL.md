---
name: k12-ui-design
description: 针对 K12 学习者的 UI/UX 设计规范，涵盖色彩、交互与组件库使用。
---

# K12 UI Design Skill

本技能提供了面向中小学生的界面设计原则和实现指导，旨在创造一个有趣、高效且易于使用的学习环境。

## 设计原则 (Design Principles)

### 1. 趣味性 (Engagement)

- **色彩**: 使用活泼、和谐的调色板（如浅蓝色、柔和的绿色和橙色）。避免过于沉闷或刺眼的对比。
- **微动效**: 在状态切换（如按钮点击、正确/错误反馈）时加入微妙的动画（使用 CSS Transitions 或 Framer Motion）。

### 2. 简洁性 (Simplicity)

- **聚焦**: 每屏仅保留一个核心操作（如做题页突出题目内容和选项）。
- **语言**: 按钮文案使用通俗易懂的表述（如“我写好啦”、“检查答案”）。

## 技术组件栈 (Tech Stack)

### 1. 学生端 (Student Web/Mobile)

- **UI 库**: `shadcn/ui` (Web), `Tamagui` (Mobile)。
- **样式**: `Vanilla CSS` 或 `TailwindCSS` (如果用户明确要求)。
- **核心组件**:
  - `QuestionCard`: 承载题目内容与交互。
  - `RadialProgressBar`: 显示掌握度进度的环形进度条。

### 2. 管理端 (Admin Web)

- **UI 库**: `Ant Design 5` (Pro Components)。
- **风格**: 追求高效、紧凑，使用浅色背景以减少视觉疲劳。

## 交互规范示例

### 选项反馈 (Selection Feedback)

- **正确**: 描边/背景变为绿色（如 `#52c41a`），并伴随轻微扩大的缩放动画。
- **错误**: 描边/背景变为红色（如 `#f5222d`），并伴随轻微的左右抖动（Shake）。

### 图片适配

- 所有题目配图应设置 `max-height: 300px`，保持 `object-fit: contain`，确保在移动端和 Web 端均能完美展示。

## 注意事项

1. **可访问性**: 保持足够的字体大小（学生端正文不低于 16px）。
2. **状态提示**: 加载、空数据、错误状态必须有明确的占位图或友好的提示信息。
