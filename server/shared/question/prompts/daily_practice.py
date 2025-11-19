"""今日练习 Prompt 构建"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from server.core.constants import get_question_subtypes, get_question_types
from shared.question.types import QuestionGenerationResult, QuestionGenerationState

DAILY_PRACTICE_PROMPT_ENGLISH = """
# 英语今日智能练习生成任务

## 一、基础信息
- **学科**：英语 (English)
- **年级**：{grade}
- **生成数量**：{count} 道题目
- **练习目标**：巩固英语听说读写能力，重点复习薄弱环节

---

## 二、学生学习画像（近期数据）

### 2.1 薄弱知识点（需重点复习）
{weak_knowledge_analysis}

### 2.2 已掌握知识点（需巩固）
{mastered_knowledge_list}

### 2.3 需要复习的单元提醒
{review_units_reminder}

---

## 三、题目分布策略

根据学生学习状态，按以下比例生成题目：

| 类型 | 数量 | 难度 | 知识点来源 | 英语学习目标 |
|------|------|------|-----------|------------|
| **错题复习** | {wrong_count}题 | 简单/普通 | {weak_knowledge_points} | 重点攻克薄弱词汇、语法点 |
| **巩固练习** | {consolidation_count}题 | 普通 | {mastered_knowledge} | 保持已学单词、句型的熟练度 |
| **挑战题** | {challenge_count}题 | 普通/困难 | {challenge_knowledge} | 提升语言理解和表达能力 |
| **新知引入** | {new_count}题 | 简单 | {new_knowledge} | 预习新单词或句型 |

**总计**：{count} 题

---

## 四、英语题目生成细则

### 4.1 错题复习题（{wrong_count}题）
- **知识点**：必须从 `{weak_knowledge_points}` 中选择
- **难度**：优先"简单"，帮助学生重建信心
- **题型选择**：
  - 词汇薄弱：听音选词、看图选词、选择题
  - 语法薄弱：句型选择、填空题
  - 听力薄弱：简单听力理解题
- **题干风格**：鼓励性语言，如"Let's practice again!"
- **避免陷阱**：不使用完全相同的错题，但可出相似题型

### 4.2 巩固练习题（{consolidation_count}题）
- **知识点**：从 `{mastered_knowledge}` 中均匀选择
- **难度**：以"普通"为主（70%），"简单"为辅（30%）
- **题型**：多样化，包括听说读写各技能
- **建议搭配**：词汇2题 + 语法1题 + 听力1题 + 口语1题（根据总数调整）
- **节奏**：难度平滑过渡，保持学习兴趣

### 4.3 挑战题（{challenge_count}题）
- **知识点**：可组合多个知识点（如词汇+语法）
- **难度**：60%"普通"，40%"困难"
- **题型偏好**：阅读理解、综合填空、口语表达
- **设计要点**：
  - 词汇拓展（同义词、反义词、词组搭配）
  - 复杂句型理解
  - 短文阅读与理解

### 4.4 新知引入题（{new_count}题）
- **知识点**：从 `{new_knowledge}` 中选择
- **难度**：必须是"简单"
- **题型**：听音选词、跟读、看图说话
- **题干要求**：
  - 可以在题干中给出单词或句型的示例
  - 提供图片或语境帮助理解
  - 重在激发兴趣，不要求完全掌握

---

## 五、英语练习特色要求

### 5.1 听说能力均衡
- 听力题占比：20-30%
- 口语题占比：10-20%
- 词汇语法题占比：40-50%
- 阅读题占比：10-20%

### 5.2 真实语境
- 题目设置在真实交际场景（问候、购物、学校生活等）
- 使用地道的英语表达
- 避免生硬翻译式英语

### 5.3 文化渗透
- 适当融入英语国家文化元素
- 帮助学生了解语言背后的文化背景

---

## 六、题型配置
**可用主题型**：{question_types}

**题型子类型说明**：
{subtype_info}

**题型多样性要求**：
- **题型数量限制**：单一题型最多不超过总题数的50%
- 建议使用3-4种不同题型，保持练习趣味性
- 避免连续4道题使用同一题型

---

## 七、学习体验优化

### 7.1 友好鼓励原则
- ✅ 使用积极语言："Well done!"、"Try your best!"、"You can do it!"
- ✅ 在题干中适当使用简单英语，增加语言浸润
- ❌ 避免过于严肃或压力式表达

### 7.2 适龄表述
- 题干使用{grade}年级学生能理解的英语词汇
- 说明部分可使用中文，核心内容尽量用简单英语
- 每道题题干（中英文合计）不超过60字

### 7.3 学习连续性
- 前2-3题使用"简单"难度作为热身（warm-up）
- 中间题目平稳过渡
- 最后1-2题可稍有挑战，但要确保学生有能力完成

---

## 八、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**英语练习关键字段**：
- `knowledge` 必须是字符串，从学生画像中的知识点选择
- `resource_content` 用于听力和口语题，填写标准英语文本
- `question` 可包含简单英语说明
- 题目间避免重复或高度相似

---

## 九、质量检查清单

- [ ] 每道题的knowledge字段与学生学习画像匹配
- [ ] 题目分布符合指定比例（允许±1题误差）
- [ ] 听说读写能力均衡覆盖
- [ ] 难度曲线平滑，前期简单，后期适度挑战
- [ ] 题干语气友好，符合{grade}年级英语水平
- [ ] 无重复题目或高度相似题目
- [ ] 英语表达地道，无中式英语
"""


DAILY_PRACTICE_PROMPT_MATH = """
# 数学今日智能练习生成任务

## 一、基础信息
- **学科**：数学 (Mathematics)
- **年级**：{grade}
- **生成数量**：{count} 道题目
- **练习目标**：巩固数学运算能力，重点攻克薄弱知识点

---

## 二、学生学习画像（近期数据）

### 2.1 薄弱知识点（需重点复习）
{weak_knowledge_analysis}

### 2.2 已掌握知识点（需巩固）
{mastered_knowledge_list}

### 2.3 需要复习的单元提醒
{review_units_reminder}

---

## 三、题目分布策略

根据学生学习状态，按以下比例生成题目：

| 类型 | 数量 | 难度 | 知识点来源 | 数学学习目标 |
|------|------|------|-----------|------------|
| **错题复习** | {wrong_count}题 | 简单/普通 | {weak_knowledge_points} | 攻克计算失误、概念混淆 |
| **巩固练习** | {consolidation_count}题 | 普通 | {mastered_knowledge} | 保持运算熟练度和准确性 |
| **挑战题** | {challenge_count}题 | 普通/困难 | {challenge_knowledge} | 提升数学思维和解题能力 |
| **新知引入** | {new_count}题 | 简单 | {new_knowledge} | 预习新知识点或新题型 |

**总计**：{count} 题

---

## 四、数学题目生成细则

### 4.1 错题复习题（{wrong_count}题）
- **知识点**：必须从 `{weak_knowledge_points}` 中选择
- **难度**：优先"简单"，帮助学生重建自信
- **题型选择**：
  - 运算薄弱：口算题、列式计算
  - 概念薄弱：选择题、判断题
  - 应用薄弱：简单一步应用题
- **数字选择**：
  - 比原错题稍简单或同等难度
  - 避免完全相同的数字组合
- **题干风格**：鼓励性，如"我们再来练习一下...""相信你这次能做对！"

### 4.2 巩固练习题（{consolidation_count}题）
- **知识点**：从 `{mastered_knowledge}` 中均匀选择
- **难度**：以"普通"为主（70%），"简单"为辅（30%）
- **题型**：多样化，包括计算、应用、选择、填空
- **建议搭配**：计算2题 + 应用1题 + 选择1题（根据总数调整）
- **数据设计**：
  - 数字适中，便于口算或笔算
  - 结果为整数或简单小数/分数
  - 应用题数据真实合理

### 4.3 挑战题（{challenge_count}题）
- **知识点**：可组合多个知识点
- **难度**：60%"普通"，40%"困难"
- **题型偏好**：
  - 多步骤应用题
  - 综合运算题
  - 找规律、数字推理题
- **设计要点**：
  - 需要多步骤思考
  - 可能需要转换思维角度
  - 提供适度提示，避免完全无从下手

### 4.4 新知引入题（{new_count}题）
- **知识点**：从 `{new_knowledge}` 中选择
- **难度**：必须是"简单"
- **题型**：概念理解题、简单计算题
- **题干要求**：
  - 在题干中给出必要的概念解释或公式
  - 提供示例帮助理解
  - 重在让学生初步接触，不要求完全掌握

---

## 五、数学练习特色要求

### 5.1 能力均衡覆盖
- 计算能力：40-50%
- 应用能力：25-35%
- 概念理解：15-25%
- 逻辑思维：5-15%

### 5.2 数据真实性
- 应用题情境贴近生活（购物、分配、测量等）
- 数字符合实际（价格、数量、长度等要合理）
- 答案有实际意义（人数、物品数量应为整数）

### 5.3 运算规范性
- 单位使用规范统一
- 计算结果准确
- 分数需约到最简
- 小数保留位数明确

---

## 六、题型配置
**可用主题型**：{question_types}

**题型子类型说明**：
{subtype_info}

**题型多样性要求**：
- **题型数量限制**：单一题型最多不超过总题数的50%
- 建议使用3-4种不同题型
- 避免连续4道题使用同一题型
- 计算题与应用题交替出现，避免枯燥

---

## 七、学习体验优化

### 7.1 友好鼓励原则
- ✅ 使用积极语言："试一试"、"你能行"、"再接再厉"
- ✅ 适当使用趣味性描述（如游戏、故事情境）
- ❌ 避免压力式表达："必须"、"不能错"

### 7.2 适龄表述
- 题干使用{grade}年级学生能理解的语言
- 避免过于复杂的条件或背景描述
- 应用题场景贴近学生生活经验

### 7.3 学习连续性
- 前2-3题使用"简单"难度作为热身
- 中间题目难度平稳过渡
- 最后1-2题可以是挑战题，但要给出适度提示

### 7.4 错误预防
- 计算题避免易混淆的数字（如689和698）
- 应用题条件清晰，不产生歧义
- 选择题干扰项基于常见错误，不是随意编造

---

## 八、输出格式要求
严格按照以下JSON Schema输出：
{format_instructions}

**数学练习关键字段**：
- `knowledge` 必须是字符串，从学生画像中的知识点选择
- `answer` 数字格式规范（整数、小数、分数）
- `question` 应用题注意单位和条件的完整性
- 题目间避免重复或数字完全相同

---

## 九、质量检查清单

- [ ] 每道题的knowledge字段与学生学习画像匹配
- [ ] 题目分布符合指定比例（允许±1题误差）
- [ ] 计算题答案准确无误
- [ ] 应用题数据真实合理
- [ ] 难度曲线平滑，无突然跳跃
- [ ] 题干表述清晰，符合{grade}年级理解水平
- [ ] 无重复题目或完全相同的数字组合
"""


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


def build_daily_practice_prompt(state: QuestionGenerationState) -> dict:
    """构建今日练习prompt

    返回包含以下字段的字典：
    - prompt: ChatPromptTemplate 对象
    - prompt_input: 用于格式化 prompt 的输入字典
    - parser: JsonOutputParser 对象
    """
    # 提取状态数据
    textbook = state["textbook"]
    count = state["count"]
    subject = state["subject"]
    recall_questions = state.get("recall_questions", [])

    # 简化版：使用默认的知识点分布
    weak_knowledge = state.get("weak_knowledge", [])
    mastered_knowledge = state.get("mastered_knowledge", [])

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

    # 计算题目分布
    wrong_count = max(1, int(count * 0.3))
    consolidation_count = int(count * 0.4)
    challenge_count = int(count * 0.2)
    new_count = count - wrong_count - consolidation_count - challenge_count

    # 构建各种文本信息
    question_types_str = "、".join(question_types)
    subtype_info = _build_subtype_info(question_types)
    avoid_duplicate_hint = _build_avoid_duplicate_hint(recall_questions)

    # 格式化知识点信息
    weak_knowledge_analysis = (
        "\n".join([f"- **{k}**" for k in weak_knowledge[:5]])
        if weak_knowledge
        else "（暂无明显薄弱知识点，学生整体掌握良好）"
    )
    mastered_knowledge_list = (
        "、".join(mastered_knowledge[:10]) if mastered_knowledge else "（暂无已掌握知识点数据）"
    )

    # 获取prompt模板并追加避免重复提示
    daily_prompt_template = (
        subject == "英语" and DAILY_PRACTICE_PROMPT_ENGLISH or DAILY_PRACTICE_PROMPT_MATH
    )
    if avoid_duplicate_hint:
        daily_prompt_template = daily_prompt_template + avoid_duplicate_hint

    # 构建 ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一名专业的教研员，擅长根据学生的学习数据设计个性化的日常练习。"
                "你的目标是帮助学生巩固薄弱环节、保持已掌握知识、挑战更高难度，并激发学习兴趣。"
                "请严格按照 {format_instructions} 生成 JSON 输出。",
            ),
            ("human", daily_prompt_template),
        ]
    )

    # 构建 prompt 输入参数
    prompt_input = {
        "grade": textbook.grade,
        "semester": textbook.semester,
        "count": count,
        "question_types": question_types_str,
        "subtype_info": subtype_info,
        "format_instructions": format_instructions,
        "weak_knowledge_analysis": weak_knowledge_analysis,
        "mastered_knowledge_list": mastered_knowledge_list,
        "review_units_reminder": "（近期无需复习的单元）",
        "weak_knowledge_points": "、".join(weak_knowledge[:5]) or "（无）",
        "mastered_knowledge": "、".join(mastered_knowledge[:8]) or "（无）",
        "challenge_knowledge": (
            "、".join(mastered_knowledge[-3:]) if mastered_knowledge else "（无）"
        ),
        "new_knowledge": "、".join(mastered_knowledge[-3:]) if mastered_knowledge else "（无）",
        "wrong_count": wrong_count,
        "consolidation_count": consolidation_count,
        "challenge_count": challenge_count,
        "new_count": new_count,
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }
