---
name: ai-teaching-agent
description: 指导如何开发和优化基于 LangGraph 的 AI 教练工作流。
---

# AI Teaching Agent Skill

本技能提供了开发 K12 AI 助教工作流的设计模式和最佳实践，特别关注基于 LangGraph 的练习生成与反馈。

## 设计理念

### 1. 启发式教学 (Socratic Method)

- **非直接告知**: AI 不应直接给出答案，而是通过提问引导学生思考。
- **脚手架 (Scaffolding)**: 根据学生的错误类型提供分层提示。

### 2. 工作流架构 (LangGraph)

- **State**: 必须包含 `student_id`, `ability_code`, `session_history` 和 `last_interaction`。
- **Nodes**:
  - `validator`: 验证学生输入安全性与相关性。
  - `analyzer`: 分析学生薄弱点。
  - `generator`: 调用 LLM 生成启发式提示或题目。
  - `saver`: 持久化交互记录到数据库。

## 核心实现指南

### 练习生成图 (Practice Generation Graph)

在 `shared.generation.practice.graph.py` 中定义：

- `validate_params`: 检查 `ability_code` 或 `unit_id` 有效性。
- `select_strategy`: 确定题目难度（根据学生最近掌握度）。
- `generate_questions`: 批量生成题目并保存。

### 提示词工程规范

- **Role**: 担任具有 10 年 K12 教学经验的资深教师。
- **Tone**: 亲切、鼓励性质、简洁。
- **Output Format**: 优先使用 JSON 结构化输出以供系统解析。

## 注意事项

1. **防幻觉**: 涉及公式、专有名词时务必通过 RAG 或本体库验证。
2. **多轮上下文**: 确保 `thread_id` 在 LangGraph 检查点中正确持久化。
3. **响应时间**: 关键路径上的 LLM 调用应控制在 5-10s 以内。
