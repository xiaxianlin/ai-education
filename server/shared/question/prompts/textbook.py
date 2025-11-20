"""教材生成 Prompt 构建

本模块负责构建教材级别的题目生成提示词，支持跨单元的综合练习。
"""

from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from shared.question.types import QuestionGenerationResult, QuestionGenerationState
from shared.question.prompts.utils import (
    build_common_prompt,
    build_knowledges_prompt,
    build_difficulty_distribution,
)

SYSTEM_PROMPT = """你是一名资深教研员，专注于教材级别的题目设计。

**核心职责**：
- 生成高质量、覆盖全教材的综合性题目
- 确保题目符合学生认知水平和课程标准
- 知识点全面覆盖，难度梯度合理

**输出要求**：
严格按照 {format_instructions} 生成 JSON 格式输出。"""

# 英语学科教材生成 Prompt 模板
TEXTBOOK_PROMPT_ENGLISH = """# 英语教材综合练习生成

## 一、任务概述
**学科**：英语 | **年级**：{grade} | **教材**：{unit_name} | **题目数量**：{count}道

**教材单元结构**：
{unit_summary}

---

## 二、知识点体系
{knowledge_text}

**知识点分类**：
- **词汇**：单词认读、拼写、词义、词组搭配
- **语法**：句型结构、时态、语法规则
- **听说**：听力理解、口语表达、发音
- **阅读**：句子理解、短文阅读、语篇分析

**出题要求**：
✓ 跨单元出题，全面覆盖教材
✓ 知识点均衡分布
✓ 体现教材整体进度

---

## 三、难度分布
按以下比例生成题目（共{count}道）：

| 难度 | 数量 | 学习目标 | 推荐题型 |
|:----:|:----:|:---------|:---------|
| 简单 | **{simple_count}** | 基础巩固、建立信心 | 词汇辨析、简单句型、听音选词 |
| 普通 | **{medium_count}** | 应用能力、掌握重点 | 语法填空、情景对话、阅读理解 |
| 困难 | **{hard_count}** | 综合运用、思维拓展 | 完形填空、写作表达、综合阅读 |

---

## 四、可用题型
{question_types}

**题型设计原则**：
- 单一题型 ≤ 40%（防止单调）
- 建议使用 4-5 种题型
- 听说读写能力均衡

---

## 五、生成规则

### 5.1 知识点对齐
- 每题关联至少1个知识点
- `knowledge` 字段：字符串格式，多个知识点用顿号分隔
- 示例：`"词汇认读、句型理解"`

### 5.2 年级适配
**{grade}水平要求**：
- 低年级（1-2）：字母、简单单词、基础句型
- 中年级（3-4）：常用词汇、简单语法、日常对话
- 高年级（5-6）：词汇扩展、复杂句型、短文阅读

### 5.3 特殊题型规范

**听力题**：
```json
{{
  "question": "Listen and choose",
  "resource_content": "I like apples",
  "resource_type": "audio"
}}
```

**口语题**：
- 跟读：`resource_content` 填写标准句子
- 对话：描述场景，提供对话内容

**选择题**：
- 4个选项（A/B/C/D）
- 干扰项：混淆词、形近词、音近词

---

## 六、质量标准

✅ **必须满足**：
- [ ] knowledge字段准确匹配知识点
- [ ] 难度比例符合要求（允许±1题）
- [ ] 知识点覆盖全面
- [ ] 跨单元分布均衡
- [ ] 英语表达地道准确
- [ ] 题目无重复

---

## 七、输出格式
{format_instructions}

**字段说明**：
- `knowledge`: 字符串类型，如 "词汇认读、句型理解"
- `resource_content`: 听力/口语题使用
- `resource_type`: 听力题固定为 "audio"
"""

# 数学学科教材生成 Prompt 模板
TEXTBOOK_PROMPT_MATH = """# 数学教材综合练习生成

## 一、任务概述
**学科**：数学 | **年级**：{grade} | **教材**：{unit_name} | **题目数量**：{count}道

**教材单元结构**：
{unit_summary}

---

## 二、知识点体系
{knowledge_text}

**知识点分类**：
- **数与运算**：数的认识、四则运算、估算
- **图形几何**：图形识别、周长面积、空间想象
- **量的测量**：长度、重量、时间、货币换算
- **统计概率**：数据收集、图表分析、概率（高年级）
- **问题解决**：建模、多步骤应用

**出题要求**：
✓ 跨单元出题，全面覆盖教材
✓ 知识点均衡分布
✓ 体现教材整体进度

---

## 三、难度分布
按以下比例生成题目（共{count}道）：

| 难度 | 数量 | 学习目标 | 推荐题型 |
|:----:|:----:|:---------|:---------|
| 简单 | **{simple_count}** | 基础巩固、概念理解 | 口算、直接计算、概念判断 |
| 普通 | **{medium_count}** | 技能熟练、常规应用 | 列式计算、应用题、图形计算 |
| 困难 | **{hard_count}** | 逻辑思维、综合运用 | 多步应用、思维拓展、综合题 |

---

## 四、可用题型
{question_types}

**题型设计原则**：
- 单一题型 ≤ 40%（防止单调）
- 建议使用 4-5 种题型
- 知识、技能、应用均衡

---

## 五、生成规则

### 5.1 知识点对齐
- 每题关联至少1个知识点
- `knowledge` 字段：字符串格式，多个知识点用顿号分隔
- 示例：`"两位数加法、进位运算"`

### 5.2 年级适配
**{grade}水平要求**：
- 低年级（1-2）：20/100以内加减、简单图形、基础应用
- 中年级（3-4）：万以内运算、乘除法、分数初步、组合图形
- 高年级（5-6）：多位数运算、分数小数、比例、复杂应用

### 5.3 特殊题型规范

**计算题**：
- 口算：结果在合理范围
- 列式计算：提供情境，学生列式求解

**应用题**（重点）：
- ✓ 情境真实（购物、出行、游戏等）
- ✓ 问题明确、数据合理
- ✓ 答案有实际意义

**选择题**：
- 4个选项（A/B/C/D）
- 干扰项：计算错误、概念混淆、单位错误

---

## 六、质量标准

✅ **必须满足**：
- [ ] knowledge字段准确匹配知识点
- [ ] 难度比例符合要求（允许±1题）
- [ ] 知识点覆盖全面
- [ ] 跨单元分布均衡
- [ ] 计算结果准确无误
- [ ] 应用题数据真实合理
- [ ] 题目无重复

---

## 七、输出格式
{format_instructions}

**字段说明**：
- `knowledge`: 字符串类型，如 "两位数加法、进位运算"
- `answer`: 注意格式（整数、小数、分数）
- `question`: 应用题注意单位完整性
"""


def build_textbook_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建教材级别题目生成的 Prompt
    
    Args:
        state: 题目生成状态，包含教材、年级、学科等信息
    
    Returns:
        包含以下字段的字典：
        - prompt: ChatPromptTemplate 对象
        - prompt_input: 用于格式化 prompt 的输入字典
        - parser: JsonOutputParser 对象
    
    Note:
        - 教材级别生成要求跨单元出题，全面覆盖知识点
        - 难度分布默认为：简单30%、普通50%、困难20%
    """
    # 提取状态数据
    textbook = state["textbook"]
    count = state["count"]
    grade = state["grade"]
    subject = state["subject"]
    knowledges = state.get("knowledges", [])
    recall_questions = state.get("recall_questions", [])
    units = state.get("units", [])

    # 构建 JSON 输出解析器
    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    # 构建公共提示词组件
    grade_text, question_types_text, avoid_duplicate_hint = build_common_prompt(
        subject, grade, recall_questions
    )

    # 计算难度分布
    distribution = build_difficulty_distribution(count)

    # 构建知识点文本
    knowledge_text = build_knowledges_prompt(knowledges)

    # 构建单元概要（教材所有单元列表）
    unit_summary = "整本教材的综合练习"
    if units:
        unit_names = [f"{i+1}. {unit.name}" for i, unit in enumerate(units)]
        unit_summary = "\n".join(unit_names)

    # 根据学科选择 prompt 模板
    template = TEXTBOOK_PROMPT_ENGLISH if subject == "英语" else TEXTBOOK_PROMPT_MATH

    # 追加避免重复提示（如有召回的题目）
    if avoid_duplicate_hint:
        template = template + "\n" + avoid_duplicate_hint

    # 构建 ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("human", template),
        ]
    )

    # 构建 prompt 输入参数
    prompt_input = {
        "grade": grade_text,
        "unit_name": f"{textbook.name}（全教材）",
        "unit_summary": unit_summary,
        "count": count,
        "question_types": question_types_text,
        "knowledge_text": knowledge_text,
        "format_instructions": format_instructions,
        **distribution,  # 包含 simple_count, medium_count, hard_count
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }
