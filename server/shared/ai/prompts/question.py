GENERIC_UNIT_PROMPT = """
学科：{subject}
年级：{grade}
学期：{semester}
题型：{question_types}
题目子类型说明：{subtype_info}
单元名称：{unit_name}
单元概要：{unit_summary}
知识点：
{knowledge_text}

请基于上述信息生成 {count} 道符合条件的题目，并确保：
1. 题目紧扣单元与知识点；
2. 难度与年级匹配，适合 {grade} 年级学生的认知水平；
3. 输出为合法 JSON；
4. 根据知识点从题型中匹配相关题型，并随机选择；
5. **重要**：每道题目必须包含 question_type（主类型）和 question_subtype（子类型）两个字段：
   - question_type：从提供的题型列表中选择一个主类型（如"选择题"、"拼写题"、"口语题"等）
   - question_subtype：根据选择的主类型，从对应的子类型中选择一个合适的子类型（如"看图选词"、"听音写单词"等）
   - 如果选择的主类型没有对应的子类型，question_subtype 可以为空字符串
6. **录音题特殊要求**：如果题目需要录音（如"跟读题"、"听力题"、"口语题"或子类型包含"听音"、"跟读"、"朗读"等），必须同时提供：
   - question（题干）：只描述这是干什么的，例如"请听录音，选择正确的单词"、"请跟读以下内容"、"请听问题并回答"
   - resource_content（录音文本）：实际的录音内容，例如要播放的单词、句子、问题等
   - 注意：题干（question）不要包含具体的录音内容，录音内容应放在 resource_content 中
7. 若题型为选择题，提供 4 个选项并标明正确答案；
8. 其他题型提供完整答案与解析；
9. 难度字段从"简单"、"普通"、"困难"中选择；
10. 每道题目必须包含知识点字段（knowledge），从提供的知识点中选择最相关的一个或多个知识点名称，多个知识点用顿号（、）分隔，knowledge 字段必须是字符串类型，不能是数组；
11. 题目内容要符合所选子类型的特点，例如：
   - 如果选择"看图选词"，题目应该描述需要识别的图片内容
   - 如果选择"听音写单词"，题目应该说明需要听录音并拼写单词，resource_content 中提供要播放的单词
   - 如果选择"快速口算"，题目应该是简单的计算题
   - 如果选择"看图列式"，题目应该描述需要根据图片列出算式
   - 如果选择"听音选词"，question 描述"请听录音选择正确的单词"，resource_content 提供要播放的单词
    - **角色扮演对话特殊要求**：如果选择"角色扮演对话"子类型，必须明确说明：
      * 系统（平台）会播放一个角色的台词（放在 resource_content 中）
      * 学生需要扮演另一个角色，根据系统播放的台词进行回应
      * 题目（question）应该描述对话场景和学生的角色，例如："你正在和老师对话，请听老师的提问并回答"
      * resource_content 中提供系统角色要播放的台词内容
      * 注意：这是学生与系统虚拟角色的对话，不是让学生去找其他人来扮演角色
"""

DAILY_PRACTICE_PROMPT = """
练习类型：今日练习（智能推荐，覆盖错题复习/巩固/挑战/新知）
学科：{subject}
年级：{grade}
学期：{semester}
题型候选：{question_types}
题目子类型说明：{subtype_info}
知识点线索（来自近期学习轨迹，可为空）：
{knowledge_overview}

请基于上述信息和以下练习分布生成 {count} 道题目：
{practice_focus}

策略提示：
{strategy_notes}

请确保：
1. 错题复习题围绕核心易错知识点，难度偏简单或普通；
2. 巩固练习题保持基础，帮助学生强化已掌握知识；
3. 挑战题提供适度难度提升，引导学生拓展思维；
4. 新知识点题目引导学生理解新概念，但难度不宜过高；
5. 每道题返回 question_type 和 question_subtype，并遵循子类型特点；
6. 音视频题遵循 resource/resource_content 要求；
7. 输出合法 JSON，包含答案、难度、知识点字段；
8. 避免题目重复，整体风格轻松鼓励，强调练习连续性；
9. 如果题目需要上下文说明（如场景、步骤），请简明扼要，便于小学阶段学生理解。
"""

ASSESSMENT_GENERATION_PROMPT = """
评测类型：能力评测（IRT 自适应思想）
学科：{subject}
年级：{grade}
学期：{semester}
题型候选：{question_types}
题目子类型说明：{subtype_info}
单元名称：{unit_name}
单元概要：{unit_summary}
知识点依据：
{knowledge_text}

评测目标：
{assessment_goal}

出题策略：
{assessment_strategy}

请生成 {count} 道题目并确保：
1. 题目覆盖不同难度层次，便于根据学生表现动态调节；
2. 题干清晰，答案唯一，便于自动判分；
3. 标记 question_type、question_subtype、difficulty、knowledge；
4. 音视频题提供 resource/resource_content；
5. 难度分布应包含简单、普通、困难，体现自适应探索与确认；
6. 输出合法 JSON，满足后续算法需要。
"""

PROMPT_OPTIMIZATION_INSTRUCTION = """
你是一名专业的 Prompt 工程专家。请分析并优化以下 Prompt，使其：
1. 更加清晰明确，减少歧义
2. 更好地引导模型生成高质量题目
3. 确保所有要求都被明确表达
4. 优化语言表达，使其更专业、更易理解
5. 保持原有的核心要求和格式要求不变

请直接返回优化后的 Prompt 内容，不要添加任何解释或说明。
"""
