"""能力评估 Prompt 构建"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.constants import get_question_subtypes, get_question_types
from shared.question.types import QuestionGenerationResult, QuestionGenerationState
from shared.question.prompts.prompt_utils import (
    build_knowledge_text,
    build_subtype_info,
    build_avoid_duplicate_hint,
    build_difficulty_distribution,
    build_question_types_text,
)
from shared.question.prompts.prompt_templates import ASSESSMENT_SYSTEM_PROMPT


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
- **评估范围**：全教材/阶段性评估
- **生成数量**：{count} 道题目
- **评估目标**：精准测量数学思维水平，构建能力模型

---

## 二、评估知识点范围
{knowledge_text}

**知识点分类说明**：
- **概念理解**：定义、性质、定理的认识
- **运算求解**：算法、算理、精确计算
- **逻辑推理**：归纳、演绎、证明
- **问题解决**：建模、应用、综合分析

---

## 三、IRT自适应评估策略

本次生成采用**项目反应理论 (IRT)** 导向的题目设计：

### 3.1 难度梯度（区分度优先）
| 难度等级 | 比例 | 目标学生群体 | 设计意图 |
|---------|------|-------------|---------|
| **基础题** | {simple_count}题 | 学困生/中等生 | 考查基本概念和基本运算 |
| **中等题** | {medium_count}题 | 中等生/优等生 | 考查变式应用和综合能力 |
| **难题** | {hard_count}题 | 优等生/尖子生 | 考查创新思维和复杂问题解决 |

### 3.2 能力维度覆盖
- **基础知识 (30%)**：概念清晰，记忆准确
- **基本技能 (40%)**：运算熟练，作图规范
- **综合应用 (30%)**：分析问题，解决问题

---

## 四、数学题目生成细则

### 4.1 基础题（{simple_count}题）
- **题型**：直接计算、概念判断、简单填空
- **特征**：一步得出结果，无思维陷阱
- **示例**：20以内加减法，图形名称识别
- **难度系数**：0.1 - 0.4

### 4.2 中等题（{medium_count}题）
- **题型**：混合运算、简单应用题、图形计算
- **特征**：两步及以上运算，需要简单转换
- **陷阱**：设置常见计算错误或概念混淆点
- **示例**：带余除法应用，周长计算
- **难度系数**：0.5 - 0.7

### 4.3 难题（{hard_count}题）
- **题型**：复杂应用题、逻辑推理、探究题
- **特征**：多步骤，隐蔽条件，逆向思维
- **陷阱**：思维定势干扰，多解情况
- **示例**：行程问题，找规律填数（复杂）
- **难度系数**：0.8 - 1.0

---

## 五、数学特殊题型规范

### 5.1 应用题评估
- **情境**：必须新颖且合理，避免陈旧套路
- **数据**：设计需严谨，避免出现矛盾条件
- **建模**：中难题应需要学生自己构建数学模型

### 5.2 概念题评估
- **辨析**：重点考查概念的内涵和外延
- **反例**：通过判断题考查对反例的认识

### 5.3 运算题评估
- **算理**：不仅考结果，更隐含考查运算定律
- **技巧**：难题可涉及简便运算技巧

---

## 六、题型配置
**可用主题型**：{question_types}

**题型子类型说明**：
{subtype_info}

**题型多样性要求**：
- **题型数量限制**：单一题型最多不超过总题数的40%
- 建议使用4-5种不同题型
- 计算、概念、应用均衡分布

---

## 七、质量控制（评估专用）

### 7.1 区分度控制
- ✅ 基础题应让绝大多数学生得分
- ✅ 中等题应能区分及格与优秀
- ✅ 难题应能筛选出数学思维好的学生

### 7.2 严谨性控制
- ✅ 题干语言精炼，无废话
- ✅ 条件充分且不冗余
- ✅ 答案唯一且准确

### 7.3 诊断性控制
- ✅ 错误选项应对应具体的思维缺陷
- ✅ 能通过做题情况分析出学生薄弱点

---

## 八、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**数学评估关键字段**：
- `knowledge` 必须是字符串，精准对应考查点
- `difficulty` 必须严格按照分布要求设置 (0.1-0.9)
- `answer` 格式标准
- `question` 题干严谨
"""


def build_assessment_prompt(state: QuestionGenerationState) -> dict:
    """构建学业水平评估prompt

    返回包含以下字段的字典：
    - prompt: ChatPromptTemplate 对象
    - prompt_input: 用于格式化 prompt 的输入字典
    - parser: JsonOutputParser 对象
    """
    # 提取状态数据
    textbook = state["textbook"]
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

    # 计算难度分布
    # 计算难度分布
    difficulty_distribution = build_difficulty_distribution(count)
    simple_count = difficulty_distribution["simple_count"]
    medium_count = difficulty_distribution["medium_count"]
    hard_count = difficulty_distribution["hard_count"]

    # 使用工具函数构建各种文本信息
    question_types_str = build_question_types_text(question_types)
    subtype_info = build_subtype_info(question_types)
    knowledge_text = build_knowledge_text(knowledges)
    avoid_duplicate_hint = build_avoid_duplicate_hint(recall_questions)

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
            ("system", ASSESSMENT_SYSTEM_PROMPT),
            ("human", assessment_prompt_template),
        ]
    )

    # 构建 prompt 输入参数
    prompt_input = {
        "grade": grade,
        "count": count,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "knowledge_text": knowledge_text,
        "format_instructions": format_instructions,
        "simple_count": simple_count,
        "medium_count": medium_count,
        "hard_count": hard_count,
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }
