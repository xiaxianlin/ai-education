"""单元生成 Prompt 构建"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.constants import get_question_types
from shared.question.types import QuestionGenerationResult, QuestionGenerationState
from shared.question.prompts.prompt_utils import (
    build_knowledge_text,
    build_subtype_info,
    build_avoid_duplicate_hint,
    build_question_types_text,
)
from shared.question.prompts.prompt_templates import STANDARD_SYSTEM_PROMPT

# 英语学科单元生成 Prompt 模板
GENERIC_UNIT_PROMPT_ENGLISH = """
# 英语单元题目生成任务

## 一、基础信息
- **学科**：英语 (English)
- **年级**：{grade}
- **单元**：{unit_name}
- **单元概要**：{unit_summary}
- **生成数量**：{count} 道题目

---

## 二、英语知识点体系
{knowledge_text}

**知识点分类说明**：
- **词汇类**：单词认读、拼写、词义理解、词组搭配
- **语法类**：句型结构、时态用法、语法规则
- **听说类**：听力理解、口语表达、发音规范
- **阅读类**：句子理解、短文阅读、语篇理解

---

## 三、题型配置
**可用主题型**：{question_types}

**题型子类型说明**：
{subtype_info}

**题型选择建议**：
- **词汇学习**：选择题（选词填空）、听音选词、看图选词
- **语法练习**：选择题、填空题、句型转换
- **听力训练**：听音选词、听音判断、听音回答
- **口语练习**：跟读句子、角色扮演、看图说话
- **阅读理解**：选择题、判断题、填空题

---

## 四、题目生成核心原则

### 1. 知识点对齐
- 每道题必须**直接关联**上述英语知识点中的至少1个
- knowledge字段：从提供的知识点名称中选择，多个用顿号（、）分隔
- knowledge字段必须是**字符串类型**（示例："词汇认读、句型理解"）

### 2. 年级与难度匹配
- **{grade}年级英语水平要求**：
  - 低年级(1-2年级)：侧重字母、简单单词、基础句型
  - 中年级(3-4年级)：侧重常用词汇、简单语法、日常对话
  - 高年级(5-6年级)：侧重词汇扩展、复杂句型、短文阅读
- 难度分布：简单题40%，普通题40%，困难题20%

### 3. 题型多样性
- **题型数量限制**：单一题型最多不超过总题数的50%
- 建议使用3-4种不同题型，保持练习趣味性

---

## 五、英语特殊题型规范

### 5.1 听力类题目
- `question`: 简要说明任务（如"Listen and choose"）
- `resource_content`: 标准英语发音文本
- `resource_type`: 固定为 "audio"

### 5.2 口语类题目
- 跟读句子：说明需要跟读，resource_content填写标准句子
- 角色扮演：描述场景，resource_content填写对话内容

### 5.3 词汇选择题
- 提供4个选项（A/B/C/D）
- 错误选项：常见混淆词、形近词、音近词

---

## 六、质量控制

### 语言准确性
- ✅ 使用标准英语表达，避免中式英语
- ✅ 语法正确，拼写无误
- ✅ 符合英语国家语言习惯

### 年级适配性
- ✅ 词汇难度匹配年级要求
- ✅ 句型复杂度符合年级水平
- ✅ 话题贴近学生生活经验

---

## 七、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**关键字段**：
- `knowledge` 必须是字符串（如"词汇认读、句型理解"）
- `resource_content` 用于听力和口语题，填写英语文本
- `resource_type` 录音题固定为"audio"
"""

# 数学学科单元生成 Prompt 模板
GENERIC_UNIT_PROMPT_MATH = """
# 数学单元题目生成任务

## 一、基础信息
- **学科**：数学 (Mathematics)
- **年级**：{grade}
- **单元**：{unit_name}
- **单元概要**：{unit_summary}
- **生成数量**：{count} 道题目

---

## 二、数学知识点体系
{knowledge_text}

**知识点分类说明**：
- **数与运算**：数的认识、加减乘除、四则运算、估算
- **图形与几何**：图形识别、周长面积、空间想象
- **量的测量**：长度、重量、时间、货币认识与换算
- **统计与概率**：数据收集、统计图表、简单概率（高年级）
- **应用与解决问题**：实际问题建模、多步骤应用题

---

## 三、题型配置
**可用主题型**：{question_types}

**题型子类型说明**：
{subtype_info}

**题型选择建议**：
- **数感培养**：选择题、填空题、比大小
- **运算练习**：计算题、列式计算、竖式计算
- **图形认知**：选择题、判断题、画图题
- **应用能力**：应用题、解决问题、实际情境题
- **逻辑思维**：找规律、数字谜题、推理题

---

## 四、题目生成核心原则

### 1. 知识点对齐
- 每道题必须**直接关联**上述数学知识点中的至少1个
- knowledge字段：从提供的知识点名称中选择，多个用顿号（、）分隔
- knowledge字段必须是**字符串类型**（示例："两位数加法、进位运算"）

### 2. 年级与难度匹配
- **{grade}年级数学水平要求**：
  - 低年级(1-2年级)：20以内/100以内加减法、简单图形、基础应用
  - 中年级(3-4年级)：万以内运算、乘除法、分数初步、组合图形
  - 高年级(5-6年级)：多位数运算、分数小数、比例、复杂应用题
- 难度分布：简单题40%，普通题40%，困难题20%

### 3. 题型多样性
- **题型数量限制**：单一题型最多不超过总题数的50%
- 建议使用3-4种不同题型

---

## 五、数学特殊题型规范

### 5.1 计算题规范
- 口算题：结果在合理范围（低年级≤100，中年级≤1000）
- 列式计算：给出情境，学生列出算式并计算
- 数字选择：避免过于简单或过于复杂

### 5.2 应用题规范
- 情境真实：贴近学生生活（购物、出行、游戏等）
- 问题明确：问题表述清楚，所求明确
- 数据合理：数字符合实际情况

### 5.3 选择题规范
- 提供4个选项（A/B/C/D）
- 错误选项：常见计算错误、概念混淆、单位换算错误

---

## 六、质量控制

### 数学准确性
- ✅ 计算结果准确无误
- ✅ 单位使用规范
- ✅ 数学概念表述严谨

### 年级适配性
- ✅ 数字大小适合年级水平
- ✅ 不出现超纲知识
- ✅ 运算复杂度符合年级要求

### 实际意义
- ✅ 应用题情境合理，数据真实
- ✅ 答案有实际意义（如人数不能是小数）

---

## 七、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**关键字段**：
- `knowledge` 必须是字符串（如"两位数加法、进位运算"）
- `answer` 数字结果注意格式（整数、小数、分数）
- `question` 应用题注意单位和条件的完整性
"""


def build_unit_prompt(state: QuestionGenerationState) -> dict:
    """构建单元生成prompt

    返回包含以下字段的字典：
    - prompt: ChatPromptTemplate 对象
    - prompt_input: 用于格式化 prompt 的输入字典
    - parser: JsonOutputParser 对象
    """
    # 提取状态数据
    unit = state["unit"]
    count = state["count"]
    subject = state["subject"]
    grade = state["grade"]
    knowledges = state.get("knowledges", [])
    recall_questions = state.get("recall_questions", [])

    # 构建格式说明
    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    # 获取题型配置
    question_types = get_question_types(subject, grade)
    if not question_types:
        raise ValueError(
            f"科目 {subject} 的 {grade} 年级暂不支持题目生成。" f"目前仅支持一年级的英语和数学。"
        )

    # 使用工具函数构建各种文本信息
    question_types_str = build_question_types_text(question_types)
    subtype_info = build_subtype_info(question_types)
    knowledge_text = build_knowledge_text(knowledges)
    avoid_duplicate_hint = build_avoid_duplicate_hint(recall_questions)

    # 根据学科选择prompt模板
    unit_prompt_template = (
        subject == "英语" and GENERIC_UNIT_PROMPT_ENGLISH or GENERIC_UNIT_PROMPT_MATH
    )

    # 追加避免重复提示
    if avoid_duplicate_hint:
        unit_prompt_template = unit_prompt_template + avoid_duplicate_hint

    # 构建 ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", STANDARD_SYSTEM_PROMPT),
            ("human", unit_prompt_template),
        ]
    )

    # 构建 prompt 输入参数
    prompt_input = {
        "grade": grade,
        "unit_name": unit.name,
        "unit_summary": unit.content or "",
        "count": count,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "knowledge_text": knowledge_text,
        "format_instructions": format_instructions,
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }

