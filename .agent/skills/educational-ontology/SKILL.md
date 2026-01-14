---
name: educational-ontology
description: K12 教育本体知识管理，包含学科、教材、单元及能力知识点。
---

# Educational Ontology Skill

本技能提供了管理 K12 教育本体数据的规范和最佳实践。包含对学科、年级、教材、单元以及能力（知识点）的操作指南。

## 领域模型概览

### 1. 教材体系 (Textbook Hierarchy)

- **Textbook**: 教材主表（学科、版本、年级、学期）。
- **Unit**: 单元/章节，隶属于某个 Textbook。
- **TeacherBook**: 教师用书，包含更详细的解析参考。

### 2. 能力体系 (Ability / Knowledge Points)

- **Ability**: 能力/知识点定义。
- **Ability Code**: 唯一标识，通常采用分层编码（如 `MATH_G01_U01_K01`）。

## 核心操作指引

### 查询教材级联关系

在处理学生设置时，优先根据 `textbook_id` 关联 `Unit`。

```python
from shared.core.database import Textbook, Unit
# 查询指定教材的所有单元
stmt = select(Unit).where(Unit.textbook_id == textbook_id)
```

### 能力代码规范

- 必须包含：学科前缀 + 年级标识 + 业务标识。
- 示例：`CN_PRI_G1_S1_001` (语文*小学*一年级\_上册\_001)。

## 常用工具函数

- `get_textbook_by_id(db, id)`: 获取教材详情。
- `get_units_by_textbook(db, textbook_id)`: 获取单元列表。
- `get_abilities_by_subject(db, subject, grade)`: 获取特定学科年级的能力点。

## 注意事项

1. **数据一致性**: 删除 Unit 前必须检查是否有练习记录关联。
2. **多版本支持**: 同一学科年级可能存在部编版、人教版等，务必核对 `version` 字段。
