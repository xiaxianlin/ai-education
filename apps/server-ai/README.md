# AI Education AI Service

AI 服务，提供 LLM、图片生成、语音生成、答题分析等 AI 能力。

## 功能特性

- ✅ **LLM 文本生成**: 使用 LangChain 调用大模型生成文本
- ✅ **LLM 结构化输出**: 支持 JSON Schema 的结构化输出
- ✅ **图片生成**: 使用 DashScope 生成教育图片，支持提示词优化
- ✅ **语音生成**: 文本转语音（TTS）
- ✅ **答题分析**: 分析学生答题情况，提供反馈

## 技术栈

- **框架**: FastAPI
- **AI**: LangChain, OpenAI API, DashScope
- **异步**: asyncio
- **日志**: Loguru
- **配置**: Pydantic Settings

## 项目结构

```
apps/server-ai/
├── core/              # 核心模块
│   ├── settings.py   # 配置管理
│   ├── logger.py     # 日志配置
│   └── exception.py  # 异常处理
├── api/              # API 层
│   ├── routes/       # 路由
│   │   ├── llm.py
│   │   ├── image.py
│   │   ├── audio.py
│   │   ├── analysis.py
│   │   └── health.py
│   └── schemas/      # 数据模型
│       ├── llm.py
│       ├── image.py
│       ├── audio.py
│       └── analysis.py
├── services/         # 服务层
│   ├── llm_service.py
│   ├── image_service.py
│   ├── audio_service.py
│   └── analysis_service.py
├── main.py           # 应用入口
├── Dockerfile
└── pyproject.toml
```

## API 接口

### LLM 接口

- `POST /api/v1/llm/generate` - 文本生成
- `POST /api/v1/llm/generate/structured` - 结构化输出

### 图片生成

- `POST /api/v1/image/generate` - 生成图片

### 语音生成

- `POST /api/v1/audio/tts` - 文本转语音

### 答题分析

- `POST /api/v1/analysis/answer` - 分析答题情况

### 健康检查

- `GET /health` - 健康检查

## 启动

```bash
# 开发环境
python main.py

# 生产环境
uvicorn main:app --host 0.0.0.0 --port 7892
```

## 环境变量

```env
RUN_ENV=production
AI_SERVER_HOST=0.0.0.0
AI_SERVER_PORT=7892
AI_PLATFORM_KEY=your_api_key
AI_PLATFORM_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_ENDPOINT=your_oss_endpoint
ALIYUN_OSS_BUCKET=your_oss_bucket
ALIYUN_OSS_REGION=your_oss_region
ALIYUN_WORKSPACE_ID=your_workspace_id
ALIYUN_RAG_INDEX_ID=your_rag_index_id
ALIYUN_RAG_CATEGORY_ID=your_rag_category_id
LOG_DIR=/app/tmp/logs
LOG_TO_FILE=false
```

