# 题型与题目数据结构优化方案

## 一、文档需求总结

### 1.1 题型配置体系

根据 `docs/小学低年级题型配置方案.md`，题型按以下维度分类：

| 维度 | 说明 |
|-----|------|
| **scene (场景)** | 题型大类：选择题、填空题、判断题、匹配题、应用题、简答题、计算题、操作题、口语题 |
| **subject (学科)** | 语文、数学、英语、物理、化学、生物、历史、地理、政治 |
| **grade (年级)** | 1-12年级 |
| **title (标题)** | 具体题型名称，如"看图选拼音"、"两位数乘两位数" |

### 1.2 各学段题型分布

#### 小学低年级 (1-3年级)
- 选择题、拼写题、口语题、判断题、匹配题、应用题、简答题
- 特点：图文结合、游戏化设计、操作题多

#### 小学高年级 (4-6年级)
- 增加论述题、排序题、思维导图制作、实验题
- 减少选择题比重，增加应用题

#### 初中 (7-9年级)
- 综合应用题、批判性思维题、跨学科整合题
- 实验设计题、案例分析题

#### 高中 (10-12年级)
- 深度分析题、开放性探究、学术性训练
- 高考真题、学科竞赛题

### 1.3 应用题的小题支持

文档明确指出：应用题可能出现一个题目下面有几个小题。

示例数据结构：
```json
{
  "question_group": {
    "id": "q1",
    "type": "application",  // 应用题
    "sub_questions": [
      {"id": "q1-1", "content": "第一问...", "answer": "..."},
      {"id": "q1-2", "content": "第二问...", "answer": "..."},
      {"id": "q1-3", "content": "第三问...", "answer": "..."}
    ]
  }
}
```

---

## 二、QuestionType 优化

### 2.1 场景(scene)分类体系

```python
# 题型场景枚举
QUESTION_SCENES = {
    # 客观题
    "choice": "选择题",        # 单选/多选
    "fill_blank": "填空题",   # 填入答案
    "judge": "判断题",        # √/×

    # 主观题
    "short_answer": "简答题", # 开放式回答
    "calculation": "计算题",  # 数学计算
    "application": "应用题",  # 应用题(可包含小题)
    "composition": "作文题",  # 写作

    # 口语题
    "oral": "口语题",         # 跟读/朗读/对话

    # 操作题
    "matching": "匹配题",     # 连线题
    "sorting": "排序题",      # 排列顺序
    "operation": "操作题",    # 拖拽、涂色、画图

    # 特殊题型
    "reading": "阅读理解",    # 阅读+问答
    "listening": "听力题",    # 听音频答题
    "experiment": "实验题",   # 虚拟实验
}
```

### 2.2 题型表结构 (QuestionType)

```python
class QuestionType(BaseModel):
    """
    题型定义表 - 存储每种题型的元信息

    支持字段:
    - scene: 题型大类(如 choice, fill_blank)
    - title: 具体题型名称(如 "看图选拼音")
    - subject: 学科
    - grade: 年级(1-12)
    - description: 题型描述
    - interaction_mode: 交互模式(click/drag/draw/speak)
    - resource_type: 需要的资源类型(image/audio/none)
    - answer_type: 答案类型(single_choice/multi_choice/text/draw/audio)
    - prompt: AI生成提示词
    - config: 题型特定配置(JSON)
    """

    __tablename__ = "ah_question_type"

    # 主键
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 核心分类字段
    scene: Mapped[str] = mapped_column(String(50), comment="题型场景")
    title: Mapped[str] = mapped_column(String(100), comment="题型标题")
    subject: Mapped[str] = mapped_column(String(50), comment="科目")
    grade: Mapped[int] = mapped_column(comment="年级(1-12)")

    # 描述信息
    description: Mapped[str] = mapped_column(Text, nullable=True, comment="题型描述")

    # 交互与答案配置
    interaction_mode: Mapped[str] = mapped_column(String(50), comment="交互模式")
    answer_type: Mapped[str] = mapped_column(String(50), comment="答案类型")
    resource_type: Mapped[str] = mapped_column(String(50), nullable=True, comment="资源类型")

    # AI生成
    prompt: Mapped[str] = mapped_column(Text, nullable=True, comment="AI生成提示词")

    # 题型配置 (JSON格式，存储特定配置)
    # {
    #   "max_options": 4,        # 最大选项数
    #   "min_options": 2,        # 最小选项数
    #   "allow_multi": false,    # 是否允许多选
    #   "sub_question_count": 3, # 小题数量(应用题)
    #   "min_sub_questions": 1,  # 最小小题数
    #   "max_sub_questions": 5,  # 最大小题数
    #   "audio_duration": 30,    # 录音时长限制(秒)
    #   "time_limit": 120,      # 答题时间限制(秒)
    # }
    config: Mapped[dict] = mapped_column(JSON, default=dict, comment="题型配置")

    # 状态与排序
    is_enabled: Mapped[bool] = mapped_column(default=True, comment="是否启用")
    order: Mapped[int] = mapped_column(default=0, comment="同级排序")

    # 元数据
    metadata: Mapped[dict] = mapped_column(JSON, default=dict, comment="扩展元数据")

    # 时间戳
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)

    # 唯一约束
    __table_args__ = (
        UniqueConstraint('scene', 'subject', 'grade', 'title', name='uq_question_type'),
        Index('idx_question_type_scene_subject_grade', 'scene', 'subject', 'grade'),
    )
```

### 2.3 题型场景与交互模式映射

| 场景 (scene) | 交互模式 (interaction_mode) | 前端组件 | 适用学科 |
|-------------|---------------------------|---------|---------|
| choice | click | ChoiceInput | 语数英理化生 |
| fill_blank | text_input | TextInput | 语文数学英语 |
| judge | click | JudgeInput | 语数英物理化学 |
| matching | drag_connect | MatchingInput | 语文英语 |
| sorting | drag_sort | SortingInput | 数学语文英语 |
| operation | drag_draw | OperationInput | 数学物理化学 |
| short_answer | text_input | TextInput | 语文英语 |
| calculation | text_input/draw | CalculationInput | 数学物理化学 |
| application | text_input/sub_questions | ApplicationInput | 数学 |
| oral | speak | AudioInput | 英语语文 |
| listening | click | ListeningInput | 英语语文 |
| reading | multi | ReadingInput | 语文英语 |
| composition | text_input | CompositionInput | 语文英语 |
| experiment | drag_operate | ExperimentInput | 物理化学生物 |

---

## 三、Question 优化

### 3.1 题目表结构 (Question)

```python
class Question(BaseModel):
    """
    题目表 - 存储具体题目数据

    核心设计:
    - 支持复合题目(应用题含小题)
    - 支持多种答案格式
    - 支持资源生成状态追踪
    """

    __tablename__ = "ah_question"

    # 主键
    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)

    # 分类字段
    subject: Mapped[str] = mapped_column(String(50), comment="科目")
    grade: Mapped[int] = mapped_column(comment="年级(1-12)")

    # 题型关联
    question_type_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="题型ID")
    scene: Mapped[str] = mapped_column(String(50), comment="题型场景(冗余)")
    title: Mapped[str] = mapped_column(String(100), nullable=True, comment="题型标题(冗余)")

    # 题目内容
    content: Mapped[str] = mapped_column(Text, comment="题目内容(题干)")

    # 题目结构 - 支持复合题目
    # 当为普通题目时: sub_questions = []
    # 当为应用题(含小题)时: sub_questions = [{"content": "...", "answer": "..."}]
    sub_questions: Mapped[list[dict]] = mapped_column(
        JSON,
        default=list,
        comment="小题列表(应用题等复合题目)"
    )

    # 答案配置
    # 选择题: [{"key": "A", "text": "选项内容"}, ...]
    # 填空题: ["答案1", "答案2"]
    # 判断题: "true" / "false"
    # 匹配题: [{"left": "A", "right": "1"}, ...]
    # 操作题: {"action": "drag", "target": "..."}
    # 口语题: {"expected_text": "Hello", "keywords": ["Hello"]}
    answer: Mapped[dict] = mapped_column(JSON, comment="答案配置")

    # 答案类型 (冗余，用于快速判断)
    answer_type: Mapped[str] = mapped_column(String(50), comment="答案类型")

    # 题目配置 (JSON格式)
    # {
    #   "allow_partial_score": true,  # 是否允许部分分
    #   "sub_score": [2, 3, 5],      # 各小题分值
    #   "time_limit": 120,           # 答题时间限制
    #   "audio_times": 3,            # 听力播放次数
    #   "keywords": ["关键词1"],     # 评分关键词
    #   "similar_answers": ["答1", "答2"],  # 相似答案
    # }
    config: Mapped[dict] = mapped_column(JSON, default=dict, comment="题目配置")

    # 难度
    difficulty: Mapped[str] = mapped_column(String(50), comment="难度")

    # 资源
    resource: Mapped[str] = mapped_column(String(255), nullable=True, comment="资源路径")
    resource_type: Mapped[str] = mapped_column(String(50), nullable=True, comment="资源类型")
    resource_content: Mapped[str] = mapped_column(Text, nullable=True, comment="资源内容")
    resource_status: Mapped[int] = mapped_column(
        default=0,
        comment="资源状态: 0-未生成 1-生成中 2-已完成 3-失败"
    )

    # 关联字段
    textbook_id: Mapped[int] = mapped_column(comment="教材ID")
    unit_id: Mapped[int] = mapped_column(nullable=True, comment="单元ID")
    knowledge: Mapped[str] = mapped_column(String(255), nullable=True, comment="知识点")

    # 题目状态
    status: Mapped[int] = mapped_column(
        default=0,
        comment="状态: 0-草稿 1-待审核 2-已发布 3-已废弃"
    )

    # 质量评分
    quality_score: Mapped[float] = mapped_column(nullable=True, comment="质量评分")
    usage_count: Mapped[int] = mapped_column(default=0, comment="使用次数")

    # 标签
    tags: Mapped[list[str]] = mapped_column(JSON, default=list, comment="标签")

    # 时间戳
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)

    # 关联
    question_type: Mapped["QuestionType"] = relationship(
        "QuestionType",
        primaryjoin="foreign(Question.question_type_id) == QuestionType.id",
        lazy="joined",
    )

    # 索引
    __table_args__ = (
        Index('idx_question_scene_grade', 'scene', 'grade'),
        Index('idx_question_subject_unit', 'subject', 'unit_id'),
        Index('idx_question_difficulty', 'difficulty'),
        Index('idx_question_status', 'status'),
    )
```

### 3.2 答案类型 (answer_type) 定义

```python
# 答案类型枚举
ANSWER_TYPES = {
    # 选择类
    "single_choice": "单选题",      # A/B/C/D 单选
    "multi_choice": "多选题",       # 多个正确选项

    # 文本类
    "text": "文本答案",             # 自由文本输入
    "fill_blank": "填空答案",       # 填写缺失内容
    "keyword": "关键词答案",        # 包含关键词即可

    # 判断类
    "judge": "判断答案",            # √/× 或 true/false

    # 匹配类
    "matching": "匹配答案",         # 左右配对
    "sorting": "排序答案",          # 排列顺序

    # 口语类
    "oral_recite": "跟读答案",      # 跟读评分
    "oral_speak": "口语答案",       # 自由表达评分
    "oral_listen": "听力答案",      # 听音频答题

    # 操作类
    "drag_position": "拖拽定位",    # 拖拽到正确位置
    "draw": "绘画答案",             # 手绘图形
    "connect": "连线答案",          # 连接配对

    # 复合类
    "sub_questions": "小题组合",    # 多小题组合(应用题)
    "reading_comprehension": "阅读理解",  # 阅读+多问答

    # 特殊类
    "composition": "作文答案",      # 作文评分
    "experiment": "实验操作",       // 虚拟实验操作
}
```

### 3.3 答案数据结构示例

```json
// 单选题答案
{
  "answer_type": "single_choice",
  "correct_key": "B",
  "options": [
    {"key": "A", "text": "第一个选项内容"},
    {"key": "B", "text": "第二个选项内容"},
    {"key": "C", "text": "第三个选项内容"},
    {"key": "D", "text": "第四个选项内容"}
  ]
}

// 填空题答案
{
  "answer_type": "fill_blank",
  "blanks": [
    {"position": 0, "answer": "答案1", "accept_alternatives": ["答案1", "答一"]},
    {"position": 1, "answer": "答案2", "accept_alternatives": []}
  ]
}

// 判断题答案
{
  "answer_type": "judge",
  "correct_answer": true  // true=正确, false=错误
}

// 匹配题答案
{
  "answer_type": "matching",
  "pairs": [
    {"left": "A", "right": "1"},
    {"left": "B", "right": "2"},
    {"left": "C", "right": "3"}
  ]
}

// 排序题答案
{
  "answer_type": "sorting",
  "correct_order": ["item1", "item2", "item3", "item4"]
}

// 应用题(含小题)答案
{
  "answer_type": "sub_questions",
  "sub_answers": [
    {
      "id": "q1-1",
      "answer": "第一问答案",
      "score": 3,
      "answer_type": "text"
    },
    {
      "id": "q1-2",
      "answer": "第二问答案",
      "score": 4,
      "answer_type": "calculation"
    },
    {
      "id": "q1-3",
      "answer": "第三问答案",
      "score": 3,
      "answer_type": "text"
    }
  ],
  "total_score": 10
}

// 口语题答案
{
  "answer_type": "oral_recite",
  "expected_text": "Hello, my name is Tom.",
  "keywords": ["Hello", "Tom"],
  "min_duration": 3,  // 最小录音时长(秒)
  "max_duration": 30  // 最大录音时长(秒)
}

// 操作题(拖拽)答案
{
  "answer_type": "drag_position",
  "targets": [
    {
      "id": "target1",
      "correct_position": "position_1",
      "description": "将A拖到位置1"
    },
    {
      "id": "target2",
      "correct_position": "position_2",
      "description": "将B拖到位置2"
    }
  ]
}

// 计算题答案
{
  "answer_type": "calculation",
  "steps": [
    {"expression": "3×4", "result": "12", "score": 1},
    {"expression": "12+5", "result": "17", "score": 1}
  ],
  "final_answer": "17",
  "allow_alternative_steps": true
}
```

---

## 四、答题记录优化 (PracticeSessionAnswer)

```python
class PracticeSessionAnswer(BaseModel):
    """
    答题记录表 - 支持复合题目的小题记录

    核心改进:
    - 支持小题答题记录
    - 支持多种答案格式
    """

    __tablename__ = "ah_practice_session_answer"

    # 主键
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # 关联字段
    session_id: Mapped[int] = mapped_column(index=True, comment="会话ID")
    question_id: Mapped[str] = mapped_column(String(255), index=True, comment="题目ID")
    student_id: Mapped[str] = mapped_column(String(255), index=True, comment="学生ID")

    # 题目信息 (冗余)
    question_order: Mapped[int] = mapped_column(comment="题目顺序")
    scene: Mapped[str] = mapped_column(String(50), nullable=True, comment="题型场景")
    answer_type: Mapped[str] = mapped_column(String(50), nullable=True, comment="答案类型")
    unit_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="单元ID")
    knowledge: Mapped[str] = mapped_column(String(255), nullable=True, comment="知识点")
    textbook_id: Mapped[int] = mapped_column(nullable=True, index=True, comment="教材ID")

    # 答题信息
    # 单选题: {"answer_key": "B"}
    # 填空题: {"answers": ["答1", "答2"]}
    # 应用题小题: {"sub_answers": [{"id": "q1-1", "answer": "..."}]}
    text_answer: Mapped[dict] = mapped_column(JSON, nullable=True, comment="学生答案")

    status: Mapped[int] = mapped_column(
        default=0,
        comment="答题状态: 0-未答 1-正确 2-错误 3-部分正确"
    )
    time_spent: Mapped[int] = mapped_column(default=0, comment="耗时(秒)")
    submit_time: Mapped[int] = mapped_column(nullable=True, comment="提交时间")

    # 得分
    score: Mapped[float] = mapped_column(default=0.0, comment="得分")
    max_score: Mapped[float] = mapped_column(default=0.0, comment="满分")

    # 小题得分详情 (复合题目)
    # [{"sub_id": "q1-1", "score": 3, "max_score": 3}, ...]
    sub_scores: Mapped[list[dict]] = mapped_column(
        JSON,
        default=list,
        comment="小题得分详情"
    )

    # 批改信息
    correct_answer: Mapped[dict] = mapped_column(JSON, nullable=True, comment="正确答案")
    analysis: Mapped[str] = mapped_column(Text, nullable=True, comment="解析")
    ai_analysis: Mapped[str] = mapped_column(Text, nullable=True, comment="AI分析")

    # 错题相关
    is_corrected: Mapped[int] = mapped_column(default=0, comment="是否已订正")
    corrected_answer: Mapped[dict] = mapped_column(JSON, nullable=True, comment="订正答案")
    corrected_time: Mapped[int] = mapped_column(nullable=True, comment="订正时间")

    # 时间戳
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now, onupdate=now)

    # 关联
    question: Mapped["Question"] = relationship(
        "Question",
        primaryjoin="foreign(PracticeSessionAnswer.question_id) == Question.id",
        lazy="joined",
    )
```

---

## 五、前端交互组件映射

### 5.1 组件与题型场景对应关系

```typescript
// 前端组件配置
const QUESTION_COMPONENTS: Record<string, ComponentConfig> = {
  // 选择类
  choice: {
    component: 'ChoiceInput',
    props: {
      layout: 'grid',  // grid/list
      columns: 2,      // 列数
      showLabels: true, // 显示A/B/C/D标签
    }
  },

  // 填空类
  fill_blank: {
    component: 'TextInput',
    props: {
      placeholder: '请输入答案...',
      rows: 2,
      showHint: true,
    }
  },

  // 判断类
  judge: {
    component: 'JudgeInput',
    props: {
      showExplanation: true,
    }
  },

  // 匹配类
  matching: {
    component: 'MatchingInput',
    props: {
      lineColor: '#3b82f6',
      allowReset: true,
    }
  },

  // 排序类
  sorting: {
    component: 'SortingInput',
    props: {
      dragHandle: true,
      animation: true,
    }
  },

  // 操作类(拖拽)
  operation: {
    component: 'DragDropInput',
    props: {
      dropZones: [],    // 放置区域
      draggables: [],   // 可拖拽项
    }
  },

  // 口语类
  oral: {
    component: 'AudioInput',
    props: {
      maxDuration: 30,
      showWaveform: true,
      autoPlayPrompt: true,
    }
  },

  // 听力类
  listening: {
    component: 'ListeningInput',
    props: {
      playTimes: 3,
      showTranscript: false,
    }
  },

  // 阅读理解
  reading: {
    component: 'ReadingInput',
    props: {
      showHighlight: true,
      showDictionary: true,
    }
  },

  // 应用题(多小题)
  application: {
    component: 'ApplicationInput',
    props: {
      showSubQuestions: true,
      allowSkip: false,
    }
  },

  // 简答题/计算题
  short_answer:
  calculation: {
    component: 'TextInput',
    props: {
      placeholder: '请写出计算过程和答案...',
      rows: 4,
      showMathKeyboard: true,
    }
  },

  // 作文题
  composition: {
    component: 'CompositionInput',
    props: {
      minWords: 50,
      maxWords: 500,
      showWordCount: true,
    }
  },

  // 涂色/绘画
  paint: {
    component: 'PaintInput',
    props: {
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
      tools: ['brush', 'eraser', 'fill'],
    }
  },
};
```

### 5.2 统一答题组件接口

```typescript
interface AnswerFormProps {
  question: Question;           // 题目信息
  value: PracticeSessionAnswer; // 当前答案
  onChange: (answer: PracticeSessionAnswer) => void; // 答案变更回调
  disabled?: boolean;           // 是否禁用
  showResult?: boolean;         // 是否显示结果
}

// 组件导出
export function getAnswerComponent(scene: string): React.ComponentType<AnswerFormProps> {
  const componentMap: Record<string, React.ComponentType<AnswerFormProps>> = {
    choice: ChoiceInput,
    fill_blank: TextInput,
    judge: JudgeInput,
    matching: MatchingInput,
    sorting: SortingInput,
    operation: DragDropInput,
    oral: AudioInput,
    listening: ListeningInput,
    reading: ReadingInput,
    application: ApplicationInput,
    short_answer: TextInput,
    calculation: TextInput,
    composition: CompositionInput,
    paint: PaintInput,
    experiment: ExperimentInput,
  };

  return componentMap[scene] || TextInput;
}
```

---

## 六、数据库迁移脚本

```sql
-- ==================== QuestionType 表优化 ====================
ALTER TABLE ah_question_type
ADD COLUMN scene VARCHAR(50) COMMENT '题型场景' AFTER id,
ADD COLUMN interaction_mode VARCHAR(50) COMMENT '交互模式' AFTER description,
ADD COLUMN answer_type VARCHAR(50) COMMENT '答案类型' AFTER interaction_mode,
ADD COLUMN config JSON COMMENT '题型配置' AFTER answer_type,
ADD COLUMN is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
ADD COLUMN `order` INT DEFAULT 0 COMMENT '同级排序',
ADD COLUMN metadata JSON COMMENT '扩展元数据',
MODIFY COLUMN title VARCHAR(100) COMMENT '题型标题';

-- 添加唯一索引
ALTER TABLE ah_question_type
ADD UNIQUE INDEX uq_scene_subject_grade_title (scene, subject, grade, title);

-- ==================== Question 表优化 ====================
ALTER TABLE ah_question
ADD COLUMN question_type_id INT COMMENT '题型ID' AFTER id,
ADD COLUMN scene VARCHAR(50) COMMENT '题型场景' AFTER title,
ADD COLUMN sub_questions JSON COMMENT '小题列表' AFTER content,
MODIFY COLUMN answer JSON COMMENT '答案配置',
ADD COLUMN answer_type VARCHAR(50) COMMENT '答案类型' AFTER answer,
ADD COLUMN config JSON COMMENT '题目配置' AFTER answer_type,
ADD COLUMN resource_status INT DEFAULT 0 COMMENT '资源生成状态',
ADD COLUMN status INT DEFAULT 0 COMMENT '状态: 0-草稿 1-待审核 2-已发布 3-已废弃',
ADD COLUMN quality_score FLOAT COMMENT '质量评分',
ADD COLUMN usage_count INT DEFAULT 0 COMMENT '使用次数',
ADD COLUMN tags JSON COMMENT '标签',
ADD INDEX idx_scene_grade (scene, grade),
ADD INDEX idx_question_type_id (question_type_id);

-- ==================== PracticeSessionAnswer 表优化 ====================
ALTER TABLE ah_practice_session_answer
ADD COLUMN scene VARCHAR(50) COMMENT '题型场景' AFTER question_order,
ADD COLUMN answer_type VARCHAR(50) COMMENT '答案类型' AFTER scene,
MODIFY COLUMN text_answer JSON COMMENT '学生答案',
ADD COLUMN score FLOAT DEFAULT 0.0 COMMENT '得分',
ADD COLUMN max_score FLOAT DEFAULT 0.0 COMMENT '满分',
ADD COLUMN sub_scores JSON COMMENT '小题得分详情',
ADD COLUMN ai_analysis TEXT COMMENT 'AI分析';

-- ==================== 新建题目质量评估表 ====================
CREATE TABLE ah_question_quality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id VARCHAR(255) NOT NULL UNIQUE COMMENT '题目ID',
    total_attempts INT DEFAULT 0 COMMENT '总答题次数',
    correct_count INT DEFAULT 0 COMMENT '正确次数',
    skip_count INT DEFAULT 0 COMMENT '跳过次数',
    difficulty FLOAT DEFAULT 0.5 COMMENT '校准难度(0-1)',
    discrimination FLOAT DEFAULT 0.0 COMMENT '区分度',
    point_biserial FLOAT DEFAULT 0.0 COMMENT '点二列相关',
    avg_time_spent FLOAT DEFAULT 0.0 COMMENT '平均答题时间(秒)',
    last_update_time INT DEFAULT 0 COMMENT '最后更新时间',
    INDEX idx_question_id (question_id),
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== 新建练习生成日志表 ====================
CREATE TABLE ah_practice_session_generation_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL COMMENT '会话ID',
    stage VARCHAR(50) COMMENT '阶段',
    status VARCHAR(20) COMMENT '状态: success/failed/running',
    message TEXT COMMENT '日志信息',
    duration INT DEFAULT 0 COMMENT '耗时(毫秒)',
    create_time INT DEFAULT 0 COMMENT '创建时间',
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 七、实施优先级

### 高优先级 (立即实施)
1. **QuestionType 表添加 scene 字段** - 支持题型场景分类
2. **Question 表添加 sub_questions 字段** - 支持应用题小题
3. **添加唯一索引** - 防止数据重复

### 中优先级 (1-2周内)
4. **Answer 字段改为 JSON** - 支持多种答案格式
5. **前端组件适配** - 更新交互组件支持新数据结构
6. **添加资源生成状态** - 追踪图片/语音生成

### 低优先级 (长期优化)
7. **题目质量评估表** - 实现题目质量指标计算
8. **生成日志表** - 追踪题目生成过程
9. **自适应练习** - 基于能力的题目推荐
