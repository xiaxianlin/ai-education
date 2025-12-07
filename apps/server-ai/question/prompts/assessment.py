"""能力评估 Prompt 构建

本模块负责构建基于IRT（项目反应理论）的自适应能力评估题目生成提示词。
"""

from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from question.types import QuestionGenerationResult, QuestionGenerationState
from question.prompts.utils import (
    build_common_prompt,
    build_knowledges_prompt,
    build_difficulty_distribution,
)

SYSTEM_PROMPT = """你是一名资深教研员，专注于IRT自适应能力评估设计。

**核心职责**：
- 生成高质量、高区分度的能力评估题目
- 基于IRT理论，确保题目难度梯度合理
- 题目具有良好的测量学特性

**输出要求**：
严格按照 {format_instructions} 生成 JSON 格式输出。"""


ASSESSMENT_PROMPT_ENGLISH = """# 英语IRT能力评估生成

## 一、评测概述
**学科**：英语 | **年级**：{grade} | **题目数量**：{count}道

**评测目标**：基于IRT理论快速定位学生英语能力
- 能力值范围：-3 到 +3
- 定位精度：±0.5
- 10-20题完成评估

---

## 二、能力维度覆盖

| 能力维度 | 占比 | 考察内容 |
|:--------|:----:|:---------|
| **词汇** | 30-40% | 单词识别、拼写、词义、搭配 |
| **语法** | 20-30% | 句型、时态、语法规则 |
| **听力** | 15-25% | 听音辨识、听力理解 |
| **阅读** | 15-25% | 句子理解、短文阅读 |
| **口语** | 5-15% | 发音模仿、简单对话 |

**年级标准**：
- 低年级（1-2）：50-200词、简单句型、单词识别
- 中年级（3-4）：200-600词、基础时态、对话理解
- 高年级（5-6）：600-1000词、复杂句型、语篇理解

**出题要求**：
✓ 能力维度均衡分布
✓ 可跨单元、跨主题
✓ 符合年级能力标准

---

## 三、IRT难度定义

| 难度 | IRT范围 | 通过率 | 能力特征 |
|:----:|:-------:|:------:|:---------|
| 简单 | -1.5~-0.5 | 85-95% | 基础词汇、简单句型 |
| 普通 | -0.5~+0.5 | 50-75% | 词义理解、语法应用 |
| 困难 | +0.5~+1.5 | 20-40% | 词汇扩展、复杂理解 |

**难度分配**：简单{simple_count}题 | 普通{medium_count}题 | 困难{hard_count}题

---

## 四、能力分布建议

根据题目总数均衡分配（使用选择题、拼写题、口语题）：
- **10题**：选择题5（词汇语法3 + 听力2） + 拼写题3 + 口语题2
- **15题**：选择题8（词汇语法5 + 听力3） + 拼写题4 + 口语题3
- **20题**：选择题11（词汇语法7 + 听力4） + 拼写题6 + 口语题3

---

## 五、题型配置
{question_types}

**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。

**题型限制**：
- 单一题型 ≤ 40%
- 优先客观题（便于自动判分）
- 避免开放性题目

---

## 六、题目设计要求

### 6.1 区分度（核心）
- **简单**：85%+通过率，建立信心
- **普通**：50-75%通过率，区分能力
- **困难**：20-40%通过率，拔尖筛选

### 6.2 独立性
- 每题考察1个核心能力
- 题目间无依赖关系
- 避免提示效应

### 6.3 标准化
- 答案唯一明确
- 英语表达地道
- 符合{grade}水平
- 无超纲内容

---

## 七、质量标准

✅ **必须满足**：
- [ ] 难度分布：简30% | 普50% | 难20%（±1题）
- [ ] 能力均衡：词汇、语法、听力、阅读、口语
- [ ] 区分度明确：各难度层次一致
- [ ] 判分友好：答案唯一
- [ ] 题目独立：无依赖关系
- [ ] 年级适配：符合{grade}标准
- [ ] 题型多样：≥3种，单一≤40%
- [ ] 语言准确：地道英语

---

## 八、输出格式
{format_instructions}

**字段说明**：
- `knowledge`: 能力维度（如"词汇能力"）
- `difficulty`: ["简单", "普通", "困难"]
- `question_type`: 必须严格匹配可用题型（选择题、拼写题、口语题）
- `question_subtype`: 必须严格匹配对应题型的子类型
- `resource_content`: 听音选词/听音选句/听音写单词/口语题使用
- `resource_type`: 听音类题目为 "audio"，看图类题目为 "image"，其他为空
"""


ASSESSMENT_PROMPT_MATH = """# 数学IRT能力评估生成

## 一、评测概述
**学科**：数学 | **年级**：{grade} | **题目数量**：{count}道

**评测目标**：基于IRT理论快速定位学生数学能力
- 能力值范围：-3 到 +3
- 定位精度：±0.5
- 10-20题完成评估

---

## 二、知识点范围
{knowledge_text}

**知识点分类**：
- **概念理解**：定义、性质、定理
- **运算求解**：算法、算理、精确计算
- **逻辑推理**：归纳、演绎、证明
- **问题解决**：建模、应用、综合分析

---

## 三、IRT难度定义

| 难度 | 目标群体 | 通过率 | 题目特征 |
|:----:|:--------|:------:|:---------|
| 基础 | 学困/中等 | 85-95% | 基本概念、直接运算、一步求解 |
| 中等 | 中等/优秀 | 50-75% | 变式应用、两步运算、转换思维 |
| 困难 | 优秀/尖子 | 20-40% | 综合应用、多步骤、逆向思维 |

**难度分配**：基础{simple_count}题 | 中等{medium_count}题 | 困难{hard_count}题

**能力覆盖**：基础知识30% | 基本技能40% | 综合应用30%

---

## 四、题目设计细则

### 4.1 基础题（{simple_count}题）
- **题型**：直接计算、概念判断、简单填空
- **特征**：一步求解，无陷阱
- **示例**：20以内加减、图形识别
- **年级例**：
  - 低（1-2）：10以内加减、认识图形
  - 中（3-4）：表内乘除、简单应用
  - 高（5-6）：小数计算、周长面积

### 4.2 中等题（{medium_count}题）
- **题型**：混合运算、应用题、图形计算
- **特征**：两步以上，需转换
- **陷阱**：常见错误、概念混淆
- **示例**：带余除法、面积计算
- **年级例**：
  - 低（1-2）：连加连减、简单应用
  - 中（3-4）：两步应用、组合图形
  - 高（5-6）：分数运算、比例应用

### 4.3 困难题（{hard_count}题）
- **题型**：复杂应用、逻辑推理、探究题
- **特征**：多步骤、隐蔽条件、逆向思维
- **陷阱**：思维定势、多解情况
- **示例**：行程问题、复杂规律
- **年级例**：
  - 低（1-2）：找规律、简单推理
  - 中（3-4）：鸡兔同笼、植树问题
  - 高（5-6）：工程问题、综合应用

---

## 五、题型配置
{question_types}

**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。

**题型要求**：
- 单一题型 ≤ 40%
- 建议4-5种题型
- 计算、概念、应用均衡

---

## 六、质量标准

### 6.1 区分度（核心）
- **基础题**：让绝大多数学生得分
- **中等题**：区分及格与优秀
- **困难题**：筛选数学思维强的学生

### 6.2 严谨性
- ✓ 题干精炼，无废话
- ✓ 条件充分不冗余
- ✓ 答案唯一准确

### 6.3 诊断性
- ✓ 干扰项对应具体思维缺陷
- ✓ 能分析出学生薄弱点

---

## 七、评估专用检查

✅ **必须满足**：
- [ ] 难度分布合理（基30% | 中50% | 难20%）
- [ ] 能力维度均衡（知识、技能、应用）
- [ ] 区分度明确（各层次一致）
- [ ] 答案唯一准确
- [ ] 题目独立无依赖
- [ ] 符合{grade}水平
- [ ] 题型多样（≥4种）
- [ ] 数据真实合理

---

## 八、输出格式
{format_instructions}

**字段说明**：
- `knowledge`: 字符串，精准对应考查点
- `difficulty`: ["简单", "普通", "困难"]
- `answer`: 格式规范
- `question`: 题干严谨
"""


def build_assessment_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建IRT能力评估题目生成的 Prompt

    Args:
        state: 题目生成状态，包含年级、学科、知识点等信息

    Returns:
        包含以下字段的字典：
        - prompt: ChatPromptTemplate 对象
        - prompt_input: 用于格式化 prompt 的输入字典
        - parser: JsonOutputParser 对象

    Note:
        - 基于IRT理论的自适应评估
        - 难度分布：简单30%、普通50%、困难20%
        - 题目具有高区分度，独立性强
    """
    # 提取状态数据
    count = state["count"]
    textbook = state["textbook"]
    subject = textbook.subject
    grade = textbook.grade
    knowledges = state.get("knowledges", [])
    recall_questions = state.get("recall_questions", [])

    # 构建 JSON 输出解析器
    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    remain_count = count - len(recall_questions)
    # 计算难度分布
    distribution = build_difficulty_distribution(remain_count)

    # 构建公共提示词组件
    grade_text, question_types_text, avoid_duplicate_hint = build_common_prompt(
        subject, grade, recall_questions
    )

    # 根据学科选择 prompt 模板
    template = ASSESSMENT_PROMPT_ENGLISH if subject == "英语" else ASSESSMENT_PROMPT_MATH

    # 追加避免重复提示（如有召回的题目）
    if avoid_duplicate_hint:
        template = template + "\n" + avoid_duplicate_hint

    # 构建 ChatPromptTemplate，使用 partial 提前填充 format_instructions 避免 JSON 中的花括号被当作模板变量
    prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", template)])
    prompt = prompt.partial(format_instructions=format_instructions)

    # 构建 prompt 输入参数（format_instructions 已通过 partial 填充，无需在此传入）
    prompt_input = {
        "grade": grade_text,
        "count": remain_count,
        "question_types": question_types_text,
        "knowledge_text": build_knowledges_prompt(knowledges),
        **distribution,  # 包含 simple_count, medium_count, hard_count
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }

