---
name: mastery-analysis
description: 专注于学生能力掌握度的分析算法、等级定义与数据统计。
---

# Mastery Analysis Skill

本技能提供了评估学生对知识点/能力点（Ability）掌握程度的逻辑规范。

## 掌握度模型 (Mastery Model)

### 1. 等级定义

系统将掌握度映射为四个等级：

- **unlearned** (未掌握): 0.0 - 39.9
- **beginner** (初步掌握): 40.0 - 59.9
- **proficient** (基本掌握): 60.0 - 79.9
- **mastered** (熟练掌握): 80.0 - 100.0

### 2. 核心计算指标

- `mastery_score`: 综合正确率与题目难度的加权得分（0-100）。
- `correct_count` / `wrong_count`: 累计做题情况。
- `last_practice_time`: 考虑遗忘曲线的时间戳。

## 数据操作指南

### 获取学生薄弱点

优先筛选 `mastery_level` 为 `unlearned` 或 `beginner` 的能力点：

```python
from shared.core.database import StudentAbilityMastery
# 查询学生的薄弱项
stmt = select(StudentAbilityMastery).where(
    StudentAbilityMastery.student_id == student_id,
    StudentAbilityMastery.mastery_level.in_(["unlearned", "beginner"])
)
```

### 更新掌握度逻辑

每次练习提交后，调用 `update_student_mastery` 服务：

- **正确**: 增加分数，权重由题目难度决定。
- **错误**: 扣除分数（或小幅增长，视具体业务逻辑而定）。

## 注意事项

1. **冷启动策略**: 对于从未练习过的新知识点，默认标记为 `unlearned` 或根据年级基线设置初始值。
2. **多终端同步**: 掌握度数据属于全局共享，务必确保数据库事务一致性。
3. **报表展示**: 列表展示时按 `mastery_score` 降序排列（掌握最好）或升序排列（最需要复习）。
