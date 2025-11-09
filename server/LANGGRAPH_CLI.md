# LangGraph CLI 使用指南

## 安装依赖

首先确保已安装 LangGraph CLI：

```bash
cd server
pip install -e .
```

或者使用 uv：

```bash
cd server
uv sync
```

## 配置环境变量

确保 `.env` 文件中包含所有必要的环境变量，特别是：

- `DATABASE_URL`: 数据库连接字符串
- `AI_PLATFORM_KEY`: AI 平台密钥
- `ALIYUN_ACCESS_KEY_ID`: 阿里云访问密钥 ID
- `ALIYUN_ACCESS_KEY_SECRET`: 阿里云访问密钥
- `ALIYUN_OSS_ENDPOINT`: OSS 端点
- `ALIYUN_OSS_BUCKET`: OSS 存储桶
- `ALIYUN_OSS_REGION`: OSS 区域
- `TMP_DIR`: 临时目录路径

## 启动 LangGraph 开发服务器

在 `server` 目录下运行：

```bash
langgraph dev
```

默认情况下，服务器会在以下地址启动：

- **API**: http://localhost:2024
- **文档**: http://localhost:2024/docs
- **LangGraph Studio**: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024

## 自定义端口和主机

```bash
langgraph dev --host 0.0.0.0 --port 8080
```

## 使用隧道（用于 Safari 浏览器）

如果使用 Safari 浏览器，可能需要使用隧道：

```bash
langgraph dev --tunnel
```

## 测试图

启动后，可以通过以下方式测试图：

1. 访问 http://localhost:2024/docs 查看 API 文档
2. 使用 LangGraph Studio 可视化图结构
3. 通过 API 调用图：

```bash
curl -X POST http://localhost:2024/generate_question/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "unit_id": 1,
    "count": 5
  }'
```

## 注意事项

- 图需要数据库连接，确保数据库服务正在运行
- 确保所有环境变量已正确配置
- 如果遇到导入错误，确保已安装所有依赖

