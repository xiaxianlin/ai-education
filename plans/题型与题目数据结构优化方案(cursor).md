# 题型与题目数据结构优化方案

## 一、文档内容提炼

### 1.1 核心发现

#### 题型体系（7大基础 + 扩展）
- **基础题型**：选择题、判断题、匹配题、拼写题、口语题、应用题、简答题
- **扩展题型**：计算题、操作题、实验题、论述题（高年级）

#### 应用题特点
- 一个题目下面可能包含多个小题（子题目）
- 每个小题可能有不同的题型（选择题、填空题、简答题等）
- 需要支持分步评分和步骤答案

#### 前端交互需求
- **选择题**：点击选择（单选/多选）
- **判断题**：对错选择
- **匹配题**：拖拽连线
- **拼写题**：文本输入或手写识别
- **口语题**：语音输入
- **应用题**：多小题，每个小题可能有不同交互方式
- **操作题**：拖拽、绘图、连线等
- **计算题**：手写或文本输入，可能需要步骤评分

#### 答案格式需求
- **选择题**：单个选项或多个选项（多选）
- **匹配题**：配对关系数组
- **应用题**：多小题答案数组
- **简答题**：文本答案，可能需要步骤评分
- **操作题**：操作步骤或结果（JSON格式）
- **实验题**：实验数据和结论（JSON格式）
- **计算题**：最终答案 + 解题步骤（JSON格式）

### 1.2 全学段题型需求

#### 小学低年级（1-3年级）
- 注重图文结合、游戏化、即时反馈
- 题型：看图选词、看图选拼音、声母韵母识别、笔画数数、看图识字等
- 资源类型：image（图片）、audio（音频）

#### 小学高年级（4-6年级）
- 开始引入抽象思维题型
- 题型：阅读理解、应用题、计算题等
- 资源类型：image、audio、video（未来可能）

#### 中学阶段（7-12年级）
- 全科覆盖，题型复杂度提升
- 题型：综合应用题、实验题、论述题、操作题等
- 需要支持多步骤、多答案、分步评分

## 二、现有数据结构分析

### 2.1 Question 表结构（当前）

```python
class Question(BaseModel):
    __tablename__ = "ah_question"
    
    id: Mapped[str]                    # 题目ID
    subject: Mapped[str]               # 科目
    grade: Mapped[int]                 # 年级
    type: Mapped[str]                  # 题目类型（主类型）
    subtype: Mapped[str]               # 题目子类型（可选）
    content: Mapped[str]               # 题目内容
    options: Mapped[list[dict]]        # 选项（JSON）
    answer: Mapped[str]                # 问题答案
    difficulty: Mapped[str]            # 问题难度
    resource: Mapped[str]              # 资源路径
    resource_type: Mapped[str]         # 资源类型：image/audio
    resource_content: Mapped[str]      # 资源内容（录音文本等）
    textbook_id: Mapped[int]           # 教材ID
    unit_id: Mapped[int]               # 单元ID
    prompt_id: Mapped[int]             # 提示词ID
    knowledge: Mapped[str]             # 知识点
```

### 2.2 现有结构的问题

1. **不支持应用题多小题结构**
   - 当前 `answer` 字段是单一字符串，无法支持多小题答案
   - 没有子题目表，无法存储应用题的多个小题

2. **答案格式不够灵活**
   - `answer` 字段是 Text 类型，无法结构化存储复杂答案（如匹配题的配对关系、计算题的步骤等）

3. **资源支持有限**
   - 只支持单个资源（`resource` 字段），无法支持多个资源（如图文并茂的应用题）
   - `resource_type` 只支持 image/audio，未来可能需要支持 video、3d 等

4. **选项格式不够灵活**
   - `options` 字段是 JSON，但格式不统一，无法支持匹配题、操作题等复杂题型

5. **缺少题型配置元数据**
   - 没有存储题型的交互方式、评分规则等元数据

## 三、优化后的数据结构设计

### 3.1 Question 表优化

```python
class Question(BaseModel):
    __tablename__ = "ah_question"
    
    # ============ 基础字段 ============
    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    subject: Mapped[str] = mapped_column(String(50), comment="科目")
    grade: Mapped[int] = mapped_column(comment="年级")
    type: Mapped[str] = mapped_column(String(50), comment="题目类型（主类型）")
    subtype: Mapped[str] = mapped_column(String(50), nullable=True, comment="题目子类型")
    
    # ============ 题目内容 ============
    content: Mapped[str] = mapped_column(Text, comment="题目内容（题干）")
    content_html: Mapped[str] = mapped_column(Text, nullable=True, comment="题目内容HTML格式（富文本）")
    
    # ============ 选项和答案 ============
    options: Mapped[list[dict]] = mapped_column(JSON, nullable=True, comment="选项（JSON格式）")
    answer: Mapped[dict] = mapped_column(JSON, comment="标准答案（JSON格式，支持复杂答案结构）")
    answer_type: Mapped[str] = mapped_column(String(50), comment="答案类型：single/multiple/match/text/steps/operation等")
    
    # ============ 资源支持 ============
    resources: Mapped[list[dict]] = mapped_column(JSON, nullable=True, comment="资源列表（JSON数组，支持多个资源）")
    # resources 格式示例：
    # [
    #   {"type": "image", "url": "...", "description": "图片描述"},
    #   {"type": "audio", "url": "...", "transcript": "录音文本"},
    #   {"type": "video", "url": "...", "duration": 120}
    # ]
    
    # ============ 题目属性 ============
    difficulty: Mapped[str] = mapped_column(String(50), comment="难度：easy/medium/hard")
    points: Mapped[int] = mapped_column(default=1, comment="分值")
    estimated_time: Mapped[int] = mapped_column(default=60, comment="预估答题时间（秒）")
    
    # ============ 关联字段 ============
    textbook_id: Mapped[int] = mapped_column(comment="教材ID")
    unit_id: Mapped[int] = mapped_column(nullable=True, comment="单元ID")
    knowledge_id: Mapped[int] = mapped_column(nullable=True, comment="知识点ID")
    knowledge: Mapped[str] = mapped_column(String(255), nullable=True, comment="知识点（冗余字段，便于查询）")
    prompt_id: Mapped[int] = mapped_column(nullable=True, comment="提示词ID")
    
    # ============ 应用题相关 ============
    parent_id: Mapped[str] = mapped_column(String(255), nullable=True, index=True, comment="父题目ID（用于应用题的小题）")
    sub_questions: Mapped[list[dict]] = mapped_column(JSON, nullable=True, comment="子题目列表（JSON格式，用于应用题）")
    # sub_questions 格式示例：
    # [
    #   {
    #     "id": "sub_1",
    #     "order": 1,
    #     "type": "choice",
    #     "content": "第一小题内容",
    #     "options": [...],
    #     "answer": {...},
    #     "points": 2
    #   },
    #   {
    #     "id": "sub_2",
    #     "order": 2,
    #     "type": "text",
    #     "content": "第二小题内容",
    #     "answer": {...},
    #     "points": 3
    #   }
    # ]
    
    # ============ 评分规则 ============
    scoring_rules: Mapped[dict] = mapped_column(JSON, nullable=True, comment="评分规则（JSON格式）")
    # scoring_rules 格式示例：
    # {
    #   "type": "all_or_nothing",  # 全对或全错
    #   "partial": true,            # 是否支持部分得分
    #   "steps": [                  # 分步评分（用于计算题、应用题）
    #     {"step": 1, "points": 2, "description": "第一步"},
    #     {"step": 2, "points": 3, "description": "第二步"}
    #   ]
    # }
    
    # ============ 元数据 ============
    metadata: Mapped[dict] = mapped_column(JSON, nullable=True, comment="扩展元数据（JSON格式）")
    # metadata 格式示例：
    # {
    #   "interaction_type": "drag_drop",  # 交互类型：click/drag_drop/handwriting/voice等
    #   "hints": ["提示1", "提示2"],      # 提示信息
    #   "explanation": "解析内容",         # 题目解析
    #   "tags": ["标签1", "标签2"]        # 标签
    # }
    
    # ============ 时间字段 ============
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)
```

### 3.2 答案格式规范

#### 3.2.1 选择题答案（single/multiple）

```json
{
  "type": "single",  // 或 "multiple"
  "value": "A"       // 单选：单个选项标识
  // 或
  "value": ["A", "C"]  // 多选：选项标识数组
}
```

#### 3.2.2 判断题答案

```json
{
  "type": "judge",
  "value": true  // 或 false
}
```

#### 3.2.3 匹配题答案

```json
{
  "type": "match",
  "value": [
    {"left": "A", "right": "1"},
    {"left": "B", "right": "2"},
    {"left": "C", "right": "3"}
  ]
}
```

#### 3.2.4 文本题答案（拼写题、简答题）

```json
{
  "type": "text",
  "value": "答案文本",
  "alternatives": ["答案1", "答案2"],  // 可接受的替代答案
  "case_sensitive": false,              // 是否区分大小写
  "fuzzy_match": true                   // 是否模糊匹配
}
```

#### 3.2.5 计算题答案（带步骤）

```json
{
  "type": "steps",
  "final_answer": "42",
  "steps": [
    {
      "step": 1,
      "description": "第一步：计算...",
      "formula": "10 + 20 = 30",
      "points": 2
    },
    {
      "step": 2,
      "description": "第二步：计算...",
      "formula": "30 + 12 = 42",
      "points": 3
    }
  ],
  "alternative_final_answers": ["42.0", "42.00"]  // 可接受的最终答案变体
}
```

#### 3.2.6 应用题答案（多小题）

```json
{
  "type": "application",
  "sub_answers": [
    {
      "sub_id": "sub_1",
      "type": "choice",
      "value": "A"
    },
    {
      "sub_id": "sub_2",
      "type": "text",
      "value": "答案文本"
    },
    {
      "sub_id": "sub_3",
      "type": "steps",
      "final_answer": "100",
      "steps": [...]
    }
  ]
}
```

#### 3.2.7 操作题答案

```json
{
  "type": "operation",
  "value": {
    "operation_type": "drag_drop",  // 或 "draw", "connect" 等
    "result": [
      {"item": "A", "position": {"x": 100, "y": 200}},
      {"item": "B", "position": {"x": 300, "y": 200}}
    ],
    "connections": [
      {"from": "A", "to": "1"},
      {"from": "B", "to": "2"}
    ]
  }
}
```

#### 3.2.8 实验题答案

```json
{
  "type": "experiment",
  "value": {
    "data": [
      {"variable": "温度", "value": "25℃"},
      {"variable": "时间", "value": "10分钟"}
    ],
    "conclusion": "实验结论文本",
    "analysis": "数据分析文本"
  }
}
```

### 3.3 选项格式规范

#### 3.3.1 选择题选项

```json
[
  {"label": "A", "text": "选项A内容", "image": "可选图片URL"},
  {"label": "B", "text": "选项B内容"},
  {"label": "C", "text": "选项C内容"},
  {"label": "D", "text": "选项D内容"}
]
```

#### 3.3.2 匹配题选项

```json
{
  "left_items": [
    {"id": "A", "text": "左边项A", "image": "可选图片URL"},
    {"id": "B", "text": "左边项B"}
  ],
  "right_items": [
    {"id": "1", "text": "右边项1", "image": "可选图片URL"},
    {"id": "2", "text": "右边项2"}
  ]
}
```

#### 3.3.3 操作题选项

```json
{
  "items": [
    {"id": "item1", "text": "项目1", "type": "draggable", "image": "可选图片URL"},
    {"id": "item2", "text": "项目2", "type": "draggable"}
  ],
  "targets": [
    {"id": "target1", "text": "目标1", "type": "drop_zone", "image": "可选图片URL"},
    {"id": "target2", "text": "目标2", "type": "drop_zone"}
  ]
}
```

### 3.4 QuestionType 表优化

```python
class QuestionType(BaseModel):
    """题型表"""
    
    __tablename__ = "ah_question_type"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), comment="题型标题")
    scene: Mapped[str] = mapped_column(String(50), comment="题型场景：choice/judge/match/spelling/oral/application/short_answer等")
    subject: Mapped[str] = mapped_column(String(50), comment="科目")
    grade: Mapped[int] = mapped_column(nullable=True, comment="年级（null表示全年级适用）")
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="题型描述")
    
    # ============ 资源类型 ============
    resource_types: Mapped[list[str]] = mapped_column(JSON, nullable=True, comment="支持的资源类型列表：['image', 'audio', 'video']")
    
    # ============ 交互配置 ============
    interaction_type: Mapped[str] = mapped_column(String(50), comment="交互类型：click/drag_drop/handwriting/voice/text_input等")
    interaction_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="交互配置（JSON格式）")
    # interaction_config 格式示例：
    # {
    #   "allow_multiple": false,        # 是否允许多选
    #   "allow_drag": true,              # 是否允许拖拽
    #   "allow_handwriting": false,      # 是否支持手写
    #   "max_length": 100,               # 文本最大长度
    #   "show_hints": true               # 是否显示提示
    # }
    
    # ============ 答案配置 ============
    answer_type: Mapped[str] = mapped_column(String(50), comment="答案类型：single/multiple/match/text/steps/operation等")
    answer_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="答案配置（JSON格式）")
    # answer_config 格式示例：
    # {
    #   "case_sensitive": false,        # 是否区分大小写
    #   "fuzzy_match": true,             # 是否模糊匹配
    #   "allow_partial": true,           # 是否允许部分得分
    #   "auto_score": true               # 是否自动评分
    # }
    
    # ============ AI生成配置 ============
    prompt: Mapped[str] = mapped_column(Text, nullable=True, comment="生成该题型的 AI 指令（Prompt）")
    prompt_config: Mapped[dict] = mapped_column(JSON, nullable=True, comment="Prompt配置（JSON格式）")
    
    # ============ 时间字段 ============
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)
```

### 3.5 PracticeSessionAnswer 表优化

```python
class PracticeSessionAnswer(BaseModel):
    """答题记录表"""
    
    __tablename__ = "ah_practice_session_answer"
    
    # ============ 主键和关联字段 ============
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(index=True, comment="会话ID")
    question_id: Mapped[str] = mapped_column(String(255), index=True, comment="题目ID")
    student_id: Mapped[str] = mapped_column(String(255), index=True, comment="学生ID")
    question_order: Mapped[int] = mapped_column(comment="题目顺序")
    
    # ============ 题目相关信息（冗余存储） ============
    unit_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="单元ID")
    knowledge: Mapped[str] = mapped_column(String(255), nullable=True, comment="知识点")
    textbook_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="教材ID")
    
    # ============ 答题信息 ============
    answer: Mapped[dict] = mapped_column(JSON, nullable=True, comment="学生答案（JSON格式，与Question.answer格式对应）")
    # answer 格式示例：
    # {
    #   "type": "single",
    #   "value": "A",
    #   "sub_answers": [  # 应用题时使用
    #     {"sub_id": "sub_1", "value": "A"},
    #     {"sub_id": "sub_2", "value": "答案文本"}
    #   ]
    # }
    
    status: Mapped[int] = mapped_column(default=0, comment="答题状态: 0-未答 1-正确 2-错误 3-部分正确")
    score: Mapped[float] = mapped_column(default=0.0, comment="得分")
    max_score: Mapped[int] = mapped_column(default=1, comment="满分")
    
    time_spent: Mapped[int] = mapped_column(default=0, comment="耗时(秒)")
    submit_time: Mapped[int] = mapped_column(nullable=True, comment="提交时间")
    
    # ============ 评分详情 ============
    scoring_details: Mapped[dict] = mapped_column(JSON, nullable=True, comment="评分详情（JSON格式）")
    # scoring_details 格式示例：
    # {
    #   "auto_scored": true,             # 是否自动评分
    #   "steps_score": [                 # 分步得分（用于计算题、应用题）
    #     {"step": 1, "score": 2, "max_score": 2, "correct": true},
    #     {"step": 2, "score": 1.5, "max_score": 3, "correct": false}
    #   ],
    #   "sub_scores": [                  # 小题得分（用于应用题）
    #     {"sub_id": "sub_1", "score": 2, "max_score": 2, "correct": true},
    #     {"sub_id": "sub_2", "score": 0, "max_score": 3, "correct": false}
    #   ]
    # }
    
    # ============ 错题相关字段 ============
    correct_answer: Mapped[dict] = mapped_column(JSON, nullable=True, comment="正确答案（JSON格式）")
    analysis: Mapped[str] = mapped_column(Text, nullable=True, comment="错题分析")
    is_corrected: Mapped[int] = mapped_column(default=0, comment="是否已订正 0-未订正 1-已订正")
    corrected_time: Mapped[int] = mapped_column(nullable=True, comment="订正时间")
    
    # ============ 时间字段 ============
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)
```

## 四、各题型详细配置

### 4.1 选择题（Choice）

#### 数据结构示例

```json
{
  "id": "q_001",
  "type": "choice",
  "subtype": "single_choice",  // 或 "multiple_choice"
  "content": "下列哪个选项是正确的？",
  "options": [
    {"label": "A", "text": "选项A"},
    {"label": "B", "text": "选项B"},
    {"label": "C", "text": "选项C"},
    {"label": "D", "text": "选项D"}
  ],
  "answer": {
    "type": "single",  // 或 "multiple"
    "value": "A"       // 或 ["A", "C"]
  },
  "answer_type": "single",  // 或 "multiple"
  "resources": [
    {"type": "image", "url": "https://example.com/image.jpg", "description": "题目配图"}
  ],
  "interaction_type": "click",
  "scoring_rules": {
    "type": "all_or_nothing",
    "partial": false
  }
}
```

#### 前端交互组件

- 使用 `ChoiceInput` 组件
- 单选：点击选项，高亮选中项
- 多选：点击多个选项，显示所有选中项

### 4.2 判断题（Judge）

#### 数据结构示例

```json
{
  "id": "q_002",
  "type": "judge",
  "content": "地球是圆的。",
  "answer": {
    "type": "judge",
    "value": true
  },
  "answer_type": "judge",
  "interaction_type": "click",
  "scoring_rules": {
    "type": "all_or_nothing",
    "partial": false
  }
}
```

#### 前端交互组件

- 使用 `JudgeInput` 组件
- 显示"正确"和"错误"两个按钮
- 点击选择，高亮选中项

### 4.3 匹配题（Match）

#### 数据结构示例

```json
{
  "id": "q_003",
  "type": "match",
  "content": "请将左边的词语与右边的解释进行匹配。",
  "options": {
    "left_items": [
      {"id": "A", "text": "苹果", "image": "https://example.com/apple.jpg"},
      {"id": "B", "text": "香蕉"},
      {"id": "C", "text": "橙子"}
    ],
    "right_items": [
      {"id": "1", "text": "一种红色的水果"},
      {"id": "2", "text": "一种黄色的水果"},
      {"id": "3", "text": "一种橙色的水果"}
    ]
  },
  "answer": {
    "type": "match",
    "value": [
      {"left": "A", "right": "1"},
      {"left": "B", "right": "2"},
      {"left": "C", "right": "3"}
    ]
  },
  "answer_type": "match",
  "interaction_type": "drag_drop",  // 或 "click"（点击连线）
  "scoring_rules": {
    "type": "partial",
    "partial": true,
    "match_score": 1  // 每个正确匹配得1分
  }
}
```

#### 前端交互组件

- 新建 `MatchInput` 组件
- 支持拖拽连线或点击连线两种交互方式
- 显示左右两列，支持拖拽匹配

### 4.4 拼写题（Spelling）

#### 数据结构示例

```json
{
  "id": "q_004",
  "type": "spelling",
  "content": "请拼写单词：apple",
  "resources": [
    {"type": "audio", "url": "https://example.com/apple.mp3", "transcript": "apple"}
  ],
  "answer": {
    "type": "text",
    "value": "apple",
    "alternatives": ["Apple", "APPLE"],
    "case_sensitive": false,
    "fuzzy_match": false
  },
  "answer_type": "text",
  "interaction_type": "text_input",  // 或 "handwriting"
  "scoring_rules": {
    "type": "exact_match",
    "partial": false
  }
}
```

#### 前端交互组件

- 使用 `TextInput` 组件
- 支持文本输入和手写识别（可选）
- 显示音频播放按钮

### 4.5 口语题（Oral）

#### 数据结构示例

```json
{
  "id": "q_005",
  "type": "oral",
  "content": "请朗读以下单词：apple",
  "resources": [
    {"type": "audio", "url": "https://example.com/apple.mp3", "transcript": "apple"}
  ],
  "answer": {
    "type": "audio",
    "value": "学生录音URL",
    "transcript": "标准文本",
    "pronunciation_score": 0.95  // 发音评分（0-1）
  },
  "answer_type": "audio",
  "interaction_type": "voice",
  "scoring_rules": {
    "type": "pronunciation",
    "auto_score": true,
    "threshold": 0.8  // 发音准确度阈值
  }
}
```

#### 前端交互组件

- 使用 `AudioInput` 组件
- 支持录音、播放、重录
- 显示标准发音音频

### 4.6 应用题（Application）

#### 数据结构示例

```json
{
  "id": "q_006",
  "type": "application",
  "content": "小明有10个苹果，吃了3个，又买了5个，现在有多少个苹果？",
  "resources": [
    {"type": "image", "url": "https://example.com/apple.jpg", "description": "苹果图片"}
  ],
  "sub_questions": [
    {
      "id": "sub_1",
      "order": 1,
      "type": "choice",
      "content": "第一步应该计算什么？",
      "options": [
        {"label": "A", "text": "10 - 3"},
        {"label": "B", "text": "10 + 3"},
        {"label": "C", "text": "3 + 5"}
      ],
      "answer": {
        "type": "single",
        "value": "A"
      },
      "points": 2
    },
    {
      "id": "sub_2",
      "order": 2,
      "type": "text",
      "content": "请写出最终答案。",
      "answer": {
        "type": "text",
        "value": "12"
      },
      "points": 3
    }
  ],
  "answer": {
    "type": "application",
    "sub_answers": [
      {
        "sub_id": "sub_1",
        "type": "choice",
        "value": "A"
      },
      {
        "sub_id": "sub_2",
        "type": "text",
        "value": "12"
      }
    ]
  },
  "answer_type": "application",
  "interaction_type": "mixed",  // 混合交互
  "scoring_rules": {
    "type": "partial",
    "partial": true,
    "sub_scores": [
      {"sub_id": "sub_1", "points": 2},
      {"sub_id": "sub_2", "points": 3}
    ]
  }
}
```

#### 前端交互组件

- 新建 `ApplicationInput` 组件
- 显示主题目和所有子题目
- 每个子题目根据其类型渲染对应的输入组件
- 支持分步提交和整体提交

### 4.7 简答题（Short Answer）

#### 数据结构示例

```json
{
  "id": "q_007",
  "type": "short_answer",
  "content": "请简述地球的自转和公转。",
  "answer": {
    "type": "text",
    "value": "地球自转是指地球绕自身轴旋转，公转是指地球绕太阳旋转。",
    "keywords": ["自转", "公转", "地球", "太阳"],  // 关键词（用于自动评分）
    "min_length": 20,  // 最小字数
    "max_length": 500  // 最大字数
  },
  "answer_type": "text",
  "interaction_type": "text_input",
  "scoring_rules": {
    "type": "keyword_match",  // 或 "manual"（人工评分）
    "auto_score": true,
    "keyword_weight": 0.3,  // 关键词权重
    "length_weight": 0.1    // 长度权重
  }
}
```

#### 前端交互组件

- 使用 `TextInput` 组件（多行文本）
- 显示字数统计
- 支持富文本输入（可选）

### 4.8 计算题（Calculation）

#### 数据结构示例

```json
{
  "id": "q_008",
  "type": "calculation",
  "content": "计算：(10 + 20) × 2 = ?",
  "answer": {
    "type": "steps",
    "final_answer": "60",
    "steps": [
      {
        "step": 1,
        "description": "先计算括号内的加法",
        "formula": "10 + 20 = 30",
        "points": 2
      },
      {
        "step": 2,
        "description": "再计算乘法",
        "formula": "30 × 2 = 60",
        "points": 3
      }
    ],
    "alternative_final_answers": ["60.0", "60.00"]
  },
  "answer_type": "steps",
  "interaction_type": "text_input",  // 或 "handwriting"
  "scoring_rules": {
    "type": "partial",
    "partial": true,
    "steps": [
      {"step": 1, "points": 2},
      {"step": 2, "points": 3}
    ]
  }
}
```

#### 前端交互组件

- 新建 `CalculationInput` 组件
- 支持文本输入和手写识别
- 显示步骤输入框（可选）
- 支持公式编辑器（未来）

### 4.9 操作题（Operation）

#### 数据结构示例

```json
{
  "id": "q_009",
  "type": "operation",
  "content": "请将下面的图形拖拽到正确的位置。",
  "options": {
    "items": [
      {"id": "item1", "text": "圆形", "type": "draggable", "image": "https://example.com/circle.jpg"},
      {"id": "item2", "text": "方形", "type": "draggable", "image": "https://example.com/square.jpg"}
    ],
    "targets": [
      {"id": "target1", "text": "几何图形", "type": "drop_zone", "image": "https://example.com/target.jpg"},
      {"id": "target2", "text": "其他图形", "type": "drop_zone"}
    ]
  },
  "answer": {
    "type": "operation",
    "value": {
      "operation_type": "drag_drop",
      "result": [
        {"item": "item1", "target": "target1"},
        {"item": "item2", "target": "target1"}
      ]
    }
  },
  "answer_type": "operation",
  "interaction_type": "drag_drop",
  "scoring_rules": {
    "type": "partial",
    "partial": true
  }
}
```

#### 前端交互组件

- 新建 `OperationInput` 组件
- 支持拖拽、绘图、连线等交互
- 根据 `operation_type` 渲染不同的交互界面

### 4.10 实验题（Experiment）

#### 数据结构示例

```json
{
  "id": "q_010",
  "type": "experiment",
  "content": "请完成以下实验并记录数据。",
  "answer": {
    "type": "experiment",
    "value": {
      "data": [
        {"variable": "温度", "value": "25℃"},
        {"variable": "时间", "value": "10分钟"},
        {"variable": "结果", "value": "成功"}
      ],
      "conclusion": "实验成功完成",
      "analysis": "数据分析..."
    }
  },
  "answer_type": "experiment",
  "interaction_type": "form_input",
  "scoring_rules": {
    "type": "partial",
    "partial": true,
    "data_points": [
      {"variable": "温度", "points": 1},
      {"variable": "时间", "points": 1},
      {"variable": "结果", "points": 2},
      {"conclusion": 3}
    ]
  }
}
```

#### 前端交互组件

- 新建 `ExperimentInput` 组件
- 显示实验表单
- 支持数据输入、结论输入、分析输入

## 五、前端交互方案

### 5.1 组件架构

```
AnswerCard (答题卡片)
├── ChoiceInput (选择题)
├── JudgeInput (判断题)
├── MatchInput (匹配题) [新建]
├── TextInput (文本输入 - 拼写题、简答题)
├── AudioInput (语音输入 - 口语题)
├── ApplicationInput (应用题) [新建]
│   ├── 根据子题目类型动态渲染
│   ├── ChoiceInput
│   ├── TextInput
│   └── CalculationInput
├── CalculationInput (计算题) [新建]
├── OperationInput (操作题) [新建]
└── ExperimentInput (实验题) [新建]
```

### 5.2 交互类型映射

| 题型 | interaction_type | 组件 | 说明 |
|------|-----------------|------|------|
| 选择题 | click | ChoiceInput | 点击选择 |
| 判断题 | click | JudgeInput | 点击对错 |
| 匹配题 | drag_drop / click | MatchInput | 拖拽连线或点击连线 |
| 拼写题 | text_input / handwriting | TextInput | 文本输入或手写 |
| 口语题 | voice | AudioInput | 语音输入 |
| 应用题 | mixed | ApplicationInput | 混合交互 |
| 简答题 | text_input | TextInput | 多行文本输入 |
| 计算题 | text_input / handwriting | CalculationInput | 文本或手写输入 |
| 操作题 | drag_drop / draw / connect | OperationInput | 拖拽/绘图/连线 |
| 实验题 | form_input | ExperimentInput | 表单输入 |

### 5.3 答案数据结构统一

所有组件的答案格式统一为：

```typescript
interface PracticeSessionAnswer {
  type: string;           // 答案类型
  value: any;             // 答案值（根据类型不同）
  sub_answers?: Array<{    // 应用题子答案
    sub_id: string;
    type: string;
    value: any;
  }>;
  metadata?: {            // 元数据（录音URL、手写图片等）
    audio_url?: string;
    handwriting_image?: string;
    steps?: Array<{
      step: number;
      formula: string;
    }>;
  };
}
```

### 5.4 评分逻辑

#### 5.4.1 自动评分

- **选择题/判断题**：完全匹配答案
- **匹配题**：部分得分，每个正确匹配得分
- **拼写题**：文本匹配（支持模糊匹配）
- **口语题**：发音评分（AI评分）
- **计算题**：步骤评分 + 最终答案评分
- **应用题**：子题目评分汇总

#### 5.4.2 人工评分

- **简答题**：关键词匹配 + 人工评分
- **实验题**：部分自动评分 + 人工评分
- **操作题**：人工评分（未来可能支持AI评分）

## 六、数据库迁移方案

### 6.1 迁移步骤

1. **创建新表结构**
   - 备份现有数据
   - 创建新的 Question 表结构
   - 创建新的 QuestionType 表结构
   - 创建新的 PracticeSessionAnswer 表结构

2. **数据迁移**
   - 将现有 Question 数据迁移到新结构
   - 转换答案格式（从字符串转为JSON）
   - 转换选项格式（统一JSON格式）
   - 转换资源格式（从单个资源转为资源数组）

3. **应用代码更新**
   - 更新后端 API
   - 更新前端组件
   - 更新评分逻辑

4. **测试验证**
   - 单元测试
   - 集成测试
   - 用户验收测试

### 6.2 数据转换示例

#### 6.2.1 答案转换

```python
# 旧格式：answer = "A"
# 新格式：answer = {"type": "single", "value": "A"}

def convert_answer(old_answer: str, answer_type: str) -> dict:
    if answer_type == "choice":
        return {"type": "single", "value": old_answer}
    elif answer_type == "judge":
        return {"type": "judge", "value": old_answer == "正确"}
    elif answer_type == "text":
        return {"type": "text", "value": old_answer}
    # ... 其他类型
```

#### 6.2.2 资源转换

```python
# 旧格式：resource = "https://example.com/image.jpg", resource_type = "image"
# 新格式：resources = [{"type": "image", "url": "https://example.com/image.jpg"}]

def convert_resources(resource: str, resource_type: str) -> list:
    if resource:
        return [{"type": resource_type, "url": resource}]
    return []
```

### 6.3 兼容性处理

由于不需要兼容旧数据，可以直接：
1. 删除旧表
2. 创建新表
3. 重新导入数据（如果需要）

## 七、实施计划

### 7.1 第一阶段：数据结构设计（已完成）

- [x] 阅读文档，提炼内容
- [x] 分析现有数据结构
- [x] 设计优化后的数据结构
- [x] 编写方案文档

### 7.2 第二阶段：数据库迁移

- [ ] 创建数据库迁移脚本
- [ ] 执行数据迁移
- [ ] 验证数据完整性

### 7.3 第三阶段：后端API更新

- [ ] 更新 Question 模型
- [ ] 更新 QuestionType 模型
- [ ] 更新 PracticeSessionAnswer 模型
- [ ] 更新相关 Service 层代码
- [ ] 更新评分逻辑
- [ ] 更新 API 接口

### 7.4 第四阶段：前端组件开发

- [ ] 更新现有组件（ChoiceInput、JudgeInput、TextInput、AudioInput）
- [ ] 新建 MatchInput 组件
- [ ] 新建 ApplicationInput 组件
- [ ] 新建 CalculationInput 组件
- [ ] 新建 OperationInput 组件
- [ ] 新建 ExperimentInput 组件
- [ ] 更新 AnswerCard 组件

### 7.5 第五阶段：测试与优化

- [ ] 单元测试
- [ ] 集成测试
- [ ] 用户验收测试
- [ ] 性能优化
- [ ] 文档更新

## 八、总结

本方案基于文档中的题型配置方案，对现有的题型和题目数据结构进行了全面优化，主要改进包括：

1. **支持应用题多小题结构**：通过 `sub_questions` 和 `parent_id` 字段支持应用题的多个小题
2. **灵活的答案格式**：答案采用 JSON 格式，支持各种复杂答案结构
3. **多资源支持**：支持多个资源（图片、音频、视频等）
4. **丰富的题型支持**：支持选择题、判断题、匹配题、拼写题、口语题、应用题、简答题、计算题、操作题、实验题等
5. **灵活的评分规则**：支持全对全错、部分得分、分步评分等多种评分方式
6. **前端交互友好**：为不同题型设计了对应的交互组件

该方案能够适配文档中提到的所有题型，并且具有良好的扩展性，可以支持未来可能的新题型。

