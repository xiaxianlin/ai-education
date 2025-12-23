# Cursor 规则说明

本项目使用 Cursor 的新规则系统（`.cursor/rules`），将规则拆分为多个聚焦的规则文件。

## 规则列表

### 1. project-overview
- **类型**: Always Apply
- **描述**: 项目概述和架构信息
- **内容**: Monorepo 结构、技术栈、开发工作流、依赖管理

### 2. react-frontend
- **类型**: Apply to Specific Files
- **范围**: `apps/admin-web/**`, `apps/student-web/**`
- **描述**: React 前端编码规范
- **内容**: TypeScript 规范、组件结构、状态管理、页面编码规范

### 3. python-backend
- **类型**: Apply to Specific Files
- **范围**: `apps/server/**`
- **描述**: Python/FastAPI 后端编码规范
- **内容**: 路由层、服务层、数据库操作、错误处理、任务队列
- **子规则**: 
  - `sqlalchemy-2.0`: SQLAlchemy 2.0 ORM 风格规范（强制要求）

### 4. flutter-mobile
- **类型**: Apply to Specific Files
- **范围**: `apps/student-app/**`
- **描述**: Flutter 移动端编码规范
- **内容**: Dart 规范、Riverpod 状态管理、路由、代码生成

### 5. naming-conventions
- **类型**: Always Apply
- **描述**: 命名规范和文件组织规范
- **内容**: 文件命名、代码命名、目录命名、导入顺序

### 6. api-design
- **类型**: Apply Intelligently
- **描述**: API 设计规范
- **内容**: RESTful 设计、请求响应格式、错误处理、认证授权

### 7. code-review
- **类型**: Apply Intelligently
- **描述**: 代码审查要点
- **内容**: 类型安全、错误处理、代码质量、安全性检查清单

### 8. cursor-rules-update
- **类型**: Always Apply
- **描述**: 更新 Cursor 规则的工作流程说明
- **内容**: 更新规则时需要同步更新的文件和目录清单

## 规则应用方式

- **Always Apply**: 每个聊天会话都会应用
- **Apply to Specific Files**: 当编辑匹配的文件时自动应用
- **Apply Intelligently**: Agent 根据上下文判断是否需要应用
- **Apply Manually**: 在对话中使用 `@rule-name` 手动触发

## 查看和管理规则

在 Cursor 中：
1. 打开 **Cursor Settings → Rules, Commands**
2. 查看所有规则及其状态
3. 可以启用/禁用特定规则

## 迁移说明

旧的 `.cursorrules` 文件仍然支持，但建议迁移到新的规则系统。新规则系统的优势：
- 规则更聚焦、可维护
- 可以根据文件类型自动应用
- 支持规则组合和引用
- 更好的版本控制支持
