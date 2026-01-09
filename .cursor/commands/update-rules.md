# 更新 Cursor 规则 (@update-rules)

## 概述

执行 `.cursor/rules/cursor-rules-update/RULE.md` 中定义的工作流程，更新所有 Cursor 规则文档和 AGENTS.md 文件，确保它们反映当前代码库的状态。

> **📋 参考规范**: 查看 `.cursor/rules/cursor-rules-update/RULE.md` 获取完整的工作流程说明。

## 更新范围

### 1. `.cursor` 目录下的所有文档

- `.cursor/rules/` 目录下的所有规则文件（`**/RULE.md`）
  - `project-overview/RULE.md`
  - `react-frontend/RULE.md`
  - `python-backend/RULE.md`
  - `naming-conventions/RULE.md`
  - `api-design/RULE.md`
  - `code-review/RULE.md`
  - `cursor-rules-update/RULE.md`
- `.cursor/commands/` 目录下的所有命令文档（`**/*.md`）
  - `frontend.md`
  - `backend.md`
  - `ui-designer.md`
  - `auth.md`
  - `cr.md`
  - `new-feature.md`
  - `pr.md`
  - `push.md`
  - `test-fix.md`
  - `api.md`
  - `update-rules.md`（本文件）
- `.cursor/roles.md` 文件

### 2. 所有 `AGENTS.md` 文件

项目中的 `AGENTS.md` 文件位置：
- 根目录：`AGENTS.md`
- `apps/admin-web/AGENTS.md`
- `apps/server/AGENTS.md`
- `apps/student-web/AGENTS.md`

## 执行步骤

### 阶段 1: 代码审查

在更新文档之前，先全面审查代码库：

1. **审查代码变更**
   - 检查最近的代码提交和变更
   - 识别新增的功能、模块或架构变更
   - 识别已废弃的功能或模式

2. **识别需要更新的规则**
   - 检查代码规范是否与规则文档一致
   - 识别新的编码模式或最佳实践
   - 识别需要新增或修改的规则

3. **检查文档一致性**
   - 对比代码实现与文档描述
   - 识别文档中的过时信息
   - 识别缺失的文档内容

### 阶段 2: 文档更新

根据代码审查结果，同步更新所有相关文档：

1. **更新规则文件** (`.cursor/rules/**/RULE.md`)
   - 更新项目概述和架构信息
   - 更新编码规范和最佳实践
   - 更新命名规范和文件组织规范
   - 更新 API 设计规范
   - 更新代码审查要点

2. **更新命令文档** (`.cursor/commands/**/*.md`)
   - 确保命令描述与当前实现一致
   - 更新命令中的示例代码和模式
   - 更新技术栈和依赖信息

3. **更新角色文档** (`.cursor/roles.md`)
   - 更新角色切换指南
   - 更新项目结构描述
   - 更新常用命令和快速参考

4. **更新 AGENTS.md 文件**
  - 更新根目录 `AGENTS.md`：项目概述、技术栈、快速命令
  - 更新 `apps/admin-web/AGENTS.md`：管理端特定信息
  - 更新 `apps/server/AGENTS.md`：服务端特定信息
  - 更新 `apps/student-web/AGENTS.md`：学生端 Web 特定信息

### 阶段 3: 完整性检查

验证所有文件都已更新，无遗漏：

1. **文件清单检查**
   - 确认所有规则文件都已检查/更新
   - 确认所有命令文档都已检查/更新
   - 确认 `roles.md` 已更新
   - 确认所有 `AGENTS.md` 文件都已更新

2. **内容一致性检查**
   - 确保技术栈信息在所有文档中一致
   - 确保项目结构描述一致
   - 确保命令和脚本路径正确
   - 确保编码规范描述一致

3. **版本控制**
   - 更新后提交到版本控制系统
   - 添加有意义的提交信息
   - 如有必要，记录变更历史

## 更新原则

1. **代码审查优先**：确保先审查完全部代码，再更新文档
2. **同步更新**：确保所有相关文档保持一致
3. **版本控制**：更新后应该提交到版本控制系统
4. **完整性**：检查所有文件都已更新，不要遗漏

## 检查清单

### 代码审查
- [ ] 已审查最近的代码变更
- [ ] 已识别需要更新的规则和文档
- [ ] 已检查代码与文档的一致性

### 规则文件更新
- [ ] `.cursor/rules/project-overview/RULE.md`
- [ ] `.cursor/rules/react-frontend/RULE.md`
- [ ] `.cursor/rules/python-backend/RULE.md`
- [ ] `.cursor/rules/naming-conventions/RULE.md`
- [ ] `.cursor/rules/api-design/RULE.md`
- [ ] `.cursor/rules/code-review/RULE.md`
- [ ] `.cursor/rules/cursor-rules-update/RULE.md`

### 命令文档更新
- [ ] `.cursor/commands/frontend.md`
- [ ] `.cursor/commands/backend.md`
- [ ] `.cursor/commands/ui-designer.md`
- [ ] `.cursor/commands/auth.md`
- [ ] `.cursor/commands/cr.md`
- [ ] `.cursor/commands/new-feature.md`
- [ ] `.cursor/commands/pr.md`
- [ ] `.cursor/commands/push.md`
- [ ] `.cursor/commands/test-fix.md`
- [ ] `.cursor/commands/api.md`
- [ ] `.cursor/commands/update-rules.md`

### 角色和代理文档更新
- [ ] `.cursor/roles.md`
- [ ] `AGENTS.md`（根目录）
- [ ] `apps/admin-web/AGENTS.md`
- [ ] `apps/server/AGENTS.md`
- [ ] `apps/student-web/AGENTS.md`

### 完整性验证
- [ ] 所有文件都已检查/更新
- [ ] 技术栈信息在所有文档中一致
- [ ] 项目结构描述一致
- [ ] 命令和脚本路径正确
- [ ] 编码规范描述一致
- [ ] 已提交到版本控制系统

## 注意事项

- **影响评估**：更新规则时，要考虑对现有代码的影响
- **重构评估**：如果规则涉及代码规范变更，需要评估是否需要重构现有代码
- **变更记录**：更新后建议在相关文档中记录变更历史
- **测试验证**：更新后验证规则是否正确应用

## 相关规则

- `@cursor-rules-update` - 更新 Cursor 规则的工作流程说明（自动应用）

