# AI教育平台练习系统设计文档

## 1. 概述

本文档详细描述了AI教育平台的三个核心练习功能的设计方案：今日练习、单元练习和能力评测。这三个功能基于现有的问题生成系统和学生数据模型，为学生提供个性化、自适应的学习体验。

## 2. 系统架构

### 2.1 现有基础

系统基于以下现有组件构建：
- **问题生成系统** (`server/ai/graphs/generate_question.py`)：基于LangGraph的AI问题生成流程
- **数据模型** (`server/common/database.py`)：包含学生、教材、题目、学习记录等核心模型
- **业务服务**：错题管理、学习记录统计等服务

### 2.2 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                │
│  (今日练习页) (单元练习页) (能力评测页)                       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        API层                                 │
│  /practice/daily  /practice/unit  /practice/assessment      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      服务层                                   │
│  DailyPracticeService  UnitPracticeService                  │
│  AssessmentService  QuestionSelector  ScoreAnalyzer         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      核心引擎                                 │
│  AI问题生成  难度评估  知识追踪  自适应算法                    │
└─────────────────────────────────────────────────────────────┘
```

## 3. 功能详细设计

### 3.1 今日练习 (Daily Practice)

#### 3.1.1 功能概述

今日练习是学生的每日个性化练习推荐系统，根据学生的学习历史、错题情况、能力水平等因素，智能推荐适合的题目进行练习。

#### 3.1.2 核心特性

1. **智能推荐算法**
   - 基于学生历史学习数据
   - 考虑错题率和薄弱知识点
   - 动态调整难度
   - 覆盖多个知识点

2. **个性化内容**
   - 复习错题（占30%）
   - 巩固当前进度（占40%）
   - 挑战高难度题目（占20%）
   - 拓展新知识点（占10%）

3. **学习追踪**
   - 实时记录答题情况
   - 分析学习效果
   - 更新能力模型
   - 生成学习报告

#### 3.1.3 数据模型

需要新增以下数据表：

```python
class DailyPracticeSession(BaseModel):
    __tablename__ = "ah_daily_practice_session"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[int] = mapped_column(nullable=False)  # 练习日期 YYYYMMDD
    total_questions: Mapped[int] = mapped_column(default=0)
    correct_questions: Mapped[int] = mapped_column(default=0)
    total_time: Mapped[int] = mapped_column(default=0)
    practice_type: Mapped[str] = mapped_column(String(50))  # daily/adaptive
    knowledge_coverage: Mapped[str] = mapped_column(Text)  # JSON格式，覆盖的知识点
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)
```

#### 3.1.4 服务实现

**服务文件**：`server/student/services/daily_practice.py`

```python
class DailyPracticeService:
    """今日练习服务"""

    @staticmethod
    async def get_daily_practice(db: AsyncSession, student_id: str, date: int = None):
        """
        获取今日练习内容

        步骤：
        1. 分析学生学习历史
        2. 识别薄弱知识点
        3. 选择合适题目
        4. 生成练习会话
        """
        # TODO: 实现智能推荐算法
        pass

    @staticmethod
    async def submit_practice(db: AsyncSession, session_id: int, answers: List[PracticeAnswer]):
        """
        提交练习答案

        步骤：
        1. 批改答案
        2. 记录学习记录
        3. 更新错题库
        4. 更新学生统计
        5. 生成反馈报告
        """
        # TODO: 实现答案批改和记录
        pass

    @staticmethod
    async def get_practice_history(db: AsyncSession, student_id: str, limit: int = 30):
        """获取练习历史"""
        # TODO: 实现历史记录查询
        pass
```

#### 3.1.5 API设计

```python
# 获取今日练习
@router.get("/daily")
async def get_daily_practice(student_id: str, date: int = None)

# 提交练习答案
@router.post("/daily/submit")
async def submit_daily_practice(session_id: int, answers: List[PracticeAnswer])

# 获取练习历史
@router.get("/daily/history")
async def get_practice_history(student_id: str, limit: int = 30)
```

#### 3.1.6 推荐算法流程

```
开始
  ↓
获取学生学习档案
  ↓
分析历史学习数据
  ↓
识别薄弱知识点
  ↓
统计错题分布
  ↓
计算当前能力水平
  ↓
确定题目分配比例
  ↓
筛选题目（30%错题+40%巩固+20%挑战+10%新知）
  ↓
动态调整难度
  ↓
生成练习会话
  ↓
返回推荐结果
```

---

### 3.2 单元练习 (Unit Practice)

#### 3.2.1 功能概述

单元练习是针对特定教学单元的专项练习系统，帮助学生针对特定单元进行系统性训练，全面掌握单元知识。

#### 3.2.2 核心特性

1. **完整的单元覆盖**
   - 覆盖单元内所有知识点
   - 从基础到进阶的完整练习路径
   - 支持多次练习和巩固

2. **分层练习设计**
   - 基础题：巩固核心概念
   - 提高题：深化理解
   - 综合题：灵活运用
   - 拓展题：知识迁移

3. **进度追踪**
   - 单元完成度统计
   - 知识点掌握情况
   - 学习时间记录
   - 成绩趋势分析

#### 3.2.3 数据模型

```python
class UnitPracticeSession(BaseModel):
    __tablename__ = "ah_unit_practice_session"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)
    unit_id: Mapped[int] = mapped_column(nullable=False)
    practice_date: Mapped[int] = mapped_column(default=now)

    # 练习统计
    total_questions: Mapped[int] = mapped_column(default=0)
    correct_questions: Mapped[int] = mapped_column(default=0)
    total_time: Mapped[int] = mapped_column(default=0)
    score: Mapped[float] = mapped_column(default=0.0)

    # 知识点掌握情况
    knowledge_scores: Mapped[str] = mapped_column(Text)  # JSON格式

    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress/completed
    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)

    # 关联关系
    unit: Mapped["Unit"] = relationship(lazy="joined")
```

#### 3.2.4 服务实现

**服务文件**：`server/student/services/unit_practice.py`

```python
class UnitPracticeService:
    """单元练习服务"""

    @staticmethod
    async def get_unit_practice(db: AsyncSession, student_id: str, unit_id: int, difficulty: str = "adaptive"):
        """
        获取单元练习

        参数：
        - difficulty: 难度级别 (easy/medium/hard/adaptive)
        """
        # TODO: 实现单元练习生成
        pass

    @staticmethod
    async def get_unit_progress(db: AsyncSession, student_id: str, unit_id: int):
        """
        获取单元学习进度

        返回：
        - 总体完成度
        - 各知识点掌握情况
        - 练习历史
        """
        # TODO: 实现进度计算
        pass

    @staticmethod
    async def generate_unit_questions(db: AsyncSession, unit_id: int, count: int, difficulty: str):
        """
        为单元生成练习题

        复用现有的AI问题生成系统
        """
        # TODO: 集成问题生成流程
        pass

    @staticmethod
    async def submit_unit_practice(db: AsyncSession, session_id: int, answers: List[PracticeAnswer]):
        """提交单元练习"""
        # TODO: 实现答案批改和记录
        pass
```

#### 3.2.5 API设计

```python
# 获取单元练习
@router.get("/unit/{unit_id}")
async def get_unit_practice(student_id: str, unit_id: int, difficulty: str = "adaptive")

# 获取单元进度
@router.get("/unit/{unit_id}/progress")
async def get_unit_progress(student_id: str, unit_id: int)

# 生成单元题目
@router.post("/unit/{unit_id}/generate")
async def generate_unit_questions(unit_id: int, count: int, difficulty: str)

# 提交单元练习
@router.post("/unit/{unit_id}/submit")
async def submit_unit_practice(session_id: int, answers: List[PracticeAnswer])
```

#### 3.2.6 题目分配策略

```
单元练习题目分配：
基础题 (30%): 核心概念、基本操作
提高题 (40%): 深入理解、变形应用
综合题 (20%): 跨知识点、复杂情境
拓展题 (10%): 创新思维、知识迁移
```

---

### 3.3 能力评测 (Ability Assessment)

#### 3.3.1 功能概述

能力评测是通过标准化测试评估学生当前能力水平的系统。系统根据评测结果生成详细的能力报告，为学习计划制定提供科学依据。

#### 3.3.2 核心特性

1. **多维度评估**
   - 知识掌握度
   - 能力水平（初学/熟练/精通）
   - 学习速度
   - 错误模式分析

2. **自适应测试**
   - 根据答题情况动态调整题目难度
   - 快速定位能力边界
   - 减少测试时间
   - 提高测试精度

3. **详细报告**
   - 能力评分（0-100分）
   - 知识点掌握雷达图
   - 优势与薄弱点分析
   - 学习建议

#### 3.3.3 数据模型

```python
class AssessmentTest(BaseModel):
    __tablename__ = "ah_assessment_test"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)
    assessment_type: Mapped[str] = mapped_column(String(50))  # unit/comprehensive/topic
    target_id: Mapped[int] = mapped_column()  # 评测目标ID（单元ID、知识点ID等）

    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress/completed
    start_time: Mapped[int] = mapped_column(default=now)
    end_time: Mapped[int] = mapped_column()
    total_time: Mapped[int] = mapped_column(default=0)

    # 评测配置
    adaptive: Mapped[int] = mapped_column(default=1)  # 是否自适应
    max_questions: Mapped[int] = mapped_column(default=20)
    min_questions: Mapped[int] = mapped_column(default=10)
    difficulty_range: Mapped[str] = mapped_column(String(100))  # 难度范围

    # 评测结果
    overall_score: Mapped[float] = mapped_column(default=0.0)
    ability_level: Mapped[str] = mapped_column(String(50))  # beginner/intermediate/advanced
    confidence: Mapped[float] = mapped_column(default=0.0)  # 结果可信度

    create_time: Mapped[int] = mapped_column(default=now)
    update_time: Mapped[int] = mapped_column(default=now)


class AssessmentQuestion(BaseModel):
    __tablename__ = "ah_assessment_question"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(nullable=False)
    question_id: Mapped[int] = mapped_column(nullable=False)

    question_order: Mapped[int] = mapped_column(default=0)
    difficulty: Mapped[str] = mapped_column(String(50))
    is_correct: Mapped[int] = mapped_column(default=0)
    time_spent: Mapped[int] = mapped_column(default=0)
    knowledge_tag: Mapped[str] = mapped_column(String(255))

    create_time: Mapped[int] = mapped_column(default=now)


class AssessmentReport(BaseModel):
    __tablename__ = "ah_assessment_report"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(nullable=False)
    student_id: Mapped[str] = mapped_column(String(255), nullable=False)

    # 总体评估
    overall_score: Mapped[float] = mapped_column(default=0.0)
    ability_level: Mapped[str] = mapped_column(String(50))
    percentile: Mapped[int] = mapped_column(default=0)  # 百分位排名

    # 详细分析
    knowledge_mastery: Mapped[str] = mapped_column(Text)  # JSON格式，知识点掌握情况
    ability_breakdown: Mapped[str] = mapped_column(Text)  # JSON格式，能力分解
    learning_speed: Mapped[float] = mapped_column(default=0.0)
    consistency: Mapped[float] = mapped_column(default=0.0)  # 稳定性

    # 建议
    strengths: Mapped[str] = mapped_column(Text)  # 优势
    weaknesses: Mapped[str] = mapped_column(Text)  # 薄弱点
    recommendations: Mapped[str] = mapped_column(Text)  # 学习建议

    create_time: Mapped[int] = mapped_column(default=now)
```

#### 3.3.4 服务实现

**服务文件**：`server/student/services/assessment.py`

```python
class AssessmentService:
    """能力评测服务"""

    @staticmethod
    async def create_assessment(db: AsyncSession, student_id: str, assessment_type: str, target_id: int):
        """
        创建能力评测

        步骤：
        1. 分析学生历史数据
        2. 确定初始难度
        3. 生成评测会话
        4. 选择初始题目
        """
        # TODO: 实现评测创建
        pass

    @staticmethod
    async def get_next_question(db: AsyncSession, assessment_id: int):
        """
        获取下一道题（自适应算法）

        基于：
        - 已答题目的正确率
        - 题目难度
        - 知识点分布
        - 置信度阈值

        动态调整后续题目难度
        """
        # TODO: 实现自适应选题
        pass

    @staticmethod
    async def submit_answer(db: AsyncSession, assessment_id: int, question_id: int, answer: str, time_spent: int):
        """
        提交答案并更新评测状态

        步骤：
        1. 批改答案
        2. 更新能力评估
        3. 判断是否继续或结束
        4. 选择下一题或生成报告
        """
        # TODO: 实现答案处理和自适应调整
        pass

    @staticmethod
    async def complete_assessment(db: AsyncSession, assessment_id: int):
        """
        完成评测并生成报告

        步骤：
        1. 计算总体得分
        2. 分析能力水平
        3. 生成详细报告
        4. 更新学生档案
        """
        # TODO: 实现报告生成
        pass

    @staticmethod
    async def get_assessment_report(db: AsyncSession, assessment_id: int):
        """获取评测报告"""
        # TODO: 实现报告查询
        pass


class AdaptiveAlgorithm:
    """自适应评测算法"""

    @staticmethod
    def calculate_ability(current_ability: float, difficulty: float, is_correct: bool) -> float:
        """
        基于IRT（项目反应理论）计算能力值

        参数：
        - current_ability: 当前能力估计值 (-3 到 +3)
        - difficulty: 题目难度 (-3 到 +3)
        - is_correct: 是否正确

        返回：
        - 更新后的能力值
        """
        # TODO: 实现IRT算法
        pass

    @staticmethod
    def select_next_difficulty(ability: float, confidence: float) -> str:
        """
        根据当前能力选择下一题难度

        规则：
        - 能力低 + 信心低 -> 降低难度
        - 能力高 + 信心高 -> 提高难度
        - 信心低但能力强 -> 中等难度确认
        """
        # TODO: 实现难度选择策略
        pass
```

#### 3.3.5 API设计

```python
# 创建能力评测
@router.post("/assessment")
async def create_assessment(student_id: str, assessment_type: str, target_id: int)

# 获取下一题
@router.get("/assessment/{assessment_id}/next")
async def get_next_question(assessment_id: int)

# 提交答案
@router.post("/assessment/{assessment_id}/answer")
async def submit_answer(assessment_id: int, question_id: int, answer: str, time_spent: int)

# 完成评测
@router.post("/assessment/{assessment_id}/complete")
async def complete_assessment(assessment_id: int)

# 获取评测报告
@router.get("/assessment/{assessment_id}/report")
async def get_assessment_report(assessment_id: int)

# 获取评测历史
@router.get("/assessment/history")
async def get_assessment_history(student_id: str, limit: int = 10)
```

#### 3.3.6 自适应算法流程

```
开始评测
  ↓
选择初始题目（中等难度）
  ↓
学生答题
  ↓
判断答案
  ↓
更新能力估计
  ↓
计算置信度
  ↓
判断是否达到终止条件
  ├─ 是 → 生成评测报告
  └─ 否 → 选择下一题（根据能力动态调整难度）
          ↑__________________________
```

**终止条件**：
- 答题数量达到上限（20题）
- 置信度达到阈值（95%）
- 能力值稳定在某个范围
- 连续答对多道同难度题目

---

## 4. 集成设计

### 4.1 与现有系统集成

#### 4.1.1 复用问题生成系统

三个功能都基于现有的AI问题生成系统：

```python
# 集成示例
from ai.graphs.generate_question import generate_question_graph

async def generate_practice_questions(db: AsyncSession, unit_id: int, count: int, difficulty: str):
    """生成练习题目"""
    graph = generate_question_graph(db, unit_id, count)
    result = await graph.ainvoke({
        "unit_id": unit_id,
        "count": count,
        "difficulty": difficulty  # 新增难度参数
    })
    return result["questions"]
```

#### 4.1.2 共享数据模型

- 复用 Question 模型
- 使用 StudyRecord 记录学习过程
- 扩展 StudentWrongQuestion 管理错题
- 复用 StudentStats 统计信息

#### 4.1.3 统一认证和权限

使用现有的学生认证系统：
```python
@router.get("/daily")
async def get_daily_practice(
    student_id: str = Depends(get_current_student),
    date: int = None
):
    # 获取当前登录学生
    # 验证学生身份
    # 检查数据访问权限
    pass
```

### 4.2 数据流设计

#### 4.2.1 今日练习数据流

```
学生请求 → 分析历史数据 → 智能选题 → 生成练习 → 答题 → 批改 → 记录 → 更新能力模型
```

#### 4.2.2 单元练习数据流

```
学生选择单元 → 分析单元内容 → 分配题目比例 → 生成练习 → 答题 → 评估 → 更新单元进度
```

#### 4.2.3 能力评测数据流

```
开始评测 → 初始题目 → 答题 → 自适应调整 → 继续/结束 → 生成报告 → 更新档案
```

---

## 5. 技术实现细节

### 5.1 缓存策略

为提高性能，使用Redis缓存：
- 学生能力模型（30分钟过期）
- 题目内容（1小时过期）
- 今日推荐结果（每日更新）
- 单元练习配置（1天过期）

```python
# 缓存示例
from redis.asyncio import Redis

class CacheManager:
    @staticmethod
    async def get_student_ability(student_id: str) -> float:
        cache_key = f"ability:{student_id}"
        cached = await redis.get(cache_key)
        if cached:
            return float(cached)
        return None

    @staticmethod
    async def set_student_ability(student_id: str, ability: float):
        cache_key = f"ability:{student_id}"
        await redis.setex(cache_key, 1800, str(ability))  # 30分钟
```

### 5.2 异步任务

对于耗时操作（如AI问题生成），使用Celery异步处理：

```python
from celery import Celery

celery_app = Celery('ai_education')

@celery_app.task
def generate_questions_async(unit_id: int, count: int, difficulty: str):
    """异步生成题目"""
    # 调用问题生成系统
    pass
```

### 5.3 数据一致性

使用数据库事务确保数据一致性：
```python
async def submit_practice(db: AsyncSession, session_id: int, answers: List[PracticeAnswer]):
    async with db.begin():
        # 批改答案
        # 记录学习记录
        # 更新统计信息
        # 更新错题库
        # 更新能力模型
        pass
```

---

## 6. 性能优化

### 6.1 题目筛选优化

- 使用数据库索引加速题目查询
- 预生成常用题目池
- 缓存热点题目

```sql
-- 索引建议
CREATE INDEX idx_question_unit_difficulty ON ah_question(unit_id, difficulty);
CREATE INDEX idx_question_knowledge ON ah_question(knowledge);
CREATE INDEX idx_question_type ON ah_question(type);
```

### 6.2 并发处理

- 使用连接池管理数据库连接
- 题目生成使用队列控制并发
- 前端支持题目懒加载

### 6.3 监控和告警

- 监控API响应时间
- 跟踪题目生成成功率
- 告警异常错误率

---

## 7. 测试策略

### 7.1 单元测试

为每个服务编写单元测试：
- 推荐算法准确性
- 自适应调整逻辑
- 数据读写正确性

### 7.2 集成测试

- API接口测试
- 数据流测试
- 性能压力测试

### 7.3 调优测试

- 算法参数调优
- 缓存效果测试
- 并发性能测试

---

## 8. 实施计划

### 8.1 阶段一：基础框架（2周）
- [ ] 创建数据表模型
- [ ] 实现基础服务类
- [ ] 设计API接口
- [ ] 单元测试

### 8.2 阶段二：核心功能（3周）
- [ ] 实现今日练习
- [ ] 实现单元练习
- [ ] 集成问题生成系统
- [ ] 集成测试

### 8.3 阶段三：能力评测（2周）
- [ ] 实现自适应算法
- [ ] 实现报告生成
- [ ] 性能优化
- [ ] 完整测试

### 8.4 阶段四：优化部署（1周）
- [ ] 性能调优
- [ ] 监控告警
- [ ] 文档完善
- [ ] 生产部署

---

## 9. 风险评估

### 9.1 技术风险
- **AI问题生成质量**：建立人工审核机制
- **自适应算法准确性**：持续调优算法参数
- **数据一致性**：使用事务和幂等设计

### 9.2 性能风险
- **高并发问题**：使用缓存和队列
- **大数据量**：分页和懒加载
- **响应时间**：异步处理和预计算

### 9.3 业务风险
- **学习效果不佳**：建立反馈机制
- **学生流失**：优化用户体验
- **数据丢失**：定期备份

---

## 10. 总结

本设计方案充分利用现有系统资源，通过智能推荐、自适应评测和数据驱动的方式，为学生提供个性化的学习体验。三个功能相互补充：

- **今日练习**：日常持续学习，保持学习习惯
- **单元练习**：专项突破，全面掌握单元知识
- **能力评测**：科学评估，为学习提供指导

通过这三套系统，AI教育平台能够为每个学生提供精准、高效、个性化的学习方案，真正实现因材施教的教育理念。

---

*文档版本：v1.0*
*创建日期：2025-11-09*
*作者：AI教育平台开发团队*