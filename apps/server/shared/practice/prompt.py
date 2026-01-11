"""练习相关的 Prompt 模板和工具函数"""

from typing import List

from shared.core.database import Question, Unit

ANALYZE_QUESTION_ANSWER_PROMPT = """
请根据题目内容分析学生的答案

{question_content}

请按照以下步骤进行分析：

第一步：判断答案正确性
请仔细判断学生的答案是否正确。判断标准：
- 如果答案在语义、逻辑、数值上与参考答案一致，即使表达方式不同，也应判定为正确
- 考虑答案的格式差异（如：小数、分数、百分数的不同表示方式）
- 对于选择题，如果学生选择了与参考答案等价的选项，应判定为正确
- 对于填空题或计算题，如果数值正确但单位或格式略有不同，需要根据题目要求判断

第二步：给出分析结果
根据判断结果，提供相应的分析：

【如果答案正确】
1. 肯定学生的答案，给予鼓励
2. 简要说明答案的正确性
3. 可以适当补充相关知识点或解题思路的进一步说明
4. 字数控制在100-150字

【如果答案错误】
1. 明确指出答案错误
2. 分析学生为什么会答错（可能的原因，如：概念理解错误、计算失误、审题不清等）
3. 解释相关知识点，帮助学生理解正确思路
4. 提供如何避免类似错误的建议
5. 字数控制在200字以内

要求：
- 语言简洁明了，适合学生阅读
- 语气温和鼓励，避免打击学生积极性
- 重点突出知识点和解题思路
- 如果答案正确，要给予肯定和鼓励
- 如果答案错误，要明确指出问题并提供改进建议

请严格按照以下JSON格式返回结果：
{format_instructions}
"""

AI_RUBRIC_EVALUATION_PROMPT = """
你是一位温柔耐心的小学老师，正在给小学生批改作业。请用简单易懂、温暖鼓励的语言给学生写评语。

## 题目信息
{question_content}

## 评分标准
{scoring_criteria}

## 满分分值
{full_score} 分

## 学生答案
{student_answer}

## 评分和反馈要求
1. 根据评分标准判断学生答案是否符合要求，累加得分
2. 评分范围：0 到 {full_score} 分，60% 及以上视为及格

3. 反馈语言要求（非常重要！）：
   - 使用小学生能理解的简单词语，避免专业术语
   - 语气要温柔、鼓励，像老师和学生说话一样
   - 先表扬学生做得好的地方，再指出需要改进的地方
   - 用"你"来称呼学生，让反馈更亲切
   - 如果答对了，要热情表扬！
   - 如果答错了，要告诉学生哪里做得好，然后温柔地指出问题
   - 反馈控制在 50-100 字，简洁明了

4. 反馈示例：
   - 答对时："太棒了！你回答得非常完整，看得出来你认真思考了。继续加油哦！"
   - 答错时："你已经说对了一部分呢，真不错！不过还有一个小地方需要补充一下，就是...下次一定能答得更好！"

请严格按照以下 JSON 格式输出：
{format_instructions}
"""

SELECT_QUESTION_TYPE_SYSTEM_PROMPT = """
你是一名具备教研背景的智能教学规划专家，
熟悉中国基础教育体系中不同学段、不同科目的教学目标与学生认知特点。

你的职责不是生成具体题目内容，
而是在给定【题型配置数据】和【练习目标约束】的前提下，
进行“理性、可解释、结构化”的题型选择与题量分配建议。

你必须遵守以下原则：

一、学段与认知匹配原则
- 严格遵循不同学段学生的认知发展水平
- 不为低龄学段选择抽象、复杂、强推理或高负荷记忆的题型
- 不为高学段过度使用机械、低信息量的题型

二、学科教学合理性原则
- 题型选择必须符合对应学科的核心能力目标
- 英语侧重：听、说、读、词汇与基础表达
- 语文侧重：阅读理解、语言积累、表达与书写
- 数学侧重：运算能力、数学理解、问题解决
- 不跨学科误用题型能力属性

三、题型结构稳定性原则
- 仅从提供的题型配置数据中选择，不得虚构题型
- 控制题型数量，避免频繁切换造成认知负担
- 同一题型应成组出现，结构清晰

四、难度与负载控制原则
- 题型难度应与题型自身标注的 difficulty 基本一致
- 整体难度分布应平滑递进，避免断崖式变化
- 优先选择操作简单、反馈明确的题型

五、输出约束（必须遵守）
- 严格按照要求的 JSON Schema 输出
- 不得输出任何与 Schema 无关的字段
- 不得输出解释性自然语言文本
- 不得在 JSON 之外输出任何内容

你的输出将被系统直接解析与校验，
因此准确性、稳定性与可预测性高于创造性。

"""


SELECT_QUESTION_TYPE_PROMPT = """
请基于以下条件，为本次练习进行题型选择与题量分配。

【基础信息】
- 科目：{subject}
- 学段：{stage}
- 年级：{grade}
- 总题量：{total_count}

【能力目标】
- 重点能力维度：{ability_focus}
- 认知层级要求：{cognitive_preference}

【难度要求】
- 难度分布：{difficulty_distribution}

【题型约束】
- 可用题型列表：来自系统提供的 QuestionType 数据
- 仅允许选择 is_active = true 的题型
- 题型需匹配当前学段、年级和科目

【输出要求】
- 按要求的 JSON Schema 输出
- 每个题型需包含：
  - question_type_code
  - question_type_name
  - difficulty
  - question_count
"""


# ==================== Prompt 构建工具函数 ====================


def build_units_prompt(units: List[Unit]) -> str:
    """格式化单元列表为文本"""
    if not units:
        return "（无）"

    prompt_lines = []
    for unit in units:
        prompt_lines.append(f"- **{unit.name}**")
        prompt_lines.append(f"- **{unit.content}**")

    return "\n".join(prompt_lines) or "（无）"


def build_knowledges_prompt(knowledges: List[str]) -> str:
    """格式化知识点列表为文本"""
    if not knowledges:
        return "（无）"

    prompt_lines = []
    for knowledge in knowledges:
        prompt_lines.append(f"- **{knowledge}**")

    return "\n".join(prompt_lines) or "（无）"


def build_avoid_duplicate_prompt(recall_questions: List[Question]) -> str:
    """格式化召回题目列表为文本"""
    if not recall_questions:
        return ""

    prompt_lines = []
    for recall_question in recall_questions:
        prompt_lines.append(f"- **{recall_question.stem.get('text', '')}**")
        prompt_lines.append(f"- **{recall_question.options}**")

    recalled_questions_info = "\n".join(prompt_lines) or "（无）"
    return f"""
        ## 重要：避免题目重复
        以下题目已从数据库召回，请确保生成的题目与这些题目不重复或高度相似：
        {recalled_questions_info}
        请生成全新的、与上述题目不同的题目。
    """


def build_question_types_prompt(question_types: dict[str, list[dict]]) -> str:
    """格式化题型列表为文本"""

    prompt_lines = []

    for scene, type_list in question_types.items():
        # 提取每个题型的名称
        type_names = [
            item.get("name", "")
            for item in type_list
            if isinstance(item, dict) and item.get("name")
        ]
        if type_names:
            prompt_lines.append(f"- **{scene}**：{'、'.join(type_names)}")
        else:
            prompt_lines.append(f"- **{scene}**")

    return "\n".join(prompt_lines) or "（无）"
