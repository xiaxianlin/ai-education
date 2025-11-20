"""单元练习 Prompt 构建"""

from langchain_core.output_parsers import JsonOutputParser
from shared.question.types import QuestionGenerationResult, QuestionGenerationState
from shared.question.prompts.utils import (
    build_common_prompt,
    build_knowledges_prompt,
)

UNIT_PRACTICE_SYSTEM_PROMPT = """
你是一名专业的教研员，擅长根据学生的学习数据设计个性化的日常练习。
你的目标是帮助学生巩固薄弱环节、保持已掌握知识、挑战更高难度，并激发学习兴趣。
请严格按照 {format_instructions} 生成 JSON 输出。
"""

# ==================== 英语学科 Prompts ====================

GENERIC_UNIT_PRACTICE_PROMPT_ENGLISH = """
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

**英语知识点分类说明**：
- **词汇类**：单词认读、拼写、词义理解、词组搭配
- **语法类**：句型结构、时态用法、语法规则
- **听说类**：听力理解、口语表达、发音规范
- **阅读类**：句子理解、短文阅读、语篇理解

---

## 三、英语题型配置
{question_types}

**英语题型选择建议**：
- **词汇学习**：选择题（选词填空）、听音选词、看图选词
- **语法练习**：选择题、填空题、句型转换
- **听力训练**：听音选词、听音判断、听音回答
- **口语练习**：跟读句子、角色扮演、看图说话
- **阅读理解**：选择题、判断题、填空题

---

## 四、英语题目生成核心原则

### 1. 知识点对齐
- 每道题必须**直接关联**上述英语知识点中的至少1个
- knowledge字段：从提供的知识点名称中选择，多个用顿号（、）分隔
- knowledge字段必须是**字符串类型**（示例："词汇认读、句型理解"）

### 2. 年级与难度匹配
- **{grade}英语水平要求**：
  - 低年级(1-2年级)：侧重字母、简单单词、基础句型
  - 中年级(3-4年级)：侧重常用词汇、简单语法、日常对话
  - 高年级(5-6年级)：侧重词汇扩展、复杂句型、短文阅读
- 难度分布：简单题40%，普通题40%，困难题20%
- 难度标准：
  - **简单**：单词直接认读、简单句型识别、常见对话
  - **普通**：词义理解、句型应用、听力理解
  - **困难**：词汇扩展、语法综合、语篇理解

### 3. 题型多样性
- 优先使用**听说读写**四项技能均衡的题型组合
- **题型数量限制**：单一题型最多不超过总题数的50%
- 建议题型搭配：
  - 10题：听力2题 + 词汇3题 + 语法2题 + 阅读2题 + 口语1题
  - 15题：听力3题 + 词汇4题 + 语法3题 + 阅读3题 + 口语2题

---

## 五、英语特殊题型规范

### 5.1 听力类题目（核心题型）
| 字段 | 要求 | 英语示例 |
|------|------|---------|
| `question` | 简要说明任务 | "Listen and choose the correct word"（请听录音，选择正确的单词） |
| `resource_content` | 标准英语发音文本 | "apple" / "I like apples" |
| `resource_type` | 固定为 "audio" | - |

**听力题设计要点**：
- 发音清晰，语速适合{grade}学生
- 避免口音过重或不标准发音
- 句子长度：低年级≤5词，中年级≤8词，高年级≤12词

### 5.2 口语类题目
| 子类型 | 题干要求 | resource_content示例 |
|--------|---------|---------------------|
| 跟读句子 | 说明需要跟读 | "Good morning, teacher!" |
| 角色扮演 | 描述场景和角色 | "How are you?"（学生需回答） |
| 看图说话 | 描述图片内容 | 留空（图片题） |

**口语评分标准**（供参考）：
- 发音准确度、语调自然度、流畅性

### 5.3 词汇选择题规范
- 提供**4个选项**（A/B/C/D）
- 选项应为同类词或形近词，增加辨识度
- 错误选项设计：常见混淆词、形近词、音近词
- 例：考"apple"时，干扰项可选"orange"（同类）、"apply"（形近）

### 5.4 阅读理解题
- 短文长度：低年级2-3句，中年级4-6句，高年级8-10句
- 问题类型：事实细节、主旨大意、词义推测
- 答案必须能从原文直接找到依据

---

## 六、英语题目质量控制

### 6.1 语言准确性
- ✅ 使用标准英语表达，避免中式英语
- ✅ 语法正确，拼写无误
- ✅ 符合英语国家的语言习惯和文化背景

### 6.2 年级适配性
- ✅ 词汇难度匹配年级要求（参考课程标准词汇表）
- ✅ 句型复杂度符合年级水平
- ✅ 话题贴近学生生活经验

### 6.3 教育价值
- 题目应促进**语言实际应用能力**
- 鼓励在真实语境中理解和使用英语
- 错误选项反映常见学习误区（如时态混淆、词性误用）

---

## 七、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**英语题目关键字段**：
- `knowledge` 必须是字符串（如"词汇认读、句型理解"）
- `resource_content` 用于听力和口语题，填写英语文本
- `resource_type` 录音题固定为"audio"
- `question` 和 `answer` 可包含英文内容
"""


# ==================== 数学学科 Prompts ====================

GENERIC_UNIT_PRACTICE_PROMPT_MATH = """
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

**数学知识点分类说明**：
- **数与运算**：数的认识、加减乘除、四则运算、估算
- **图形与几何**：图形识别、周长面积、空间想象
- **量的测量**：长度、重量、时间、货币认识与换算
- **统计与概率**：数据收集、统计图表、简单概率（高年级）
- **应用与解决问题**：实际问题建模、多步骤应用题

---

## 三、数学题型配置
{question_types}

**数学题型选择建议**：
- **数感培养**：选择题、填空题、比大小
- **运算练习**：计算题、列式计算、竖式计算
- **图形认知**：选择题、判断题、画图题
- **应用能力**：应用题、解决问题、实际情境题
- **逻辑思维**：找规律、数字谜题、推理题

---

## 四、数学题目生成核心原则

### 1. 知识点对齐
- 每道题必须**直接关联**上述数学知识点中的至少1个
- knowledge字段：从提供的知识点名称中选择，多个用顿号（、）分隔
- knowledge字段必须是**字符串类型**（示例："两位数加法、进位运算"）

### 2. 年级与难度匹配
- **{grade}数学水平要求**：
  - 低年级(1-2年级)：20以内/100以内加减法、简单图形、基础应用
  - 中年级(3-4年级)：万以内运算、乘除法、分数初步、组合图形
  - 高年级(5-6年级)：多位数运算、分数小数、比例、复杂应用题
- 难度分布：简单题40%，普通题40%，困难题20%
- 难度标准：
  - **简单**：单步运算、直接应用、基础图形识别
  - **普通**：两步运算、一般应用、图形计算
  - **困难**：多步综合、复杂应用、逻辑推理

### 3. 题型多样性
- 优先使用**知识、技能、应用**三类能力均衡的题型组合
- **题型数量限制**：单一题型最多不超过总题数的50%
- 建议题型搭配：
  - 10题：计算3题 + 应用2题 + 选择2题 + 填空2题 + 判断1题
  - 15题：计算4题 + 应用3题 + 选择3题 + 填空3题 + 判断2题

---

## 五、数学特殊题型规范

### 5.1 计算题规范
- **口算题**：结果在合理范围（低年级≤100，中年级≤1000，高年级≤10000）
- **列式计算**：给出情境，学生列出算式并计算
- **竖式计算**：涉及进位、退位等运算技巧
- **简便运算**：高年级适用，运用运算律简化计算

**数字选择原则**：
- 避免过于简单（如1+1）或过于复杂的数字
- 结果尽量为整数，避免无限小数
- 分数计算注意约分和通分的合理性

### 5.2 应用题规范
- **情境真实性**：贴近学生生活（购物、出行、游戏等）
- **问题明确性**：问题表述清楚，所求明确
- **数据合理性**：数字符合实际情况（如一个苹果不会100元）
- **步骤层次性**：
  - 简单题：一步应用
  - 普通题：两步应用
  - 困难题：三步及以上，或需要转换思维

### 5.3 选择题规范（数学）
- 提供**4个选项**（A/B/C/D）
- 错误选项设计：
  - 常见计算错误（如进位错、运算顺序错）
  - 概念混淆（如周长和面积）
  - 单位换算错误
- 避免明显错误的选项（如负数答案在低年级题中）

### 5.4 图形题规范
- 题干描述图形的关键特征
- 如需计算，提供必要的数据（长、宽、半径等）
- 图形应规范，符合数学定义
- 暂不实际生成图片，由后续节点处理

---

## 六、数学题目质量控制

### 6.1 数学准确性
- ✅ 计算结果准确无误
- ✅ 单位使用规范（长度、面积、体积等）
- ✅ 数学概念表述严谨

### 6.2 年级适配性
- ✅ 数字大小适合年级水平
- ✅ 不出现超纲知识（如一年级不涉及乘除法）
- ✅ 运算复杂度符合年级要求

### 6.3 教育价值
- 题目应促进**数学思维发展**
- 鼓励多种解题方法
- 错误选项反映常见思维误区

### 6.4 实际意义
- 应用题情境合理，数据真实
- 答案有实际意义（如人数不能是小数）
- 避免脱离实际的假设

---

## 七、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**数学题目关键字段**：
- `knowledge` 必须是字符串（如"两位数加法、进位运算"）
- `answer` 数字结果注意格式（整数、小数、分数）
- `question` 应用题注意单位和条件的完整性
"""


def build_unit_practice_prompt(state: QuestionGenerationState) -> dict:
    """构建单元练习的prompt

    返回包含以下字段的字典：
    - prompt: ChatPromptTemplate 对象
    - prompt_input: 用于格式化 prompt 的输入字典
    - parser: JsonOutputParser 对象
    """
    from langchain_core.prompts import ChatPromptTemplate

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

    grade_text, question_types_text, avoid_duplicate_hint = build_common_prompt(
        subject, grade, recall_questions
    )

    # 获取prompt模板并追加避免重复提示
    unit_prompt_template = (
        subject == "英语"
        and GENERIC_UNIT_PRACTICE_PROMPT_ENGLISH
        or GENERIC_UNIT_PRACTICE_PROMPT_MATH
    )
    if avoid_duplicate_hint:
        unit_prompt_template = unit_prompt_template + avoid_duplicate_hint

    # 构建 ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", UNIT_PRACTICE_SYSTEM_PROMPT),
            ("human", unit_prompt_template),
        ]
    )

    # 构建 prompt 输入参数
    prompt_input = {
        "grade": grade_text,
        "unit_name": unit.name,
        "unit_summary": unit.content or "",
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
