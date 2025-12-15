---
name: prompt-module-lite
overview: Implement prompt CRUD+versioning, template preview/test, and basic metrics (call/success/latency) for admin-web + FastAPI backend.
todos:
  - id: backend-models-routes
    content: 后端模型/schema/路由实现 CRUD+publish/test+metrics
    status: completed
  - id: backend-tests
    content: 编写后端接口与模型基础测试
    status: completed
    dependencies:
      - backend-models-routes
  - id: frontend-pages
    content: 前端 Prompt 列表/详情/版本编辑/调试/指标页面
    status: completed
  - id: frontend-api
    content: 前端 API 封装调用后台接口
    status: completed
    dependencies:
      - backend-models-routes
  - id: qa-docs
    content: 自测关键路径并补充使用说明
    status: completed
    dependencies:
      - frontend-pages
      - frontend-api
      - backend-tests
---

# Prompt 管理模块落地计划

## 范围

- 后端（FastAPI + SQLAlchemy）：Prompt/PromptVersion CRUD、发布/回滚、测试沙箱接口、基础指标接口。
- 前端（admin-web, AntD）：列表、详情（版本、编辑、预览/调试）、指标展示。

## 主要改动

- Backend: `apps/server`（假设）下新增 prompt 路由、schemas、service、repo、models。
- Frontend: `apps/admin-web/src/pages/Prompt/` 目录新增 List/Detail/Version 编辑、调试、指标页面；复用 AntD Form、Table、Monaco/CodeMirror；新增 API 封装。

## 实施步骤

1) 后端数据与接口

- 定义 SQLAlchemy 模型：Prompt、PromptVersion、PromptTestRecord（含 model_provider/model_name）、枚举与基础索引。
- 定义 Pydantic schema：create/update/publish/test 请求与响应。
- 路由：CRUD、publish/archive、test、metrics（调用量/成功率/耗时）。
- Service/Repo：分层实现逻辑；渲染模板、校验必填变量、记录测试结果。
- 基础单元测试：模型与路由 happy-path。

2) 前端页面与数据层

- API 封装：prompt list/detail/version CRUD/publish/test/metrics。
- 页面：`pages/Prompt/List`（筛选+表格）、`pages/Prompt/Detail`（Tabs: 基础信息 | 版本 | 调试 | 指标）。
- 版本编辑：表单（schema/params/timeout/changelog）+ 模板编辑器 + 预览（变量填充校验）。
- 调试沙箱：填写变量+模型信息 → 调用测试接口 → 展示响应/耗时。
- 指标：折线/统计卡片显示调用量、成功率、P95。

3) 发布/回滚与状态管理

- 列表/详情操作：发布版本设 current_version；回滚到指定版本；状态展示 draft/published/archived。
- 交互防呆：发布/回滚二次确认；缺必填变量阻断预览/测试。

4) 验证与文档

- 后端接口自测（fastapi TestClient）；前端页面自测（关键流：创建→编辑→预览→测试→发布→回滚）。
- 简要使用说明：字段含义、测试接口入参示例。