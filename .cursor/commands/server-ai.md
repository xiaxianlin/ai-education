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
  - `routes/` - 路由定义
    - `question.py` - 题目相关路由
    - `practice.py` - 练习相关路由
    - `textbook.py` - 教材相关路由
  - `services/` - 服务层
    - `analysis.py` - 答题分析服务
    - `audio.py` - 语音生成服务
    - `image.py` - 图片生成服务
    - `textbook.py` - 教材解析服务
  - `question/` - 题目生成工作流
    - `graph.py` - LangGraph 工作流定义
    - `services/` - 题目生成相关服务
      - `llm.py` - LLM 调用服务
      - `recall.py` - 资源召回服务
      - `resource.py` - 资源处理服务
      - `storage.py` - 存储服务
      - `unit_practice.py` - 单元练习生成
      - `daily_practice.py` - 每日练习生成
      - `assessment.py` - 评估测试生成
    - `prompts/` - Prompt 模板
    - `types.py` - 类型定义
  - `utils/` - 工具模块
    - `llm.py` - LLM 客户端工具
    - `oss.py` - OSS 上传工具
    - `rag.py` - RAG 检索工具
    - `prompt.py` - Prompt 工具
    - `question.py` - 题目工具
    - `time.py` - 时间工具
  - `core/` - 核心模块
    - `settings.py` - 配置管理
    - `logger.py` - 日志配置
    - `exception.py` - 异常处理
    - `database.py` - 数据库连接
    - `schema.py` - 数据模型定义
    - `constants.py` - 常量定义

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
- 支持文本答案分析和音频答案分析
- 支持练习报告分析

### 题目生成工作流
- 使用 LangGraph 构建复杂工作流
- 支持多种生成类型：
  - 单元练习 (unit_practice)
  - 每日练习 (daily_practice)
  - 评估测试 (assessment)
- 包含资源召回、LLM 生成、存储等步骤
- 支持为题目生成图片和语音资源

### 教材解析
- 解析教材文件，提取单元信息
- 支持上传教材到 RAG 知识库
- 使用阿里云百炼 RAG 服务

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
from utils.llm import get_chat_client
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

llm = get_chat_client(model_name="qwen3-max-preview", temperature=0.7)
prompt = ChatPromptTemplate.from_template("...")
parser = JsonOutputParser(pydantic_object=SomeSchema)

chain = prompt | llm | parser
result = await chain.ainvoke({"key": "value"})
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
from services.image import generate_image

image_url = generate_image(question)
# 或直接使用提示词
image_url = generate_image_with_prompt("教育场景描述")
```

### 语音生成
```python
from services.audio import generate_audio

audio_url = generate_audio(text="要转换的文本")
```

## API 接口

### 题目相关 (`/api/question`)
- `POST /api/question/generate` - 生成题目（使用 LangGraph 工作流）
- `POST /api/question/{id}/image_generate` - 为指定题目生成图片
- `POST /api/question/{id}/audio_generate` - 为指定题目生成语音
- `POST /api/question/{id}/audio_answer_analysis` - 分析题目音频答案
- `POST /api/question/{id}/text_answer_analysis` - 分析题目文本答案

### 练习相关 (`/api/practice`)
- `POST /api/practice/{id}/report` - 分析练习报告

### 教材相关 (`/api/textbook`)
- `POST /api/textbook/{file_index_id}/parse` - 解析教材文件
- `POST /api/textbook/upload` - 上传教材文件到 RAG 知识库

### 根路径
- `GET /` - 服务信息

## 注意事项

- 使用 LangGraph 构建工作流时，确保节点函数是纯函数或异步函数
- LLM 调用可能较慢，注意超时设置和错误处理
- 图片和语音文件需要上传到 OSS，注意文件大小限制
- Prompt 模板应该清晰明确，便于调试和优化
- 使用 Loguru 记录关键步骤，便于问题排查
- 工作流状态管理要清晰，避免状态污染
- 考虑 AI 调用的成本和限流
- 异步操作要正确处理异常和超时
- 数据库操作使用 SQLAlchemy 2.0 异步 ORM，注意会话管理
- 路由前缀为 `/api/`，不是 `/api/v1/`
- 题目生成工作流支持多种类型，需要根据类型选择对应的服务
- 教材解析依赖阿里云百炼 RAG 服务，需要配置相关环境变量

## 环境变量

```env
# 运行环境
RUN_ENV=development
AI_SERVER_HOST=0.0.0.0
AI_SERVER_PORT=7892

# AI 配置
AI_PLATFORM=dashscope
AI_PLATFORM_KEY=your_api_key
AI_PLATFORM_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_TTS_VOICE=Cherry

# 数据库配置
DATABASE_URL=mysql+asyncmy://user:password@host:port/database
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
DATABASE_POOL_TIMEOUT=30

# 阿里云配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_ENDPOINT=your_oss_endpoint
ALIYUN_OSS_BUCKET=your_oss_bucket
ALIYUN_OSS_REGION=your_oss_region
ALIYUN_WORKSPACE_ID=your_workspace_id
ALIYUN_RAG_INDEX_ID=your_rag_index_id
ALIYUN_RAG_CATEGORY_ID=your_rag_category_id

# 目录配置
TMP_DIR=tmp
LOG_DIR=tmp/logs
```

## 开发命令

```bash
# 启动开发服务器
cd apps/server-ai
uvicorn main:app --reload --host 0.0.0.0 --port 7892

# 或使用根目录命令
pnpm dev:server-ai
```

