# Prompt 管理模块使用说明（MVP）

## 后端接口（/api/admin）
- `GET /prompt`：列表，支持 keyword/category/status/tag。
- `POST /prompt`：创建 Prompt（含 v1 草稿）。
- `GET /prompt/{id}`：详情（含 current_version）。
- `PATCH /prompt/{id}`：更新基础信息。
- `POST /prompt/{id}/versions`：创建新版本。
- `GET /prompt/{id}/versions`：版本列表。
- `POST /prompt/{id}/versions/{vid}/publish`：发布并切换 current_version。
- `POST /prompt/{id}/versions/{vid}/archive`：下线版本（若为当前则清空 current_version）。
- `POST /prompt/{id}/versions/{vid}/test`：测试渲染+下游调用（暂为回显）。
- `GET /prompt/{id}/metrics`：调用量/成功率/P95。

提示：接口需管理员鉴权（`x-access-token`）。

## 前端（admin-web）
- 菜单：题目 > Prompt 管理。
- 列表：名称/slug/分类/状态/当前版本，支持搜索。
- 详情：
  - 基础信息：编辑 name/slug/category/tags/description。
  - 版本：查看/创建版本，发布、下线。
  - 调试：填变量 JSON + 模型信息，查看渲染结果与响应。
  - 指标：调用量、成功率、P95。
- 创建：从列表「新建 Prompt」进入，需填写基础信息与模板后提交。

## 模型字段要点
- Prompt：name/slug/category/description/tags/status(current_version)。
- PromptVersion：version_no、template、system_prompt、negative_prompt、input_schema、sampling_params、timeout_ms、changelog、is_published。
- PromptTestRecord：model_provider、model_name、input_payload、rendered_prompt、response_snapshot、latency_ms、status、error。

## 变量与模板校验
- 占位符使用 `{variable}`（基于 Python `str.format`）。
- `input_schema.required` 缺失将直接报错阻断测试/渲染。

## 后续可迭代
- 接入真实模型服务替换测试回显。
- 版本 Diff、富文本编辑器、趋势图指标。
- 更细的权限与灰度发布。

