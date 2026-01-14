# 教研后台页面原型、数据模型与自动组卷 Agent 设计

本文档在既有《题型设计文档》《教研配置后台信息架构设计》基础上，进一步完成**可直接进入研发阶段**的三件事：

1. 教研后台页面级信息结构（页面 / 表单 / 关键字段）
2. 核心数据库表与关系设计（偏逻辑模型）
3. 单元练习自动组卷 Agent 的完整设计（输入 / 约束 / 输出）

---

## 一、教研后台页面原型级结构

> 目标：让教研人员**不写 JSON，也不破坏系统约束**。

---

## 1.1 页面总览

```
教研后台
├── 题型资产库
│   ├── 题型列表页
│   ├── 题型详情页（Tabs）
│   └── 题型版本记录页
│
├── 练习场景管理
│   ├── 场景列表页
│   └── 场景配置页
│
├── 单元练习管理
│   ├── 单元列表页
│   ├── 单元配置页
│   └── 组卷规则页
│
└── 系统字典与约束
    ├── 能力维度管理
    ├── 交互模式管理
    └── 规则校验配置
```

---

## 1.2 题型资产库页面设计

### 1.2.1 题型列表页

**字段展示**
- 题型名称 / code
- 学科 / grade_band
- competency_dimension（Tag）
- interaction_mode
- practice_affinity（High / Medium / Low）
- 是否可用于单元练习（Yes / No）

**操作**
- 筛选（学科 / 学段 / 能力 / affinity）
- 查看单元练习适配状态

---

### 1.2.2 题型详情页（Tabs）

#### Tab 1：基础信息
- 名称 / 编码
- 教学目标描述
- 学科 / 学段

#### Tab 2：能力与策略
- competency_dimension（多选）
- 关联教学策略（下拉选择）

#### Tab 3：交互与媒介
- interaction_mode（枚举，下拉）
- media_context（结构化表单）

#### Tab 4：脚手架配置
- 是否支持脚手架
- 脚手架模板选择
- Trigger 配置（枚举 + 参数）

#### Tab 5：评价与反馈
- 支持的 evaluation_mode（多选）
- 默认 feedback_level

#### Tab 6：单元练习适配
- practice_affinity
- 是否允许进入单元练习（开关）
- 单元练习强制降级预览（只读）

---

## 1.3 练习场景（Practice Context）页面

### 场景列表页
- 场景名称（能力训练 / 单元练习）
- 核心特征标签（教学 / 刷题）

### 场景配置页
- scaffolding_level
- feedback_level
- evaluation_override
- time_pressure

> 所有字段为枚举或布尔，不允许自由扩展。

---

## 1.4 单元练习配置页面

### 单元配置页
- 学科 / 年级 / 单元
- 对应教材或知识点

### 题型白名单
- 自动过滤 practice_affinity = low
- 手动勾选 / 排除

### 组卷规则页
- 总题量
- 能力维度比例
- 题型分布比例
- 难度梯度

---

## 二、核心数据库逻辑模型设计

> 以下为**逻辑表设计**，非最终 SQL。

---

## 2.1 QuestionType（题型表）

- id
- code
- name
- subject
- grade_band
- description
- interaction_mode
- media_context (JSON)
- scaffolding_config (JSON)
- evaluation_modes (JSON)
- answer_schema (JSON)
- feedback_config (JSON)
- practice_affinity (enum)
- allow_unit_practice (bool)
- version
- status

---

## 2.2 Competency（能力维度表）

- id
- code
- name
- description
- applicable_grade_band

---

## 2.3 QuestionTypeCompetency（关联表）

- question_type_id
- competency_id

---

## 2.4 PracticeContext（练习场景表）

- id
- code (ability_training / unit_practice)
- scaffolding_level
- feedback_level
- evaluation_override
- time_pressure

---

## 2.5 UnitPractice（单元练习表）

- id
- subject
- grade
- unit_code
- practice_context_id

---

## 2.6 UnitPracticeRule（组卷规则）

- unit_practice_id
- total_questions
- competency_distribution (JSON)
- question_type_distribution (JSON)
- difficulty_curve

---

## 三、单元练习自动组卷 Agent 设计

> 该 Agent 的职责是：**在严格约束下“高效刷对的题”**。

---

## 3.1 Agent 定位

- 不教学
- 不创造新题型
- 不破坏教研规则

---

## 3.2 输入（Input Contract）

```json
{
  "unit_practice_id": "U5-CH-01",
  "subject": "Chinese",
  "grade": 5,
  "total_questions": 20,
  "competency_distribution": {
    "Reading": 0.5,
    "Vocabulary": 0.3,
    "Logic": 0.2
  },
  "excluded_question_types": []
}
```

---

## 3.3 约束规则（Hard Constraints）

- question_type.allow_unit_practice = true
- practice_affinity ∈ {high, medium}
- interaction_mode ∉ {recording, drawing}
- evaluation_mode 强制 auto_match

---

## 3.4 软约束（Soft Constraints）

- 单一题型不超过 30%
- 同一 interaction_mode 连续不超过 N 题
- 难度呈梯度分布

---

## 3.5 组卷流程（简化）

1. 拉取可用题型池
2. 按 competency 过滤
3. 按 affinity / 难度排序
4. 分配题量
5. 检查约束
6. 输出题目列表

---

## 3.6 输出（Output Contract）

```json
{
  "practice_context": "unit_practice",
  "questions": [
    {
      "question_id": "Q123",
      "question_type": "plot_sequence_drag",
      "difficulty": "medium"
    }
  ]
}
```

---

## 四、最终总结

- 教研后台：治理复杂度
- 数据模型：支撑规模化
- Agent：释放自动化能力

> 至此，你已经拥有一套**可工业化运行的题型 + 练习系统设计**。

