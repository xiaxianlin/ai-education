# AI 服务开发模式 (@server-ai)

我现在专注于**AI 服务 (server-ai)** 的开发工作。

## 服务概述

AI 服务是独立的 AI 能力服务，提供 LLM 文本生成、图片生成、语音生成、答题分析、题目生成工作流等 AI 功能。

## 技术栈

- **框架**: FastAPI 0.115+
- **语言**: Python 3.12
- **AI 框架**: LangChain, LangGraph
- **AI 平台**: 阿里云百炼AI (DashScope SDK), OpenAI API
- **数据库**: MySQL (SQLAlchemy 2.0 异步 ORM，用于题目生成)
- **对象存储**: 阿里云 OSS
- **日志**: Loguru
- **配置**: Pydantic Settings
- **异步运行时**: Uvicorn
- **端口**: 7892

## 工作目录

- `apps/server-ai/` - AI 服务源代码
  - `api/` - API 层
    - `routes/` - 路由定义
    - `schemas/` - 请求/响应模型
  - `services/` - 服务层（LLM、图片、语音、分析服务）
  - `question/` - 题目生成工作流
    - `graph.py` - LangGraph 工作流定义
    - `services/` - 题目生成相关服务
    - `prompts/` - Prompt 模板
  - `core/` - 核心模块（配置、日志、异常处理）

## 功能模块

### LLM 文本生成
- 使用 LangChain 调用大模型
- 支持文本生成和结构化输出（JSON Schema）
- 支持多种模型（qwen3-max 等）

### 图片生成
- 使用 DashScope 生成教育图片
- 支持提示词优化
- 图片上传到阿里云 OSS

### 语音生成
- 文本转语音（TTS）
- 支持多种语音参数配置
- 音频文件上传到阿里云 OSS

### 答题分析
- 分析学生答题情况
- 提供详细的反馈和建议
- 使用 LLM 进行智能分析

### 题目生成工作流
- 使用 LangGraph 构建复杂工作流
- 支持多种生成类型：
  - 单元练习
  - 教材练习
  - 每日练习
  - 单元测试
  - 评估测试
- 包含资源召回、LLM 生成、存储等步骤

## 开发原则

1. **工作流设计**: 使用 LangGraph 构建可复用的 AI 工作流
2. **异步优先**: 使用 `async/await` 处理异步操作
3. **类型安全**: 使用 Pydantic 进行数据验证
4. **错误处理**: 统一的异常处理机制
5. **日志记录**: 使用 Loguru 记录详细的执行日志
6. **Prompt 管理**: 将 Prompt 模板独立管理，便于优化

## 常用模式

### LLM 调用
```python
from services.llm_service import LLMService
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

prompt = ChatPromptTemplate.from_template("...")
parser = JsonOutputParser(pydantic_object=SomeSchema)

result = await LLMService.call_llm(
    prompt=prompt,
    prompt_input={"key": "value"},
    parser=parser,
    model_name="qwen3-max"
)
```

### 工作流节点定义
```python
from langgraph.graph import StateGraph
from question.types import QuestionGenerationState

def some_node(state: QuestionGenerationState) -> Dict[str, Any]:
    """节点处理逻辑"""
    logger.info("处理节点")
    # 处理逻辑
    return {"result": "data"}

# 构建图
graph = StateGraph(QuestionGenerationState)
graph.add_node("some_node", some_node)
graph.add_edge("some_node", "next_node")
```

### 图片生成
```python
from services.image_service import ImageService

image_url = await ImageService.generate_image(
    prompt="教育场景描述",
    style="realistic"
)
```

### 语音生成
```python
from services.audio_service import AudioService

audio_url = await AudioService.text_to_speech(
    text="要转换的文本",
    voice="zhitian_emo"
)
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

### 题目生成
- `POST /api/v1/question/generate` - 生成题目（使用 LangGraph 工作流）

### 健康检查
- `GET /health` - 健康检查

## 注意事项

- 使用 LangGraph 构建工作流时，确保节点函数是纯函数或异步函数
- LLM 调用可能较慢，注意超时设置和错误处理
- 图片和语音文件需要上传到 OSS，注意文件大小限制
- Prompt 模板应该清晰明确，便于调试和优化
- 使用 Loguru 记录关键步骤，便于问题排查
- 工作流状态管理要清晰，避免状态污染
- 考虑 AI 调用的成本和限流
- 异步操作要正确处理异常和超时

## 环境变量

```env
AI_PLATFORM_KEY=your_api_key
AI_PLATFORM_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_ENDPOINT=your_oss_endpoint
ALIYUN_OSS_BUCKET=your_oss_bucket
ALIYUN_OSS_REGION=your_oss_region
LOG_DIR=/app/tmp/logs
```

## 开发命令

```bash
# 启动开发服务器
cd apps/server-ai
uvicorn main:app --reload --host 0.0.0.0 --port 7892

# 或使用根目录命令
pnpm dev:server-ai
```

