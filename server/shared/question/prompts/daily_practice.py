"""每日练习 Prompt 构建

本模块负责构建个性化的每日练习题目生成提示词，基于学生的学习数据进行智能推荐。
"""

from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from sqlalchemy.ext.asyncio import AsyncSession

from shared.services.student import StudentService
from shared.question.types import QuestionGenerationResult, QuestionGenerationState
from shared.question.prompts.utils import (
    build_common_prompt,
    build_knowledges_prompt,
    build_question_distribution,
    build_units_prompt,
)

SYSTEM_PROMPT = """你是一名资深教研员，专注于个性化学习设计。

**核心职责**：
- 根据学生学习数据，设计个性化每日练习
- 巩固薄弱环节、保持已掌握知识、适度挑战
- 激发学习兴趣，保持学习连续性

**输出要求**：
严格按照 {format_instructions} 生成 JSON 格式输出。"""

DAILY_PRACTICE_PROMPT_ENGLISH = """# 英语每日智能练习

## 一、任务概述
**学科**：英语 | **年级**：{grade} | **题目数量**：{count}道

**练习目标**：巩固听说读写，重点攻克薄弱环节

---

## 二、学生学习画像

### 薄弱知识点（需重点复习）
{weak_knowledge_points}

### 已掌握知识点（需巩固）
{mastered_knowledge_points}

### 需复习单元
{review_units}

---

## 三、题目分布策略

| 类型 | 数量 | 难度 | 来源 | 目标 |
|:-----|:----:|:----:|:-----|:-----|
| **错题复习** | **{wrong_count}** | 简单/普通 | 薄弱知识点 | 攻克薄弱词汇、语法 |
| **巩固练习** | **{mastered_count}** | 普通 | 已掌握知识点 | 保持熟练度 |
| **挑战提升** | **{challenge_count}** | 普通/困难 | 扩展知识点 | 提升理解表达 |
| **新知预习** | **{new_count}** | 简单 | 新知识点 | 预习新单词句型 |

**总计**：{count} 题

---

## 四、题目生成细则

### 4.1 错题复习（{wrong_count}题）
- **来源**：`{weak_knowledge_points}`
- **难度**：优先"简单"，重建信心
- **题型**：
  - 词汇薄弱 → 听音选词、看图选词
  - 语法薄弱 → 句型选择、填空题
  - 听力薄弱 → 简单听力题
- **风格**：鼓励性（"Let's practice again!"）
- **注意**：相似但不完全相同

### 4.2 巩固练习（{mastered_count}题）
- **来源**：`{mastered_knowledge_points}`
- **难度**：普通70% + 简单30%
- **题型**：听说读写多样化
- **搭配**：词汇2 + 语法1 + 听力1 + 口语1
- **节奏**：平滑过渡

### 4.3 挑战提升（{challenge_count}题）
- **来源**：`{challenge_knowledge_points}`（可组合）
- **难度**：普通60% + 困难40%
- **题型**：阅读理解、综合填空、口语表达
- **要点**：词汇拓展、复杂句型、短文理解

### 4.4 新知预习（{new_count}题）
- **来源**：`{new_knowledge_points}`
- **难度**：必须"简单"
- **题型**：听音选词、跟读、看图说话
- **辅助**：题干给出示例、提供语境
- **目的**：激发兴趣

---

## 五、能力均衡要求

| 能力 | 占比 | 题型建议 |
|:-----|:----:|:---------|
| 听力 | 20-30% | 听音选词、听音判断 |
| 口语 | 10-20% | 跟读、角色扮演 |
| 词汇语法 | 40-50% | 选择题、填空题 |
| 阅读 | 10-20% | 阅读理解、判断题 |

**语境要求**：
- 真实交际场景（问候、购物、学校）
- 地道英语表达
- 适当融入文化元素

---

## 六、题型配置
{question_types}

**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。

**题型要求**：
- 单一题型 ≤ 50%
- 使用 3-4 种题型
- 避免连续4题同一题型

---

## 七、学习体验优化

### 7.1 鼓励原则
✅ 积极语言："Well done!" "Try your best!" "You can do it!"
✅ 适当使用简单英语
❌ 避免压力式表达

### 7.2 适龄表述
- 使用{grade}能理解的词汇
- 说明可中文，内容用简单英语
- 题干≤60字

### 7.3 难度曲线
- 前2-3题：简单热身（warm-up）
- 中间：平稳过渡
- 最后1-2题：适度挑战

---

## 八、质量标准

✅ **必须满足**：
- [ ] knowledge 匹配学生画像
- [ ] 分布符合比例（±1题）
- [ ] 听说读写均衡
- [ ] 难度曲线平滑
- [ ] 题干友好，符合{grade}水平
- [ ] 无重复题目
- [ ] 英语表达地道

---

## 九、输出格式
{format_instructions}

**字段说明**：
- `knowledge`: 从学生画像选择
- `resource_content`: 听力/口语使用
- `question`: 可含简单英语
"""


DAILY_PRACTICE_PROMPT_MATH = """# 数学每日智能练习

## 一、任务概述
**学科**：数学 | **年级**：{grade} | **题目数量**：{count}道

**练习目标**：巩固运算能力，重点攻克薄弱知识点

---

## 二、学生学习画像

### 薄弱知识点（需重点复习）
{weak_knowledge_points}

### 已掌握知识点（需巩固）
{mastered_knowledge_points}

### 需复习单元
{review_units}

---

## 三、题目分布策略

| 类型 | 数量 | 难度 | 来源 | 目标 |
|:-----|:----:|:----:|:-----|:-----|
| **错题复习** | **{wrong_count}** | 简单/普通 | 薄弱知识点 | 攻克计算失误、概念混淆 |
| **巩固练习** | **{mastered_count}** | 普通 | 已掌握知识点 | 保持熟练度和准确性 |
| **挑战提升** | **{challenge_count}** | 普通/困难 | 扩展知识点 | 提升思维和解题能力 |
| **新知预习** | **{new_count}** | 简单 | 新知识点 | 预习新知识或题型 |

**总计**：{count} 题

---

## 四、题目生成细则

### 4.1 错题复习（{wrong_count}题）
- **来源**：`{weak_knowledge_points}`
- **难度**：优先"简单"，重建自信
- **题型**：
  - 运算薄弱 → 口算、列式计算
  - 概念薄弱 → 选择题、判断题
  - 应用薄弱 → 简单一步应用
- **数字**：稍简单或同等难度，避免完全相同
- **风格**：鼓励性（"我们再来练习...""相信你能做对！"）

### 4.2 巩固练习（{mastered_count}题）
- **来源**：`{mastered_knowledge_points}`
- **难度**：普通70% + 简单30%
- **题型**：计算、应用、选择、填空
- **搭配**：计算2 + 应用1 + 选择1
- **数据**：
  - 适中数字，便于计算
  - 结果为整数或简单小数/分数
  - 应用题数据真实

### 4.3 挑战提升（{challenge_count}题）
- **来源**：`{challenge_knowledge_points}`（可组合）
- **难度**：普通60% + 困难40%
- **题型**：多步应用、综合运算、找规律
- **要点**：
  - 多步骤思考
  - 可能需转换思维
  - 提供适度提示

### 4.4 新知预习（{new_count}题）
- **来源**：`{new_knowledge_points}`
- **难度**：必须"简单"
- **题型**：概念理解、简单计算
- **辅助**：题干给出概念/公式/示例
- **目的**：初步接触

---

## 五、能力均衡要求

| 能力 | 占比 | 题型建议 |
|:-----|:----:|:---------|
| 计算 | 40-50% | 口算、列式计算 |
| 应用 | 25-35% | 应用题、实际情境 |
| 概念 | 15-25% | 选择题、判断题 |
| 思维 | 5-15% | 找规律、推理题 |

**数据要求**：
- 应用题情境真实（购物、分配、测量）
- 数字符合实际
- 答案有实际意义
- 单位使用规范
- 分数约到最简

---

## 六、题型配置
{question_types}

**注意**：生成的题目类型必须严格限制在上述给定的题型范围内。

**题型要求**：
- 单一题型 ≤ 50%
- 使用 3-4 种题型
- 避免连续4题同一题型
- 计算与应用交替

---

## 七、学习体验优化

### 7.1 鼓励原则
✅ 积极语言："试一试" "你能行" "再接再厉"
✅ 趣味性描述（游戏、故事情境）
❌ 避免压力式："必须" "不能错"

### 7.2 适龄表述
- 使用{grade}能理解的语言
- 避免复杂条件描述
- 场景贴近生活经验

### 7.3 难度曲线
- 前2-3题：简单热身
- 中间：平稳过渡
- 最后1-2题：适度挑战（给提示）

### 7.4 错误预防
- 避免易混数字（689 vs 698）
- 条件清晰无歧义
- 干扰项基于常见错误

---

## 八、质量标准

✅ **必须满足**：
- [ ] knowledge 匹配学生画像
- [ ] 分布符合比例（±1题）
- [ ] 计算答案准确
- [ ] 应用数据真实
- [ ] 难度曲线平滑
- [ ] 题干清晰，符合{grade}水平
- [ ] 无重复或完全相同数字

---

## 九、输出格式
{format_instructions}

**字段说明**：
- `knowledge`: 从学生画像选择
- `answer`: 格式规范（整数、小数、分数）
- `question`: 应用题注意单位完整性
"""


async def build_daily_practice_prompt(state: QuestionGenerationState) -> Dict[str, Any]:
    """构建个性化每日练习题目生成的 Prompt

    Args:
        state: 题目生成状态，包含学生ID、年级、学科等信息

    Returns:
        包含以下字段的字典：
        - prompt: ChatPromptTemplate 对象
        - prompt_input: 用于格式化 prompt 的输入字典
        - parser: JsonOutputParser 对象

    Note:
        - 基于学生学习数据进行个性化推荐
        - 题目分布：错题30%、巩固40%、挑战20%、新知10%
        - 需要异步获取学生学习画像数据
    """
    # 提取状态数据
    db: AsyncSession = state["db"]
    student_id: str = state["student_id"]
    count = state["count"]
    recall_count = state["recall_count"]
    textbook = state["textbook"]
    subject = textbook.subject
    grade = textbook.grade
    recall_questions = state.get("recall_questions", [])

    # 构建 JSON 输出解析器
    parser = JsonOutputParser(pydantic_object=QuestionGenerationResult)
    format_instructions = parser.get_format_instructions()

    # 构建公共提示词组件
    grade_text, question_types_text, avoid_duplicate_hint = build_common_prompt(
        subject, grade, recall_questions
    )

    # 根据学科选择 prompt 模板
    template = DAILY_PRACTICE_PROMPT_ENGLISH if subject == "英语" else DAILY_PRACTICE_PROMPT_MATH

    # 追加避免重复提示（如有召回的题目）
    if avoid_duplicate_hint:
        template = template + "\n" + avoid_duplicate_hint

    # 构建 ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", template)])

    # 获取学生学习数据（异步）
    weak_knowledge_points = await StudentService.get_weak_knowledges(db, student_id)
    mastered_knowledge_points = await StudentService.get_mastered_knowledges(db, student_id)
    challenge_knowledge_points = await StudentService.get_challenge_knowledges(db, student_id)
    new_knowledge_points = await StudentService.get_new_knowledges(db, student_id)
    review_units = await StudentService.get_review_units(db, student_id)

    # 计算题目分布（扣除召回的题目数量）
    remain_count = count - recall_count
    distribution = build_question_distribution(remain_count)

    # 构建 prompt 输入参数
    prompt_input = {
        "grade": grade_text,
        "count": remain_count,
        "question_types": question_types_text,
        "format_instructions": format_instructions,
        "weak_knowledge_points": build_knowledges_prompt(weak_knowledge_points),
        "mastered_knowledge_points": build_knowledges_prompt(mastered_knowledge_points),
        "challenge_knowledge_points": build_knowledges_prompt(challenge_knowledge_points),
        "new_knowledge_points": build_knowledges_prompt(new_knowledge_points),
        "review_units": build_units_prompt(review_units),
        **distribution,  # 包含 wrong_count, mastered_count, challenge_count, new_count
    }

    return {
        "prompt": prompt,
        "prompt_input": prompt_input,
        "parser": parser,
    }
