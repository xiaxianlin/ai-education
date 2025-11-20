"""单元练习 Prompt 构建

本模块负责构建单元级别的题目生成提示词，针对特定单元的知识点进行练习。
"""

from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from shared.question.types import QuestionGenerationResult, QuestionGenerationState
from shared.question.prompts.utils import (
    build_common_prompt,
    build_knowledges_prompt,
)

SYSTEM_PROMPT = """你是一名资深教研员，专注于单元级别的题目设计。

**核心职责**：
- 针对特定单元知识点，生成高质量练习题
- 题目难度适配学生年级水平
- 题型多样，帮助学生全面掌握单元内容

**输出要求**：
严格按照 {format_instructions} 生成 JSON 格式输出。"""

# ==================== 英语学科 Prompts ====================

UNIT_PROMPT_ENGLISH = """# 英语单元练习生成

## 一、任务概述
**学科**：英语 | **年级**：{grade} | **单元**：{unit_name} | **题目数量**：{count}道

**单元内容**：
{unit_summary}

---

## 二、知识点体系
{knowledge_text}

**知识点分类**：
- **词汇**：单词认读、拼写、词义、词组搭配
- **语法**：句型结构、时态、语法规则
- **听说**：听力理解、口语表达、发音
- **阅读**：句子理解、短文阅读、语篇分析

---

## 三、可用题型
{question_types}

**题型选择建议**：
- **词汇**：选择题、听音选词、看图选词
- **语法**：选择题、填空题、句型转换
- **听力**：听音选词、听音判断、听音回答
- **口语**：跟读句子、角色扮演、看图说话
- **阅读**：选择题、判断题、填空题

**题型设计原则**：
- 单一题型 ≤ 50%（防止单调）
- 听说读写均衡
- 建议搭配：
  - 10题 → 听力2 + 词汇3 + 语法2 + 阅读2 + 口语1
  - 15题 → 听力3 + 词汇4 + 语法3 + 阅读3 + 口语2

---

## 四、生成规则

### 4.1 知识点对齐
- 每题关联至少1个知识点
- `knowledge` 字段：字符串格式，多个知识点用顿号分隔
- 示例：`"词汇认读、句型理解"`

### 4.2 难度分布
**{grade}水平要求**：
- 低年级（1-2）：字母、简单单词、基础句型
- 中年级（3-4）：常用词汇、简单语法、日常对话
- 高年级（5-6）：词汇扩展、复杂句型、短文阅读

**难度比例**：简单 40% | 普通 40% | 困难 20%

**难度标准**：
- **简单**：单词认读、简单句型、常见对话
- **普通**：词义理解、句型应用、听力理解
- **困难**：词汇扩展、语法综合、语篇理解

---

## 五、特殊题型规范

### 5.1 听力题（重点）
```json
{{
  "question": "Listen and choose the correct word",
  "resource_content": "I like apples",
  "resource_type": "audio"
}}
```

**设计要点**：
- 发音清晰，语速适合{grade}
- 句子长度：低年级≤5词，中年级≤8词，高年级≤12词

### 5.2 口语题
| 类型 | 题干 | resource_content |
|:-----|:-----|:-----------------|
| 跟读 | 说明跟读要求 | "Good morning, teacher!" |
| 对话 | 描述场景 | "How are you?" |
| 看图 | 描述图片 | 留空 |

### 5.3 选择题
- 4个选项（A/B/C/D）
- 干扰项：混淆词、形近词、音近词
- 示例：考"apple"时，干扰项用"orange"（同类）、"apply"（形近）

### 5.4 阅读题
- 短文长度：低年级2-3句，中年级4-6句，高年级8-10句
- 问题类型：事实细节、主旨大意、词义推测
- 答案有原文依据

---

## 六、质量标准

✅ **必须满足**：
- [ ] knowledge字段准确匹配知识点
- [ ] 难度比例合理（简40%、普40%、难20%）
- [ ] 题型多样，听说读写均衡
- [ ] 英语表达地道准确
- [ ] 词汇难度匹配年级
- [ ] 话题贴近学生生活
- [ ] 题目无重复

---

## 七、输出格式
{format_instructions}

**字段说明**：
- `knowledge`: 字符串类型，如 "词汇认读、句型理解"
- `resource_content`: 听力/口语题使用
- `resource_type`: 听力题固定为 "audio"
- `question`/`answer`: 可包含英文内容
"""


# ==================== 数学学科 Prompts ====================

UNIT_PROMPT_MATH = """# 数学单元练习生成

## 一、任务概述
**学科**：数学 | **年级**：{grade} | **单元**：{unit_name} | **题目数量**：{count}道

**单元内容**：
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

---

## 三、可用题型
{question_types}

**题型选择建议**：
- **数感**：选择题、填空题、比大小
- **运算**：计算题、列式计算、竖式计算
- **图形**：选择题、判断题、画图题
- **应用**：应用题、解决问题、情境题
- **思维**：找规律、数字谜题、推理题

**题型设计原则**：
- 单一题型 ≤ 50%（防止单调）
- 知识、技能、应用均衡
- 建议搭配：
  - 10题 → 计算3 + 应用2 + 选择2 + 填空2 + 判断1
  - 15题 → 计算4 + 应用3 + 选择3 + 填空3 + 判断2

---

## 四、生成规则

### 4.1 知识点对齐
- 每题关联至少1个知识点
- `knowledge` 字段：字符串格式，多个知识点用顿号分隔
- 示例：`"两位数加法、进位运算"`

### 4.2 难度分布
**{grade}水平要求**：
- 低年级（1-2）：20/100以内加减、简单图形、基础应用
- 中年级（3-4）：万以内运算、乘除法、分数初步、组合图形
- 高年级（5-6）：多位数运算、分数小数、比例、复杂应用

**难度比例**：简单 40% | 普通 40% | 困难 20%

**难度标准**：
- **简单**：单步运算、直接应用、基础图形
- **普通**：两步运算、一般应用、图形计算
- **困难**：多步综合、复杂应用、逻辑推理

---

## 五、特殊题型规范

### 5.1 计算题
- **口算**：结果在合理范围（低≤100，中≤1000，高≤10000）
- **列式计算**：提供情境，学生列式求解
- **竖式计算**：涉及进位、退位技巧
- **简便运算**：高年级适用，运用运算律

**数字选择**：
- 避免过简（1+1）或过复杂
- 结果尽量为整数
- 分数注意约分通分

### 5.2 应用题（重点）
- ✓ **情境真实**：购物、出行、游戏等
- ✓ **问题明确**：表述清楚，所求明确
- ✓ **数据合理**：符合实际（苹果不会100元）
- ✓ **层次分明**：
  - 简单：一步应用
  - 普通：两步应用
  - 困难：三步及以上

### 5.3 选择题
- 4个选项（A/B/C/D）
- 干扰项设计：
  - 计算错误（进位错、顺序错）
  - 概念混淆（周长vs面积）
  - 单位换算错误
- 避免明显错误（低年级题出负数）

### 5.4 图形题
- 描述图形关键特征
- 提供必要数据（长、宽、半径等）
- 图形符合数学定义

---

## 六、质量标准

✅ **必须满足**：
- [ ] knowledge字段准确匹配知识点
- [ ] 难度比例合理（简40%、普40%、难20%）
- [ ] 题型多样，能力均衡
- [ ] 计算结果准确无误
- [ ] 单位使用规范
- [ ] 概念表述严谨
- [ ] 应用题数据真实合理
- [ ] 答案有实际意义
- [ ] 题目无重复

---

## 七、输出格式
{format_instructions}

**字段说明**：
- `knowledge`: 字符串类型，如 "两位数加法、进位运算"
- `answer`: 注意格式（整数、小数、分数）
- `question`: 应用题注意单位完整性
"""


def build_unit_practice_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建单元练习题目生成的 Prompt
    
    Args:
        state: 题目生成状态，包含单元、年级、学科等信息
    
    Returns:
        包含以下字段的字典：
        - prompt: ChatPromptTemplate 对象
        - prompt_input: 用于格式化 prompt 的输入字典
        - parser: JsonOutputParser 对象
    
    Note:
        - 单元级别生成针对特定单元知识点
        - 难度分布默认为：简单40%、普通40%、困难20%
    """
    # 提取状态数据
    unit = state["unit"]
    count = state["count"]
    subject = state["subject"]
    grade = state["grade"]
    knowledges = state.get("knowledges", [])
    recall_questions = state.get("recall_questions", [])

    # 构建 JSON 输出解析器
    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    # 构建公共提示词组件
    grade_text, question_types_text, avoid_duplicate_hint = build_common_prompt(
        subject, grade, recall_questions
    )

    # 根据学科选择 prompt 模板
    template = UNIT_PROMPT_ENGLISH if subject == "英语" else UNIT_PROMPT_MATH

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
        "unit_name": unit.name,
        "unit_summary": unit.content or "本单元的练习题目",
        "count": count,
        "question_types": question_types_text,
        "knowledge_text": build_knowledges_prompt(knowledges),
        "format_instructions": format_instructions,
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }
