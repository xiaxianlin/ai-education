# Question Generation Prompt Design Document

This document outlines the design of AI prompts used for generating educational questions across different subjects, levels, and practice scenarios.

## 1. Master Template Structure

Every prompt follows a consistent block-based structure to ensure reliability and quality:

- **System Role**: Defines the AI as an expert educator for the specific subject and grade.
- **Task Overview**: Clearly states the goal (e.g., "Generate 10 Math questions for 3rd grade").
- **Knowledge Context**: Injected variables like `unit_name`, `knowledges`, and `weak_points`.
- **Constraint Rules**: Specific rules related to difficulty, cognitive levels, and avoiding duplicates.
- **Output Schema**: Strict JSON format for seamless system integration.

---

## 2. Configuration Matrix

| Subject         | Stage         | Practice Type  | Design Focus                                                    |
| :-------------- | :------------ | :------------- | :-------------------------------------------------------------- |
| **Mathematics** | Primary       | Daily Training | Calculation fluency, basic logic, visual aids.                  |
| **Mathematics** | Junior/Senior | Unit Test      | Complex problem solving, theorem application, multi-step logic. |
| **English**     | Primary       | Daily Training | Vocabulary, spelling, simple grammar, audio-based listening.    |
| **English**     | Junior/Senior | Assessment     | Reading comprehension, grammar nuance, free speaking.           |
| **Chinese**     | Primary       | Daily Training | Pinyin, literacy, simple sentence structure.                    |
| **Chinese**     | Junior/Senior | Assessment     | Classic literature, advanced composition, logical analysis.     |

---

---

## 3. Specialized Prompt Templates (Expanded)

This section contains 18 specialized templates designed for Primary Education.

### 3.1 语文 (Chinese)

#### [Primary Low] 小学低年级 (Grades 1-3)

- **日常练习 (`chinese_p_low_daily`)**: 重点在拼音、识字、组词。用词简单活泼。
- **单元练习 (`chinese_p_low_unit`)**: 紧扣单元课文，考察课后生字词和基本句式。
- **综合评估 (`chinese_p_low_assess`)**: 综合考查字词基础及简单的绘本/短文阅读理解。

#### [Primary High] 小学高年级 (Grades 4-6)

- **日常练习 (`chinese_p_high_daily`)**: 涉及成语、近反义词、修辞手法。
- **单元练习 (`chinese_p_high_unit`)**: 强调单元主题理解、重点段落分析、缩句/改句。
- **综合评估 (`chinese_p_high_assess`)**: 侧重古诗文赏析、长难文阅读、逻辑推理。

### 3.2 数学 (Mathematics)

#### [Primary Low] 小学低年级 (Grades 1-3)

- **日常练习 (`math_p_low_daily`)**: 重点在于100以内的加减法、口算、简单的位置和形状认知。
- **单元练习 (`math_p_low_unit`)**: 涉及长度单位测量、乘法口诀基础应用。
- **综合评估 (`math_p_low_assess`)**: 结合生活场景偏向绘图或简单应用题。

#### [Primary High] 小学高年级 (Grades 4-6)

- **日常练习 (`math_p_high_daily`)**: 分数、小数运算，基础方程，几何图形性质。
- **单元练习 (`math_p_high_unit`)**: 针对特定单元（如：圆、比例、统计）的深度题目设计。
- **综合评估 (`math_p_high_assess`)**: 跨知识点综合应用题，强调解题方法论。

### 3.3 英语 (English)

#### [Primary Low] 小学低年级 (Grades 1-3)

- **日常练习 (`english_p_low_daily`)**: 字母辨析、单词拼写、简单的日常问候语，多用图片辅助。
- **单元练习 (`english_p_low_unit`)**: 围绕单元核心单词和固定句型，通过听音选词/连线考察。
- **综合评估 (`english_p_low_assess`)**: 语音语调感知、超短对话理解、基础自我介绍。

#### [Primary High] 小学高年级 (Grades 4-6)

- **日常练习 (`english_p_high_daily`)**: 语法时态、固定搭配、短语积累。
- **单元练习 (`english_p_high_unit`)**: 课文深度理解，涉及一般现在时、进行时等语法的应用。
- **综合评估 (`english_p_high_assess`)**: 阅读短文填空、简单书面表达、社交场景应对。

---

## 4. Prompt Repository

Below are representative templates for each combination.

### 4.1 语文 (Chinese)

#### [A] 小学低年级

````carousel
```text
# 角色
你是一位亲和力极强的小学低段语文老师。请为{grade}学生生成{count}道日常练习题。
- 重点关注: 拼音(pinyin)、识字(literacy)、基础词语(vocabulary)。
- 难度分布: 简单({easy}), 中等({medium})。
- 准则: 用词通俗易懂, 避免使用学生未接触过的生僻字。
- 语段参考: {review_units}
- 知识点: {new_knowledge_points}
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 场景: 语文-小学低年级-单元练习
# 角色: 小学低段语文教学专家
# 提示词:
请针对"{unit_name}"单元编写{count}道单元练习题。
- 单元概要: {unit_summary}
- 目标知识点: {knowledges}
- 考查形式: 结合互动类型{question_types}, 包含填空、选择、连线等。
- 设计原则: 严格遵守教材大纲，确保题目具有针对性和代表性。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 场景: 语文-小学低年级-综合评估
# 角色: 资深小学语文课程测评官
# 提示词:
生成{count}道{grade}语文综合评估题。
- 考察范围: {knowledge_text}
- 难度比例: 简单({easy}), 中等({medium}), 困难({hard})。
- 设计目标: 全面评估识字写字、口语交际、基础阅读能力。
- 提示: 困难题目可设置为简单的图文结合阅读。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
````

#### [B] 小学高年级

````carousel
```text
# 场景: 语文-小学高年级-日常练习
# 角色: 小学高段语文把关老师
# 提示词:
为{grade}学生生成{count}道日常练习题。
- 活动目标: 词语积累(成语、四字词)、句子训练(反问句、比喻句修辞)。
- 认知层次: 侧重理解(understand)与应用(apply)。
- 练习参数: 数量({count}), 分数分布({easy}, {medium})。
- 参考背景: {review_units}
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 场景: 语文-小学高年级-单元练习
# 角色: 语文特级教师
# 提示词:
设计"{unit_name}"单元深度检测题，共{count}道。
- 核心内容: {knowledges}
- 单元主旨: {unit_summary}
- 考查重点: 涉及修辞手法、关联词填空、语段缩略等。
- 质量标准: 题目叙述严谨, 解析需详细注明解题思路。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 场景: 语文-小学高年级-综合评估
# 角色: 语文教育评价专家
# 提示词:
组织一次{grade}语文综合能力测评，包含{count}道题。
- 全库知识点: {knowledge_text}
- 弱项强化: {weak_knowledge_points}
- 难度控制: 简单({easy}), 中等({medium}), 困难({hard})。
- 测评维度: 成语运用, 逻辑修改, 跨学科文学常识。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
````

### 4.2 数学 (Mathematics)

#### [A] 小学低年级

````carousel
```text
# 场景: 数学-小学低年级-日常练习
# 角色: 趣味数学引导员
# 提示词:
生成{count}道趣味数学题。
- 适用对象: {grade}
- 涉及领域: 计算({easy}道), 位置({medium}道), 图形认知。
- 规则: 结合生活小常识(如：超市购物、分水果)。
- 变量: {new_knowledge_points}
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 场景: 数学-小学低年级-单元练习
# 角色: 数学基础教研员
# 提示词:
针对"{unit_name}"进行知识巩固。
- 单元重点: {knowledges}
- 题量: {count}
- 交互设置: 优先考虑 `{question_types}`。
- 解题逻辑: 一步到位, 说明简洁。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 场景: 数学-小学低年级-综合评估
# 角色: 数学逻辑构筑师
# 提示词:
进行{grade}数学能力大比拼。
- 范围: {knowledge_text}
- 难度: 简单({easy}), 中级({medium})。
- 考查重点: 数量关系的建立, 基础逻辑判断。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
````

#### [B] 小学高年级

````carousel
```text
# 场景: 数学-小学高年级-日常练习
# 角色: 数学思维训练专家
# 提示词:
为{grade}设计{count}道思维训练题。
- 涉及专项: 计算(calculation), 图形(shape), 问题解决(problem_solving)。
- 要求: 考察知识点的灵活转换。
- 配比: 简单({easy}), 中点({medium})。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 场景: 数学-小学高年级-单元练习
# 角色: 资深数学教师
# 提示词:
为单元"{unit_name}"设计进阶练习，共{count}题。
- 单元详情: {unit_summary}
- 指定知识点: {knowledges}
- 设计方向: 几何模型推理、分数百分数应用、数据统计分析。
- 解析规范: 必须包含逻辑严密的推导过程。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 场景: 数学-小学高年级-综合评估
# 角色: 数学奥林匹克教练
# 提示词:
全真模拟测评：{grade}数学综合素质。
- 全量库: {knowledge_text}
- 难度挑战: 简单({easy}), 中等({medium}), 困难({hard})。
- 评估深度: 多步逻辑推导、数型结合能力。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
````

### 4.3 英语 (English)

#### [A] 小学低年级

````carousel
```text
# 角色: 少儿英语启蒙专家
# 场景: 英语-小学低年级-日常练习
# 提示词:
请为{grade}学生生成{count}道简单且有趣的英语练习题。
- 重点关注: 字母辨析、自然拼读、基础单词（颜色、动物、水果）。
- 风格: 欢快、鼓励性。
- 注入内容: {new_knowledge_points}
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 角色: 小学英语教学专家
# 场景: 英语-小学低年级-单元练习
# 提示词:
针对单元"{unit_name}"进行的单元评估。
- 目标词汇: {knowledges}
- 单元概念: {unit_summary}
- 任务类型: 使用 `{question_types}`，如 `image_choice` 或 `text_input`。
- 内容: 基础句型（例如："I like...", "This is a..."）。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 角色: 小学英语测评设计师
# 场景: 英语-小学低年级-综合评估
# 提示词:
为{grade}初学者设计的综合测试。
- 范围: {knowledge_text}
- 难度平衡: 简单({easy}), 中等({medium})。
- 技能: 听力（资源中包含文案）、词汇、基础响应。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
````

#### [B] 小学高年级

````carousel
```text
# 角色: 小学中段英语教育者
# 场景: 英语-小学高年级-日常练习
# 提示词:
为{grade}学习者设计的日常练习。
- 核心: 时态（一般现在时、现在进行时）、短语、句型练习。
- 混合比例: {easy}道基础词语和{medium}道语法应用。
- 知识点: {new_knowledge_points}
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 角色: 资深英语教师
# 场景: 英语-小学高年级-单元练习
# 提示词:
单元"{unit_name}"的诊断性测试。
- 单元概要: {unit_summary}
- 覆盖知识点: {knowledges}
- 复杂度: 侧重语境使用和语法准确性。
- 数量: {count}
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
<!-- slide -->
```text
# 角色: 剑桥少儿英语测评员
# 场景: 英语-小学高年级-综合评估
# 提示词:
针对{grade}的期末评估。
- 知识库: {knowledge_text}
- 薄弱环节: {weak_knowledge_points}
- 难度等级: 简单({easy}), 中等({medium}), 困难({hard})。
- 目标: 多样化的题型，旨在全面检查阅读和语法。
- 避免重复: {avoid_duplicate_hint}
{format_instructions}
```
````
