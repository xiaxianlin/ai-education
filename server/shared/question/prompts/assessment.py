"""能力评估 Prompt 构建"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.constants import get_question_subtypes, get_question_types
from shared.question.types import QuestionGenerationResult, QuestionGenerationState


ASSESSMENT_GENERATION_PROMPT_ENGLISH = """
# 英语IRT自适应能力评测题目生成

## 一、评测目标

本评测基于**IRT（项目反应理论）**自适应算法，旨在全面评估学生的英语综合能力水平：
1. 通过10-20道题快速定位学生英语能力值（范围：-3 到 +3）
2. 能力定位精度：±0.5以内
3. 全面覆盖该年级应掌握的英语核心能力（听说读写）
4. 评测结果可用于判断学生在年级整体水平中的位置

---

## 二、基础信息
- **学科**：英语 (English)
- **年级**：{grade}
- **生成数量**：{count} 道题目

---

## 三、英语能力考察范围

本评测旨在考察学生在**{grade}年级英语学科**的整体能力，题目应覆盖该年级的核心能力维度：

### 3.1 英语学科能力维度
- **词汇能力**（30-40%）：单词识别、拼写、词义理解、词组搭配
- **语法能力**（20-30%）：基础句型、时态、语法规则、句型转换
- **听力能力**（15-25%）：听音辨识、听力理解、听音判断
- **阅读能力**（15-25%）：句子理解、短文阅读、语篇理解
- **口语能力**（5-15%）：发音模仿、简单对话、看图说话

### 3.2 年级能力标准
- **低年级(1-2年级)**：
  - 词汇：50-200个基础单词
  - 语法：简单句型（I am.../This is...）
  - 听力：单词、短句识别
  - 口语：跟读、简单问答
  
- **中年级(3-4年级)**：
  - 词汇：200-600个常用单词
  - 语法：现在时、过去时基础句型
  - 听力：对话理解、短文听力
  - 阅读：简单短文阅读
  
- **高年级(5-6年级)**：
  - 词汇：600-1000个扩展词汇
  - 语法：多种时态、复杂句型
  - 听力：长对话、故事听力
  - 阅读：较长文章、语篇理解

**重要提示**：
- 题目应**均衡分布**在各能力维度
- 不要求题目必须关联特定单元
- 可以跨单元、跨主题出题，只要符合年级能力要求

---

## 四、IRT难度梯度定义（英语）

| 难度等级 | IRT值范围 | 认知要求 | 预期通过率 | 能力体现 |
|---------|----------|---------|-----------|---------|
| **简单** | -1.5 ~ -0.5 | 直接识别、基础记忆、简单理解 | 85%-95% | 基础词汇识别、简单句型理解 |
| **普通** | -0.5 ~ +0.5 | 理解应用、简单推理、语境使用 | 50%-75% | 词义理解、语法应用、听力理解 |
| **困难** | +0.5 ~ +1.5 | 综合应用、语篇理解、复杂表达 | 20%-40% | 词汇扩展、复杂语法、阅读理解 |

**英语难度设计原则**：
- **简单题**：考察本年级最基础的词汇和句型
- **普通题**：考察本年级标准要求的语法和表达
- **困难题**：考察拓展词汇、复杂句型或语篇理解

---

## 五、题目分布要求

### 5.1 难度分配
- **简单题**：{simple_count} 题（30%）
- **普通题**：{medium_count} 题（50%）
- **困难题**：{hard_count} 题（20%）

### 5.2 能力维度覆盖（建议）
根据题目总数均衡分配：
- **10题总量**：词汇3题 + 听力2题 + 语法2题 + 阅读2题 + 口语1题
- **15题总量**：词汇5题 + 听力3题 + 语法3题 + 阅读3题 + 口语1题
- **20题总量**：词汇6题 + 听力4题 + 语法4题 + 阅读4题 + 口语2题

### 5.3 题型要求
- **优先选择**：选择题、听音选词、判断题（便于自动判分）
- **适度使用**：填空题（答案唯一）、听力题、口语跟读
- **避免使用**：开放性题目、主观性强的题目

### 5.4 题目独立性
- 每道题应独立考察一个能力点
- 题目之间不应有依赖关系
- 避免题目间的提示效应

---

## 六、题型配置
**可用主题型**：{question_types}

**题型子类型说明**：
{subtype_info}

**题型选择建议**：
- 词汇能力：选择题、听音选词、看图选词
- 语法能力：选择题、填空题、判断题
- 听力能力：听音选词、听音判断、听力理解
- 阅读能力：阅读选择、判断题
- 口语能力：跟读句子、角色扮演

**题型数量限制**：单一题型最多不超过总题数的40%

---

## 七、质量控制标准

### 7.1 题目区分度（核心指标）
- ✅ **简单题**：85%+学生能做对（基础词汇、简单句型）
- ✅ **普通题**：50-75%学生能做对（常用词汇、标准语法）
- ✅ **困难题**：20-40%学生能做对（扩展词汇、复杂理解）

### 7.2 语言准确性
- 使用标准英语表达
- 语法正确，拼写无误
- 符合英语国家语言习惯

### 7.3 能力考察纯度
- 每道题主要考察1个核心能力
- 词汇题就考词汇，不混杂复杂语法
- 听力题重点考听力，不要求复杂推理

### 7.4 年级适配性
- 词汇难度符合{grade}年级课程标准
- 句型复杂度适合年级水平
- 不出现超纲或低于年级的内容

---

## 八、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**关键字段说明**：
- `knowledge` 字段：可填写能力维度（如"词汇能力"、"语法能力"）
- `difficulty` 字段：必须从 ["简单", "普通", "困难"] 中选择
- `resource_content` 用于听力和口语题

---

## 九、评测专用质量检查清单

- [ ] **难度分布**：简单30% / 普通50% / 困难20%（允许±1题误差）
- [ ] **能力覆盖**：词汇、语法、听力、阅读、口语均衡分布
- [ ] **题目区分度**：每个难度层次内题目难度相对一致
- [ ] **判分友好性**：所有题目答案唯一，便于自动判分
- [ ] **题目独立性**：题目间无依赖关系，无提示效应
- [ ] **年级适配性**：符合{grade}年级英语水平
- [ ] **题型多样性**：至少3种以上题型，单一题型≤40%
- [ ] **语言准确性**：英语表达地道，无中式英语
"""


ASSESSMENT_GENERATION_PROMPT_MATH = """
# 数学IRT自适应能力评测题目生成

## 一、评测目标

本评测基于**IRT（项目反应理论）**自适应算法，旨在全面评估学生的数学综合能力水平：
1. 通过10-20道题快速定位学生数学能力值（范围：-3 到 +3）
2. 能力定位精度：±0.5以内
3. 全面覆盖该年级应掌握的数学核心能力
4. 评测结果可用于判断学生在年级整体水平中的位置

---

## 二、基础信息
- **学科**：数学 (Mathematics)
- **年级**：{grade}
- **生成数量**：{count} 道题目

---

## 三、数学能力考察范围

本评测旨在考察学生在**{grade}年级数学学科**的整体能力，题目应覆盖该年级的核心能力维度：

### 3.1 数学学科能力维度
- **数感与运算**（30-40%）：数的认识、加减乘除、四则运算、心算能力
- **图形与空间**（15-25%）：图形识别、周长面积、空间想象
- **量的测量**（10-15%）：长度、重量、时间、货币认识与换算
- **应用能力**（25-35%）：实际问题建模、多步骤应用题
- **逻辑推理**（5-15%）：找规律、数字推理、问题解决

### 3.2 年级能力标准
- **低年级(1-2年级)**：
  - 运算：20以内/100以内加减法
  - 图形：基础图形识别
  - 应用：一步应用题
  - 测量：长度、时间基础认识
  
- **中年级(3-4年级)**：
  - 运算：万以内四则运算、简单分数
  - 图形：周长面积计算
  - 应用：两步应用题
  - 推理：简单找规律
  
- **高年级(5-6年级)**：
  - 运算：多位数运算、分数小数、百分数
  - 图形：组合图形、立体图形
  - 应用：复杂多步应用题
  - 推理：数学归纳、问题解决

**重要提示**：
- 题目应**均衡分布**在各能力维度
- 不要求题目必须关联特定单元
- 可以跨单元、跨主题出题，只要符合年级能力要求

---

## 四、IRT难度梯度定义（数学）

| 难度等级 | IRT值范围 | 认知要求 | 预期通过率 | 能力体现 |
|---------|----------|---------|-----------|---------|
| **简单** | -1.5 ~ -0.5 | 直接识别、基础运算、一步操作 | 85%-95% | 基础加减法、简单图形识别 |
| **普通** | -0.5 ~ +0.5 | 两步运算、一般应用、概念理解 | 50%-75% | 乘除法运算、两步应用题 |
| **困难** | +0.5 ~ +1.5 | 多步综合、复杂应用、逻辑推理 | 20%-40% | 综合运算、复杂应用、找规律 |

**数学难度设计原则**：
- **简单题**：考察本年级最基础的运算和概念
- **普通题**：考察本年级标准要求的运算和应用能力
- **困难题**：考察综合能力和数学思维

---

## 五、题目分布要求

### 5.1 难度分配
- **简单题**：{simple_count} 题（30%）
- **普通题**：{medium_count} 题（50%）
- **困难题**：{hard_count} 题（20%）

### 5.2 能力维度覆盖（建议）
根据题目总数均衡分配：
- **10题总量**：运算4题 + 应用3题 + 图形2题 + 推理1题
- **15题总量**：运算5题 + 应用5题 + 图形3题 + 推理2题
- **20题总量**：运算7题 + 应用6题 + 图形4题 + 推理3题

### 5.3 题型要求
- **优先选择**：选择题、填空题、计算题（便于自动判分）
- **适度使用**：应用题、判断题
- **避免使用**：需要画图、开放性答案的题目

### 5.4 题目独立性
- 每道题应独立考察一个能力点
- 题目之间不应有依赖关系
- 避免题目间的提示效应

---

## 六、题型配置
**可用主题型**：{question_types}

**题型子类型说明**：
{subtype_info}

**题型选择建议**：
- 数感运算：计算题、口算题、填空题、选择题
- 图形空间：选择题、判断题、填空题
- 量的测量：选择题、应用题
- 应用能力：应用题、填空题
- 逻辑推理：找规律、选择题

**题型数量限制**：单一题型最多不超过总题数的40%

---

## 七、质量控制标准

### 7.1 题目区分度（核心指标）
- ✅ **简单题**：85%+学生能做对（基础运算、简单识别）
- ✅ **普通题**：50-75%学生能做对（标准运算、一般应用）
- ✅ **困难题**：20-40%学生能做对（综合能力、复杂思维）

### 7.2 数学准确性
- 计算结果准确无误
- 单位使用规范
- 数学概念表述严谨

### 7.3 能力考察纯度
- 每道题主要考察1个核心能力
- 运算题就考运算，不混入复杂应用
- 应用题重点考应用，数字不要过于复杂

### 7.4 年级适配性
- 数字大小符合{grade}年级水平
- 不出现超纲知识
- 运算复杂度适合年级要求

### 7.5 数据合理性
- 应用题情境真实
- 数字符合实际（价格、数量等）
- 答案有实际意义（人数应为整数）

---

## 八、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**关键字段说明**：
- `knowledge` 字段：可填写能力维度（如"数感与运算"、"应用能力"）
- `difficulty` 字段：必须从 ["简单", "普通", "困难"] 中选择
- `answer` 数字结果注意格式规范

---

## 九、评测专用质量检查清单

- [ ] **难度分布**：简单30% / 普通50% / 困难20%（允许±1题误差）
- [ ] **能力覆盖**：运算、应用、图形、推理均衡分布
- [ ] **题目区分度**：每个难度层次内题目难度相对一致
- [ ] **计算准确性**：所有答案经过验算，确保正确
- [ ] **判分友好性**：答案唯一，便于自动判分
- [ ] **题目独立性**：题目间无依赖关系，无提示效应
- [ ] **年级适配性**：符合{grade}年级数学水平
- [ ] **题型多样性**：至少3种以上题型，单一题型≤40%
- [ ] **数据合理性**：应用题情境和数据真实可信
"""


def _build_knowledge_text(knowledges: list[str]) -> str:
    """构建知识点文本"""
    if not knowledges:
        return "暂无知识点信息"

    knowledge_lines = [f"- {knowledge}" for knowledge in knowledges]
    return "\n".join(knowledge_lines)


def _build_subtype_info(question_types: list[str]) -> str:
    """构建题型子类型信息"""
    subtype_info_lines = []
    for qtype in question_types:
        subtypes = get_question_subtypes(qtype)
        if subtypes:
            subtype_info_lines.append(f"{qtype}：{'、'.join(subtypes)}")
    return "\n".join(subtype_info_lines) if subtype_info_lines else "无子类型要求"


def _build_avoid_duplicate_hint(recall_questions: list) -> str:
    """构建避免重复题目的提示信息"""
    if not recall_questions:
        return ""

    recalled_questions_info_lines = []
    for recall_question in recall_questions:
        recalled_questions_info_lines.append(
            f"- 题目ID: {recall_question.id}, "
            f"题干: {recall_question.question}, "
            f"选项: {recall_question.options}"
        )

    recalled_questions_info = "\n".join(recalled_questions_info_lines)

    return (
        f"\n\n## 重要：避免题目重复\n"
        f"以下题目已从数据库召回，请确保生成的题目与这些题目不重复或高度相似：\n"
        f"{recalled_questions_info}\n"
        f"请生成全新的、与上述题目不同的题目。"
    )


def build_assessment_prompt(state: QuestionGenerationState) -> dict:
    """构建能力评估prompt

    返回包含以下字段的字典：
    - prompt: ChatPromptTemplate 对象
    - prompt_input: 用于格式化 prompt 的输入字典
    - parser: JsonOutputParser 对象
    """
    # 提取状态数据
    textbook = state["textbook"]
    count = state["count"]
    grade = state["grade"]
    subject = state["subject"]
    knowledges = state.get("knowledges", [])
    recall_questions = state.get("recall_questions", [])

    # 构建格式说明
    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    # 获取题型配置
    question_types = get_question_types(textbook.subject, textbook.grade)
    if not question_types:
        raise ValueError(
            f"科目 {textbook.subject} 的 {textbook.grade} 年级暂不支持题目生成。"
            f"目前仅支持一年级的英语和数学。"
        )

    # 计算难度分布
    simple_count = max(1, int(count * 0.3))
    medium_count = max(1, int(count * 0.5))
    hard_count = count - simple_count - medium_count

    # 构建各种文本信息
    question_types_str = "、".join(question_types)
    subtype_info = _build_subtype_info(question_types)
    avoid_duplicate_hint = _build_avoid_duplicate_hint(recall_questions)

    # 获取prompt模板并追加避免重复提示
    assessment_prompt_template = (
        subject == "英语"
        and ASSESSMENT_GENERATION_PROMPT_ENGLISH
        or ASSESSMENT_GENERATION_PROMPT_MATH
    )
    if avoid_duplicate_hint:
        assessment_prompt_template = assessment_prompt_template + avoid_duplicate_hint

    # 构建 ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业教研员，负责设计IRT自适应能力评估题目。"
                "你的目标是生成高质量、区分度高、符合学生认知水平的评估题目。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", assessment_prompt_template),
        ]
    )

    # 构建 prompt 输入参数
    prompt_input = {
        "grade": grade,
        "count": count,
        "simple_count": simple_count,
        "medium_count": medium_count,
        "hard_count": hard_count,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "format_instructions": format_instructions,
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }
