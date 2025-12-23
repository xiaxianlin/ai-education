---
description: "更新 Cursor 规则的工作流程说明"
alwaysApply: true
---

# 更新 Cursor 规则

当用户说"更新 cursor 规则"时，需要更新以下内容：

## 需要更新的文件

### 1. `.cursor` 目录下的所有文档
- `.cursor/rules/` 目录下的所有规则文件（`**/RULE.md`）
- `.cursor/commands/` 目录下的所有命令文档（`**/*.md`）
- `.cursor/roles.md` 文件

### 2. 所有 `AGENTS.md` 文件
项目中的 `AGENTS.md` 文件位置：
- 根目录：`AGENTS.md`
- `apps/admin-web/AGENTS.md`
- `apps/server/AGENTS.md`
- `apps/student-app/AGENTS.md`
- `apps/student-web/AGENTS.md`

## 更新原则

1. **代码审查**：确保先审查完全部代码
2. **同步更新**：确保所有相关文档保持一致
3. **版本控制**：更新后应该提交到版本控制系统
4. **完整性**：检查所有文件都已更新，不要遗漏

## 注意事项

- 更新规则时，要考虑对现有代码的影响
- 如果规则涉及代码规范变更，需要评估是否需要重构现有代码
- 更新后建议在相关文档中记录变更历史

