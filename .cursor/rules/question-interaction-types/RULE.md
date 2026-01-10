---
description: "题型交互类型、交互方式、答题流程以及相关数据类型规范"
alwaysApply: false
---

# 题型交互类型规范

本文档描述系统中所有题型的交互类型、交互方式、答题流程以及相关数据类型。

## 交互类型列表

系统支持以下交互类型（`InteractionType`）：

### 选择题类
- `single_choice`: 单选题 - 从多个选项中选择一个
- `multi_choice`: 多选题 - 从多个选项中选择多个
- `image_choice`: 图片选择题 - 选项包含图片的选择题

### 判断题类
- `true_false`: 是非判断 - 判断对错（是/否）
- `correct_wrong`: 对错判断 - 判断正确/错误

### 文本输入类
- `text_input`: 文本输入 - 自由文本输入
- `fill_blank`: 填空题 - 在空白处填入答案
- `handwriting`: 手写输入 - 手写识别输入

### 语音输入类
- `voice_input`: 语音输入 - 录制语音答案
- `follow_read`: 跟读 - 跟读指定内容
- `free_speak`: 自由表达 - 自由口语表达

### 交互操作类
- `drag_drop`: 拖拽放置 - 拖拽元素到目标位置
- `connect_line`: 连线匹配 - 连接对应的选项
- `sort_order`: 排序排列 - 对选项进行排序

### 复合题型
- `multi_step`: 多步骤 - 包含多个子题的复合题

## 数据类型定义

### 题目数据结构 (Question)

```typescript
interface Question {
  id: string;
  question_type: {
    interaction_type: InteractionType;
  };
  stem: Stem | CompositeStem;
  options?: QuestionOption[];  // 选择题、判断题等需要选项
  resources?: QuestionResource[];  // 题目资源（图片、音频等）
  answer: AnswerConfig;  // 答案配置
  explanation?: string;  // 题目解析
}

interface QuestionOption {
  id: string;  // 选项ID（如 "A", "B", "1", "2"）
  text: string;  // 选项文本
  image_url?: string;  // 图片选项的URL
}

interface CompositeStem {
  text: string;  // 主题干
  sub_questions: SubQuestion[];  // 子题列表
}

interface SubQuestion {
  id: string;  // 子题ID（如 "1", "2"）
  stem: SubStem | string;  // 子题题干
  interaction_type: InteractionType;  // 子题交互类型
  options?: QuestionOption[];  // 子题选项
  answer: AnswerConfig;  // 子题答案配置
  explanation?: string;  // 子题解析
}
```

### 答案数据结构

#### 单题答案格式

根据交互类型，答案格式不同：

**选择题（single_choice）**:
```typescript
answer: string  // 选项ID，如 "A"
```

**多选题（multi_choice）**:
```typescript
answer: string[]  // 选项ID数组，如 ["A", "B", "C"]
```

**判断题（true_false, correct_wrong）**:
```typescript
answer: string  // "true"/"false" 或 "correct"/"wrong"
```

**文本输入（text_input, fill_blank）**:
```typescript
answer: string  // 文本内容
```

**复合题（multi_step）**:
```typescript
answer: Array<{
  sub_id: string;  // 子题ID
  value: string | string[];  // 子题答案（根据子题类型）
}>
```

#### 答题记录 (PracticeAnswer)

```typescript
interface PracticeAnswer {
  id: number;
  session_id: string;
  question_id: string;
  answer?: string | any;  // 学生答案（JSON格式）
  audio_url?: string;  // 音频答案URL（语音题）
  status: number;  // 0-未答, 1-正确, 2-错误
  time_spent: number;  // 耗时（秒）
  correct_answer?: CorrectAnswerData | string;  // 结构化正确答案
  analysis?: AnswerFeedbackData | string;  // 错题反馈
}

interface CorrectAnswerData {
  type: string;  // 交互类型
  value?: unknown;  // 单值答案
  values?: unknown[];  // 多值答案
  options?: Array<{ id: string; text: string }>;  // 选项详情
  sub_answers?: Array<{  // 复合题子答案
    sub_id: string;
    is_correct: boolean;
    value: unknown;
    type?: string;
  }>;
}

interface AnswerFeedbackData {
  correct_answer: CorrectAnswerData;
  explanation?: string;  // 题目解析
  analysis?: string;  // AI分析
}
```

## 交互流程

### 1. 题目展示流程

```
加载题目 → 解析题目结构 → 根据 interaction_type 选择输入组件 → 渲染题目
```

**前端实现**:
- 位置: `apps/student-web/src/pages/PracticeSession/components/QuestionCard/`
- 组件映射: `components/AnswerInput/index.ts` 中的 `getInputComponent()`
- 输入组件:
  - 选择题: `ChoiceInput` (支持 single_choice, multi_choice, image_choice)
  - 判断题: `JudgeInput` (支持 true_false, correct_wrong)
  - 文本输入: `TextInput` (支持 text_input, fill_blank)
  - 语音输入: `AudioInput` (支持 voice_input, free_speak, follow_read)

### 2. 答题流程

```
用户交互 → 更新答案状态 → 检查是否全部作答 → 提交答案 → 评判 → 显示反馈
```

**详细步骤**:

1. **用户交互**
   - 用户通过输入组件进行答题
   - 答案实时更新到 `PracticeAnswer.answer` 字段
   - 格式根据交互类型自动转换

2. **答案格式转换** (前端)
   - 位置: `apps/student-web/src/pages/PracticeSession/models/page.ts`
   - 单选题: 直接使用选项ID字符串
   - 多选题: 转换为选项ID数组
   - 复合题: 转换为 `[{sub_id, value}]` 格式

3. **提交答案** (API)
   - 端点: `POST /api/student/practice/answer`
   - 位置: `apps/server/student/practice/route.py`
   - 服务: `apps/server/shared/practice/answer.py::submit_answer()`

4. **答案评判** (后端)
   - 位置: `apps/server/shared/practice/evaluator.py`
   - 评判器类型:
     - `ExactEvaluator`: 精确匹配（选择题、判断题）
     - `FuzzyEvaluator`: 模糊匹配（填空题、简答题）
     - `RubricEvaluator`: 评分标准（主观题）
     - `AIEvaluator`: AI评分（口语题、开放题）
     - `CompositeEvaluator`: 复合题评判

5. **反馈生成**
   - 如果答错，生成结构化反馈
   - 包含: 正确答案、题目解析、AI分析
   - 位置: `apps/server/shared/practice/answer.py::_generate_feedback()`

### 3. 反馈显示流程

```
检查答题状态 → 判断是否答错 → 显示解析区域 → 显示选项状态（选择题）
```

**前端实现**:
- 解析区域: `components/AnalysisSection.tsx`
- 选项状态: `components/AnswerInput/ChoiceInput.tsx` (已提交时显示颜色状态)
- 子题解析: `components/SubQuestionItem.tsx` (子题答错时显示)

## 交互组件规范

### ChoiceInput (选择题)

**支持的交互类型**: `single_choice`, `multi_choice`, `image_choice`

**交互方式**:
- 单选题: 点击选项，直接替换当前选择
- 多选题: 点击选项，切换选中状态

**答案格式**:
- 单选题: `string` (选项ID)
- 多选题: `string[]` (选项ID数组)

**反馈状态** (已提交时):
- 用户选择正确 → 绿色选中 (`border-green-500 bg-green-50`)
- 用户选择错误 → 红色选中 (`border-red-500 bg-red-50`)
- 正确答案未选中 → 显示绿色"正确"标签

### JudgeInput (判断题)

**支持的交互类型**: `true_false`, `correct_wrong`

**交互方式**:
- 点击"是/否"或"正确/错误"按钮

**答案格式**: `string` ("true"/"false" 或 "correct"/"wrong")

### TextInput (文本输入)

**支持的交互类型**: `text_input`, `fill_blank`

**交互方式**:
- 文本输入框输入
- 填空题可能有多个输入框

**答案格式**: `string` (文本内容)

### AudioInput (语音输入)

**支持的交互类型**: `voice_input`, `free_speak`, `follow_read`

**交互方式**:
- 点击录音按钮开始录音
- 录音完成后上传音频文件
- 显示录音时长和播放控制

**答案格式**: 
- `audio_url`: 音频文件URL
- `answer`: 可选的文本转录（如果有）

## 复合题处理

### 数据结构

复合题包含主题干和多个子题：

```typescript
interface CompositeQuestion {
  stem: {
    text: string;
    sub_questions: SubQuestion[];
  };
  answer: {
    type: "composite";
    scoring: {
      partial_strategy: "sum" | "all_or_nothing";
    };
  };
}
```

### 答题流程

1. **答案收集**: 每个子题的答案收集到数组中
2. **答案格式**: `[{sub_id: "1", value: "A"}, {sub_id: "2", value: "B"}]`
3. **评判**: `CompositeEvaluator` 逐个评判子题
4. **得分策略**:
   - `sum`: 部分得分，累加所有子题得分
   - `all_or_nothing`: 全对才得分

### 反馈显示

- 主解析区: 仅在非选择题时显示"正确答案"文本
- 子题解析: 子题答错时在子题下方显示解析（图标+文案，单行显示）
- 选项状态: 子题是选择题时，显示颜色状态反馈

## 答案评判规则

### ExactEvaluator (精确匹配)

**适用题型**: 选择题、判断题

**评判逻辑**:
- 单选题: 答案完全匹配
- 多选题: 答案集合完全匹配（顺序无关）
- 判断题: 答案字符串完全匹配

### FuzzyEvaluator (模糊匹配)

**适用题型**: 填空题、简答题

**评判逻辑**:
- 文本相似度匹配
- 支持关键词匹配
- 忽略大小写和标点符号

### CompositeEvaluator (复合题评判)

**评判逻辑**:
- 逐个评判子题
- 根据 `partial_strategy` 计算总分
- 返回每个子题的评判结果

## 变更管理流程

### 变更确认流程

当需要进行以下变更时，**必须先确认后执行，执行后立即更新本规则文档**：

1. **新增交互类型**
   - 在 `InteractionType` 枚举中添加新类型
   - 创建对应的输入组件
   - 更新 `getInputComponent()` 映射
   - 实现对应的评判器（如需要）

2. **修改数据结构**
   - 修改 `Question`、`PracticeAnswer`、`CorrectAnswerData` 等接口
   - 修改数据库模型（如需要）
   - 更新前后端类型定义

3. **修改交互流程**
   - 修改答题流程逻辑
   - 修改评判规则
   - 修改反馈显示逻辑

4. **修改答案格式**
   - 修改答案数据结构
   - 修改答案序列化/反序列化逻辑

### 变更执行步骤

1. **确认变更需求**
   - 明确变更内容和影响范围
   - 评估对现有功能的影响
   - 确认是否需要数据迁移

2. **执行代码变更**
   - 按照变更需求修改代码
   - 确保类型安全和向后兼容
   - 添加必要的测试

3. **更新规则文档** ⚠️ **必须执行**
   - 更新本规则文档中的相关章节
   - 更新数据类型定义
   - 更新交互流程说明
   - 更新相关文件路径（如有变更）

4. **验证变更**
   - 验证代码实现与规则文档一致
   - 确保文档准确反映当前实现

### 变更检查清单

执行变更后，检查以下内容是否已更新：

- [ ] 交互类型列表（如有新增）
- [ ] 数据类型定义（如有修改）
- [ ] 交互流程说明（如有变更）
- [ ] 组件规范（如有新增或修改）
- [ ] 答案格式说明（如有变更）
- [ ] 评判规则（如有修改）
- [ ] 相关文件路径（如有变更）
- [ ] 注意事项（如有新增）

## 注意事项

1. **答案格式统一**: 前端提交前必须将答案格式化为后端期望的格式
2. **类型安全**: 所有交互类型必须使用 `InteractionType` 枚举
3. **组件映射**: 新增交互类型时，需要在 `getInputComponent()` 中添加映射
4. **评判器选择**: 根据题目的 `answer.type` 自动选择对应的评判器
5. **反馈显示**: 选择题不显示"正确答案"文本，通过选项颜色状态反馈
6. **子题解析**: 子题答错时在子题下方显示，使用单行格式（图标+文案）
7. **规则同步**: ⚠️ **重要** - 任何交互类型或数据结构变更后，必须同步更新本规则文档

## 相关文件

### 前端
- 输入组件: `apps/student-web/src/pages/PracticeSession/components/QuestionCard/components/AnswerInput/`
- 答题逻辑: `apps/student-web/src/pages/PracticeSession/models/page.ts`
- 类型定义: `packages/shared-web/src/types/global.d.ts`

### 后端
- 评判器: `apps/server/shared/practice/evaluator.py`
- 答题服务: `apps/server/shared/practice/answer.py`
- 路由: `apps/server/student/practice/route.py`
- 常量: `apps/server/shared/core/constants.py`
