# 问题库知识库系统 - 实施路线图

## 快速开始指南

本文档提供了问题库知识库系统的分步实施指南，帮助您逐步实现这个系统。

## 阶段一：数据模型设计（第1周）

### 1.1 数据库表设计

#### 步骤1：创建问题-知识点关联表

```sql
CREATE TABLE `ah_question_knowledge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `knowledge_id` int NOT NULL,
  `is_primary` int DEFAULT 1 COMMENT '是否主要知识点',
  `weight` float DEFAULT 1.0 COMMENT '权重',
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_question_knowledge` (`question_id`, `knowledge_id`),
  KEY `idx_question_id` (`question_id`),
  KEY `idx_knowledge_id` (`knowledge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 步骤2：创建学生单元掌握度表（以单元为维度）

```sql
CREATE TABLE `ah_student_unit_mastery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(255) NOT NULL,
  `unit_id` int NOT NULL,
  `textbook_id` int NOT NULL,
  `mastery_level` float DEFAULT 0.0 COMMENT '掌握度（0-1）',
  `mastery_score` float DEFAULT 0.0 COMMENT '掌握分数（0-100）',
  `total_practiced` int DEFAULT 0 COMMENT '总练习次数',
  `correct_count` int DEFAULT 0 COMMENT '正确次数',
  `wrong_count` int DEFAULT 0 COMMENT '错误次数',
  `total_questions` int DEFAULT 0 COMMENT '总题目数',
  `last_practice_time` int DEFAULT NULL COMMENT '最近练习时间',
  `last_score` float DEFAULT 0.0 COMMENT '最近一次得分',
  `is_mastered` int DEFAULT 0 COMMENT '是否已掌握',
  `mastery_threshold` float DEFAULT 0.8 COMMENT '掌握阈值',
  `next_review_time` int DEFAULT NULL COMMENT '下次复习时间',
  `review_count` int DEFAULT 0 COMMENT '复习次数',
  `knowledge_breakdown` text COMMENT '各知识点掌握情况（JSON）',
  `create_time` int NOT NULL,
  `update_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_unit` (`student_id`, `unit_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_unit_id` (`unit_id`),
  KEY `idx_textbook_id` (`textbook_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 步骤3：扩展知识点表（简化版，两级结构）

```sql
ALTER TABLE `ah_knowledge`
  ADD COLUMN `order` int DEFAULT 0 COMMENT '同级排序',
  ADD COLUMN `difficulty` varchar(50) DEFAULT NULL COMMENT '知识点难度',
  ADD COLUMN `importance` int DEFAULT 5 COMMENT '重要性（1-10）';
  
-- ❌ 已删除：parent_id, level, prerequisite_ids, question_count
-- 理由：简化为两级结构（单元->知识点），避免过度复杂
-- question_count改为通过缓存计算，避免数据冗余
```

### 1.2 Python模型定义

在 `server/common/database.py` 中添加：

```python
# 1. QuestionKnowledge 模型（参考 knowledge_base_implementation_example.py）
# 2. StudentUnitMastery 模型（参考 knowledge_base_implementation_example.py）
# 3. 修改 Knowledge 模型，添加新字段（简化版，两级结构）
# 4. 修改 Question 模型，添加 knowledge_points 关联
```

## 阶段二：基础服务实现（第2周）

### 2.1 创建服务文件

创建以下服务文件：

1. `server/common/services/knowledge_service.py` - 知识点管理服务
2. `server/common/services/question_knowledge_service.py` - 问题-知识点关联服务
3. `server/common/services/unit_mastery_service.py` - 单元掌握度追踪服务（以单元为维度）
4. `server/common/services/improved_question_selector.py` - 优化的题目选择服务（无需RAG）
5. `server/common/services/unit_based_question_service.py` - 基于单元掌握度的题目生成服务（优化版）

### 2.2 实现核心方法

参考 `docs/knowledge_base_implementation_example.py` 中的实现：

- `KnowledgeService.create_knowledge()` - 创建知识点（简化版）
- `KnowledgeService.get_knowledge_by_unit()` - 获取知识点列表（按单元分组）
- `KnowledgeService.get_question_count()` - 获取知识点题目数量（缓存）
- `QuestionKnowledgeService.link_question_to_knowledge()` - 关联问题到知识点
- `UnitMasteryService.update_mastery()` - 更新单元掌握度（EMA+时间衰减）
- `UnitMasteryService.get_student_unit_mastery_map()` - 获取单元掌握度映射
- `ImprovedQuestionSelector.select_questions_with_mastery()` - 基于掌握度的智能题目选择
- `UnitBasedQuestionService.generate_daily_practice_questions()` - 生成今日练习题目（基于单元掌握度）

## 阶段三：完善教材解析功能（第3周）

### 3.1 更新parse_textbook函数

更新 `server/admin/services/textbook.py` 中的 `parse_textbook` 函数：

```python
# 1. 在创建知识点时设置order（排序）
# 2. 设置默认importance=5
# 3. 更新_clean_textbook函数，清理QuestionKnowledge关联
```

### 3.2 数据迁移

创建迁移脚本 `server/migrations/migrate_knowledge_base.py`：

```python
async def migrate_existing_data(db: AsyncSession):
    """迁移现有数据"""
    # 1. 将 Question.knowledge 字符串转换为 QuestionKnowledge 关联
    # 2. 根据历史学习记录初始化单元掌握度
    # 3. 为已解析的知识点设置order（如果为NULL）
    # 4. 知识点题目数量通过缓存计算，无需迁移
```

### 3.3 测试迁移

- 在测试环境执行迁移
- 验证数据完整性
- 测试教材重新解析功能
- 检查性能影响

## 阶段四：集成到现有系统（第4周）

### 4.1 修改今日练习服务

在 `server/student/services/daily_practice.py` 中：

```python
# 修改 _select_daily_questions 方法
@staticmethod
async def _select_daily_questions(
    db: AsyncSession, student_id: str, textbook_id: int, count: int
) -> List[int]:
    """智能选择今日练习题目（基于单元掌握度，优化SQL查询）"""
    from common.services.unit_based_question_service import UnitBasedQuestionService
    
    return await UnitBasedQuestionService.generate_daily_practice_questions(
        db, student_id, textbook_id, count
    )
```

### 4.2 修改答题提交逻辑

在 `complete_practice` 方法中更新单元掌握度：

```python
# 在完成练习时，更新单元掌握度
from common.services.unit_mastery_service import UnitMasteryService

# 统计知识点掌握情况
knowledge_breakdown = {}
for qid in question_ids:
    answer_data = answers.get(str(qid), {})
    if answer_data:
        question = await db.get(Question, qid)
        if question and question.knowledge:
            knowledge = question.knowledge
            if knowledge not in knowledge_breakdown:
                knowledge_breakdown[knowledge] = {"total": 0, "correct": 0}
            knowledge_breakdown[knowledge]["total"] += 1
            if answer_data.get("is_correct"):
                knowledge_breakdown[knowledge]["correct"] += 1

# 更新单元掌握度
unit_id = question.unit_id
await UnitMasteryService.update_mastery(
    db,
    student_id=student_id,
    unit_id=unit_id,
    score=score,
    total_questions=total_questions,
    correct_count=correct_count,
    knowledge_breakdown=knowledge_breakdown
)
```

### 4.3 修改单元练习服务

在 `server/student/services/unit_practice.py` 中：

```python
# 使用基于单元掌握度的题目生成
from common.services.unit_based_question_service import UnitBasedQuestionService

question_ids = await UnitBasedQuestionService.generate_unit_practice_questions(
    db, student_id, unit_id, count
)
```

### 4.4 修改能力评测服务

在 `server/student/services/assessment.py` 中：

```python
# 使用基于单元掌握度的题目生成
from common.services.unit_based_question_service import UnitBasedQuestionService

question_ids = await UnitBasedQuestionService.generate_assessment_questions(
    db, student_id, textbook_id, unit_ids, difficulty_range, count
)
```

## 阶段五：管理后台集成（第5周）

### 5.1 知识点管理界面

在 `admin/src/pages/Textbook/Detail/views/Knowledge.tsx` 中：

- 添加知识点层级显示（树形结构）
- 添加知识点属性编辑（难度、重要性等）
- 添加知识点关联题目功能

### 5.2 问题管理界面

在 `admin/src/pages/Question/List/index.tsx` 中：

- 添加知识点关联功能
- 显示问题关联的知识点列表
- 支持多知识点关联

### 5.3 API接口

创建以下API接口：

```python
# server/admin/routes/knowledge.py
# - GET /api/admin/knowledge/tree - 获取知识点树
# - POST /api/admin/knowledge - 创建知识点
# - PUT /api/admin/knowledge/{id} - 更新知识点
# - POST /api/admin/question/{id}/knowledge - 关联问题到知识点

```

## 阶段六：学生端功能（第6周）

### 6.1 掌握度查询API

在 `server/student/routes/` 中创建：

```python
# GET /api/student/unit/mastery - 获取单元掌握度
# GET /api/student/unit/weak - 获取薄弱单元
# GET /api/student/unit/{id}/mastery - 获取单个单元掌握度
```

### 6.2 前端展示

在 `student/src/` 中：

- 单元掌握度可视化（雷达图、进度条）
- 薄弱单元提醒
- 学习建议展示

## 阶段七：测试和优化（第7周）

### 7.1 单元测试

为每个服务创建单元测试：

- `tests/test_knowledge_service.py`
- `tests/test_question_knowledge_service.py`
- `tests/test_unit_mastery_service.py`
- `tests/test_improved_question_selector.py`
- `tests/test_unit_based_question_service.py`

### 7.2 性能优化

- 数据库索引优化
- 查询优化（避免N+1问题）
- SQL查询性能优化（充分利用索引）
- 缓存策略（Redis缓存知识点列表、单元掌握度、题目数量等）

### 7.3 用户体验优化

- 加载速度优化
- 错误处理完善
- 日志记录

## 实施检查清单

### 数据模型
- [ ] 创建 `ah_question_knowledge` 表
- [ ] 创建 `ah_student_unit_mastery` 表（单元维度）
- [ ] 扩展 `ah_knowledge` 表（简化版，两级结构）
- [ ] 定义 Python 模型类
- [ ] 添加关联关系

### 服务实现
- [ ] 知识点管理服务（简化版）
- [ ] 问题-知识点关联服务
- [ ] 单元掌握度追踪服务（以单元为维度，EMA+时间衰减）
- [ ] 优化的题目选择服务（无需RAG）
- [ ] 基于单元掌握度的题目生成服务（优化版）

### 数据迁移
- [ ] 迁移脚本编写
- [ ] 测试环境验证
- [ ] 生产环境执行

### 系统集成
- [ ] 完善教材解析功能（parse_textbook，支持知识点排序）
- [ ] 更新清理逻辑（_clean_textbook，包含QuestionKnowledge关联）
- [ ] 今日练习服务集成（优化SQL查询）
- [ ] 单元练习服务集成（优化SQL查询）
- [ ] 能力评测服务集成（优化SQL查询）
- [ ] 完成练习逻辑更新（单元掌握度，EMA+时间衰减）
- [ ] [可选] 自动关联题目到知识点功能

### 管理后台
- [ ] 知识点管理界面
- [ ] 问题关联界面
- [ ] API接口实现

### 学生端
- [ ] 单元掌握度查询API
- [ ] 前端展示界面
- [ ] 学习建议功能

### 测试和优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] 用户体验优化

## 注意事项

1. **向后兼容**：保留 `Question.knowledge` 字段，确保现有功能不受影响
2. **数据一致性**：迁移过程中确保数据完整性
3. **性能考虑**：大量数据迁移时使用批量操作
4. **错误处理**：完善的异常处理和日志记录
5. **测试覆盖**：确保关键功能有测试覆盖

## 预期收益

1. **精准推荐**：基于单元掌握度和优化SQL查询的个性化题目推荐
2. **学习追踪**：以单元为维度实时追踪学生学习进度和掌握情况
3. **改进算法**：使用EMA+时间衰减的掌握度计算，更准确反映学习状态
4. **智能复习**：基于遗忘曲线的智能复习提醒
5. **简化设计**：两级知识点结构，降低系统复杂度
6. **数据分析**：为学习分析和报告提供数据基础
7. **系统扩展**：为未来功能扩展提供基础架构
8. **维护成本低**：无需向量数据库，减少系统依赖和故障点
9. **性价比高**：保留核心价值，去除不必要的复杂度

