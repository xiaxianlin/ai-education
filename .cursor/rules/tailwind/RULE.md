---
description: "Tailwind CSS 样式规范，包含状态映射、类名组织等规范"
alwaysApply: true
---

# Tailwind CSS 样式规范

## 多状态样式规范

### 原则：严格使用状态映射

**禁止使用 `cn` 封装和三元运算符链式判断，必须使用严格的状态映射函数。**

### 错误示例 ❌

```typescript
// 错误：使用 cn 封装
import { cn } from "@/lib/utils";

<button
  className={cn(
    "base-class",
    condition1 ? "class1" : condition2 ? "class2" : "class3",
    condition3 && "class4"
  )}
>
```

```typescript
// 错误：使用三元运算符链式判断
<button
  className={
    condition1
      ? "class1"
      : condition2
      ? "class2"
      : condition3
      ? "class3"
      : "default"
  }
>
```

### 正确示例 ✅

```typescript
// 正确：使用状态映射函数
function getButtonClassName(params: {
  state1: boolean;
  state2: boolean;
  state3: boolean;
}): string {
  const base = "base-class";
  const classes: string[] = [base];
  
  if (params.state1) {
    classes.push("class-for-state1");
  } else if (params.state2) {
    classes.push("class-for-state2");
  } else {
    classes.push("default-class");
  }
  
  if (params.state3) {
    classes.push("additional-class");
  }
  
  return classes.join(" ");
}

<button
  className={getButtonClassName({
    state1,
    state2,
    state3,
  })}
>
```

### 状态映射函数规范

1. **函数命名**：使用 `get[Element]ClassName` 格式，如 `getButtonClassName`、`getCardClassName`
2. **参数类型**：使用明确的类型定义，所有布尔值必须明确类型
3. **逻辑组织**：使用 if-else 或 switch 语句，不使用三元运算符链
4. **返回值**：使用数组 `join(" ")` 拼接类名，不使用 `cn` 工具函数

### 完整示例

```typescript
/**
 * 根据状态映射获取按钮的 className
 */
function getButtonClassName(params: {
  showFeedback: boolean;
  selected: boolean;
  isUserCorrect: boolean;
  isUserWrong: boolean;
  correct: boolean;
  disabled: boolean;
}): string {
  const base = "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 shadow-sm relative";
  const classes: string[] = [base];
  
  if (!params.showFeedback) {
    // 答题状态
    if (params.selected) {
      classes.push("border-primary bg-primary/10 text-primary shadow-primary/20");
    } else {
      classes.push("border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5 hover:text-primary");
    }
  } else {
    // 反馈状态
    if (params.isUserCorrect) {
      classes.push("border-green-500 bg-green-50 text-green-700");
    } else if (params.isUserWrong) {
      classes.push("border-red-500 bg-red-50 text-red-700");
    } else if (params.correct) {
      classes.push("border-green-200 bg-green-50/50 text-foreground");
    } else {
      classes.push("border-border bg-card text-card-foreground");
    }
  }
  
  if (params.disabled) {
    classes.push("opacity-100 cursor-not-allowed");
  }
  
  return classes.join(" ");
}

// 使用
const selected = !!isSelected(label);
const correct = !!isCorrect(label);
const showFeedback = !!(disabled && correctAnswerIds.length > 0);
const isUserCorrect = !!(selected && correct);
const isUserWrong = !!(selected && !correct);

<button
  className={getButtonClassName({
    showFeedback,
    selected,
    isUserCorrect,
    isUserWrong,
    correct,
    disabled: !!disabled,
  })}
>
```

## 类名组织规范

### 基础类名

- 基础样式类名放在数组第一个位置
- 使用有意义的变量名，如 `base`、`baseClasses`

### 条件类名

- 使用 if-else 或 switch 语句组织条件逻辑
- 按优先级顺序排列条件判断
- 每个状态分支只添加对应的类名

### 类名拼接

- 使用数组 `push` 方法添加类名
- 最后使用 `join(" ")` 拼接所有类名
- 不使用 `cn`、`clsx` 等工具函数

## 类型安全

### 布尔值处理

确保所有传递给状态映射函数的布尔值都是明确的类型：

```typescript
// 确保类型明确
const selected = !!isSelected(label);
const correct = !!isCorrect(label);
const disabled = !!props.disabled;
```

### 函数参数类型

状态映射函数的参数必须使用明确的类型定义：

```typescript
function getClassName(params: {
  state1: boolean;  // 必须是 boolean，不能是 boolean | undefined
  state2: boolean;
}): string {
  // ...
}
```
