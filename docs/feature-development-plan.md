# 小学生 AI 练习系统 — 详细开发计划（索引）

> **版本**: v2.0 | **更新日期**: 2026-06-12 | **维护者**: 架构组
> **关联文档**: [项目设计](./project-design.md) | [开发规范](./development-standards.md)

---

## 计划总览

```
Phase 1 基础能力完善 (当前)  ──→  Phase 2 智能化升级  ──→  Phase 3 规模化
    预计 8-10 周                     预计 8-10 周               预计 10+ 周
```

---

## 状态标记

| 标记 | 含义 |
|------|------|
| ✅ | 已完成，无需操作 |
| 🔧 | 开发中 / 部分完成 |
| 📋 | 待开发，有详细实施规格 |
| ⏸️ | 暂缓 |

---

## Phase 1 — 详细实施文档索引

### 1.1 核心练习流程

| # | 功能 | 状态 | 优先级 | 工期 | 详细实施文档 |
|---|------|------|--------|------|-------------|
| P1-01 | 能力练习基础流程 | ✅ | P0 | — | — |
| P1-02 | 单元练习基础流程 | ✅ | P0 | — | — |
| P1-03 | AI 题目生成 (Gemini) | ✅ | P0 | — | — |
| P1-04 | 客观题自动评判 | ✅ | P0 | — | — |
| **P1-05** | **主观题 AI 评判** | 📋 | P1 | 3d | [📖 实施规格](./impl/phase1-P1-05-subjective-evaluation.md) |
| **P1-06** | **练习报告 AI 生成与展示** | ✅ | P0 | 2d | [📖 实施规格](./impl/phase1-P1-06-report-generation.md) |
| **P1-07** | **Redis 队列正式对接** | ✅ | P1 | 3d | [📖 实施规格](./impl/phase1-P1-07-redis-queue.md) |
| **P1-08** | **练习生成失败重试** | 📋 | P2 | 1d | [📖 实施规格](./impl/phase1-P1-08-retry-mechanism.md) |
| **P1-09** | **练习废弃状态处理** | 📋 | P2 | 1d | [📖 实施规格](./impl/phase1-P1-09-abandoned-status.md) |

### 1.2 掌握度与自适应

| # | 功能 | 状态 | 优先级 | 工期 | 详细实施文档 |
|---|------|------|--------|------|-------------|
| P1-10 | 掌握度基础追踪 | ✅ | P0 | — | — |
| **P1-11** | **掌握度自动更新** | ✅ | P0 | 2d | [📖 实施规格](./impl/phase1-P1-11-mastery-update.md) |
| **P1-12** | **薄弱能力点展示** | 📋 | P1 | 2d | [📖 实施规格](./impl/phase1-P1-12-weak-ability.md) |
| **P1-13** | **基础难度调整** | 📋 | P2 | 2d | [📖 实施规格](./impl/phase1-P1-13-difficulty-adjust.md) |

### 1.3 管理端补全

| # | 功能 | 状态 | 优先级 | 工期 | 详细实施文档 |
|---|------|------|--------|------|-------------|
| P1-14 | 能力点 CRUD + 导入导出 | ✅ | P0 | — | — |
| P1-15 | 教材与单元管理 | ✅ | P0 | — | — |
| P1-16 | 学生管理 | ✅ | P0 | — | — |
| P1-17 | 教师管理 | ✅ | P0 | — | — |
| P1-18 | 题型管理 | ✅ | P1 | — | — |
| **P1-19** | **题目管理完善** | 🔧 | P1 | 2d | [📖 实施规格](./impl/phase1-P1-19-question-management.md) |
| **P1-20** | **学生练习数据查看** | 📋 | P1 | 2d | [📖 实施规格](./impl/phase1-P1-20-student-data-view.md) |
| P1-21 | 管理员账号管理 | ✅ | P1 | — | — |

### 1.4 移动端基础

| # | 功能 | 状态 | 优先级 | 工期 | 详细实施文档 |
|---|------|------|--------|------|-------------|
| **P1-22** | **移动端登录** | 🔧 | P1 | 1d | [📖 实施规格](./impl/phase1-P1-22-to-P1-26-mobile.md#p1-22) |
| **P1-23** | **移动端能力练习** | 📋 | P1 | 3d | [📖 实施规格](./impl/phase1-P1-22-to-P1-26-mobile.md#p1-23) |
| **P1-24** | **移动端答题界面** | 📋 | P1 | 3d | [📖 实施规格](./impl/phase1-P1-22-to-P1-26-mobile.md#p1-24) |
| **P1-25** | **移动端练习记录** | 📋 | P2 | 2d | [📖 实施规格](./impl/phase1-P1-22-to-P1-26-mobile.md#p1-25) |
| **P1-26** | **移动端个人中心** | 📋 | P2 | 1d | [📖 实施规格](./impl/phase1-P1-22-to-P1-26-mobile.md#p1-26) |

### 1.5 质量保障

| # | 功能 | 状态 | 优先级 | 工期 | 详细实施文档 |
|---|------|------|--------|------|-------------|
| **P1-27** | **后端集成测试覆盖** | 🔧 | P1 | 持续 | [📖 实施规格](./impl/phase1-P1-27-to-P1-29-quality.md#p1-27) |
| **P1-28** | **API 契约测试** | 📋 | P2 | 2d | [📖 实施规格](./impl/phase1-P1-27-to-P1-29-quality.md#p1-28) |
| **P1-29** | **错误处理规范化** | 📋 | P2 | 1d | [📖 实施规格](./impl/phase1-P1-27-to-P1-29-quality.md#p1-29) |

---

## Phase 2 — 智能化升级

| # | 功能 | 优先级 | 工期 | 详细实施文档 |
|---|------|--------|------|-------------|
| P2-01 | 自适应难度算法 (ELO) | P0 | 5d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-01) |
| P2-02 | 错题本 | P0 | 5d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-02) |
| P2-03 | 薄弱项专项练习 | P0 | 3d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-03) |
| P2-04 | 学习路径推荐 | P1 | 5d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-04) |
| P2-05 | 练习报告对比分析 | P1 | 3d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-05) |
| P2-06 | 图片题目支持 | P1 | 3d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-06) |
| P2-07 | 音频题目支持 | P1 | 3d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-07) |
| P2-08 | 排序题 UI | P2 | 2d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-08) |
| P2-09 | 匹配题 UI | P2 | 2d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-09) |
| P2-10 | 能力点知识图谱 | P1 | 5d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-10) |
| P2-11 | RAG 知识库检索 | P2 | 5d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-11) |
| P2-12 | Prompt 版本管理 | P2 | 2d | [📖 概要](./impl/phase2-intelligent-upgrade.md#p2-12) |

---

## Phase 3 — 规模化

| # | 功能 | 优先级 | 工期 | 详细实施文档 |
|---|------|--------|------|-------------|
| P3-01 | 机构/学校管理 | P0 | 5d | [📖 概要](./impl/phase3-scale.md#p3-01) |
| P3-02 | 教师班级管理 | P0 | 3d | [📖 概要](./impl/phase3-scale.md#p3-02) |
| P3-03 | RBAC 权限体系 | P0 | 5d | [📖 概要](./impl/phase3-scale.md#p3-03) |
| P3-04 | 教学数据大屏 | P0 | 5d | [📖 概要](./impl/phase3-scale.md#p3-04) |
| P3-05 | 学生成长档案 | P1 | 5d | [📖 概要](./impl/phase3-scale.md#p3-05) |
| P3-06 | 教师教学建议 | P2 | 5d | [📖 概要](./impl/phase3-scale.md#p3-06) |
| P3-07 | 家长端 | P1 | 10d | [📖 概要](./impl/phase3-scale.md#p3-07) |
| P3-08 | 离线练习支持 | P2 | 5d | [📖 概要](./impl/phase3-scale.md#p3-08) |
| P3-09 | 性能优化 | P1 | 5d | [📖 概要](./impl/phase3-scale.md#p3-09) |

---

## 建议执行顺序 (Phase 1)

```
Week 1-2: P1-07 (Redis队列) → P1-05 (主观题评判) → P1-06 (报告完善)
Week 3-4: P1-11 (掌握度联动) → P1-12 (薄弱项展示) → P1-19 (题目管理)
Week 5-6: P1-22~P1-24 (移动端核心) → P1-20 (管理端数据查看)
Week 7-8: P1-13 (基础难度) → P1-08/P1-09 (异常处理) → P1-25/P1-26 (移动端补全)
```

---

## 工期汇总

| 阶段 | 功能数 | 已完成 | 待开发 | 预估总工期 |
|------|--------|--------|--------|------------|
| **Phase 1** | 29 | 9 | 20 | ~8-10 周（移动端占10天+核心功能） |
| **Phase 2** | 12 | 0 | 12 | ~8-10 周 |
| **Phase 3** | 9 | 0 | 9 | ~10+ 周 |

---

## 文档结构

```
docs/
├── project-design.md           # 项目设计文档 (系统架构、模块设计、数据模型)
├── development-standards.md    # 开发规范 (编码、API、数据库、前端、AI)
├── feature-development-plan.md # 本文件 — 开发计划索引
└── impl/                       # 详细实施规格 (每功能一份)
    ├── phase1-P1-05-subjective-evaluation.md
    ├── phase1-P1-06-report-generation.md
    ├── phase1-P1-07-redis-queue.md
    ├── phase1-P1-08-retry-mechanism.md
    ├── phase1-P1-09-abandoned-status.md
    ├── phase1-P1-11-mastery-update.md
    ├── phase1-P1-12-weak-ability.md
    ├── phase1-P1-13-difficulty-adjust.md
    ├── phase1-P1-19-question-management.md
    ├── phase1-P1-20-student-data-view.md
    ├── phase1-P1-22-to-P1-26-mobile.md
    ├── phase1-P1-27-to-P1-29-quality.md
    ├── phase2-intelligent-upgrade.md
    └── phase3-scale.md
```
