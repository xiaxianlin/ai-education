# 三服务 HTTP 通信架构方案

## 目录

- [架构概述](#架构概述)
- [服务职责](#服务职责)
- [通信架构](#通信架构)
- [API 接口设计](#api-接口设计)
- [代码实现](#代码实现)
- [配置说明](#配置说明)
- [部署指南](#部署指南)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

---

## 架构概述

### 服务架构图

```
┌─────────────────────────────────────────────────────────┐
│                        客户端层                           │
│              (Web前端、移动端、第三方系统)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP REST API
                     │
         ┌───────────▼───────────┐
         │     server-api         │
         │   (业务 API 服务)       │
         │   Port: 7890          │
         │                       │
         │ - 业务逻辑处理         │
         │ - 数据验证            │
         │ - 权限控制            │
         │ - 数据库操作          │
         └───────┬───────┬───────┘
                 │       │
                 │       │ HTTP REST API
                 │       │ (同步调用)
                 │       │
    HTTP REST    │       │
    (任务提交)    │       │
                 │       │
         ┌───────▼───────▼───────┐
         │     server-task       │
         │   (任务处理服务)       │
         │   Port: 7891          │
         │                       │
         │ - 异步任务处理         │
         │ - 任务队列管理         │
         │ - Worker 调度         │
         └───────┬───────────────┘
                 │
                 │ HTTP REST API
                 │ (AI 能力调用)
                 │
         ┌───────▼───────────────┐
         │      server-ai        │
         │    (AI 服务)           │
         │    Port: 7892         │
         │                       │
         │ - LLM 调用            │
         │ - 图片生成            │
         │ - 音频生成            │
         │ - 答题分析            │
         └───────────────────────┘

共享资源：
├── MySQL (数据库)
├── Redis (任务队列、缓存)
└── OSS (对象存储)
```

### 通信流程

#### 场景 1：题目生成（异步任务）

```
1. Client → server-api: POST /api/admin/textbook/{id}/generate
2. server-api 验证请求，创建任务记录
3. server-api → server-task: POST /api/task/submit
   {
     "task_id": "uuid",
     "task_type": "question_generation",
     "payload": {
       "type": "textbook",
       "textbook_id": 1,
       "count": 30
     }
   }
4. server-api → Client: { "task_id": "...", "status": "pending" }
5. server-task Worker 处理任务:
   a. server-task → server-ai: POST /api/v1/llm/generate/structured
   b. server-ai → AI Platform: 调用 LLM API
   c. server-ai → server-task: 返回生成的题目数据
   d. server-task 保存题目到数据库
6. Client → server-api: GET /api/admin/task/{task_id}/status
7. server-api → server-task: GET /api/task/{task_id}
8. server-task → server-api: 返回任务状态和结果
9. server-api → Client: 返回任务结果
```

#### 场景 2：答题分析（同步调用）

```
1. Client → server-api: POST /api/student/answer
2. server-api → server-ai: POST /api/v1/analysis/answer
   {
     "content": "题目内容",
     "options": "选项",
     "knowledge": "知识点",
     "question_answer": "正确答案",
     "student_answer": "学生答案"
   }
3. server-ai → AI Platform: 调用 LLM 分析
4. server-ai → server-api: 返回分析结果
   {
     "is_correct": true,
     "analysis": "分析内容"
   }
5. server-api 保存结果到数据库
6. server-api → Client: 返回分析结果
```

---

## 服务职责

### server-api（业务 API 服务）

**职责：**
- 处理业务逻辑和业务规则
- 数据验证和权限控制
- 数据库 CRUD 操作
- 对外提供 RESTful API
- 任务提交和状态查询

**主要功能：**
- 用户认证和授权
- 教材、单元、知识点管理
- 题目管理
- 学生练习管理
- 任务提交和查询

**技术栈：**
- FastAPI
- SQLAlchemy (异步)
- Pydantic
- JWT 认证

### server-task（任务处理服务）

**职责：**
- 异步任务处理
- 任务队列管理（RQ）
- Worker 调度和执行
- 任务状态跟踪

**主要功能：**
- 题目生成任务
- 图片生成任务
- 音频生成任务
- 答题分析任务

**技术栈：**
- FastAPI
- RQ (Redis Queue)
- asyncio

### server-ai（AI 服务）

**职责：**
- AI 能力封装
- LLM 调用
- 图片生成
- 音频生成（TTS/ASR）
- 内容分析

**主要功能：**
- 文本生成（LLM）
- 结构化输出
- 图片生成
- 文本转语音（TTS）
- 语音识别（ASR）
- 音频理解
- 答题分析

**技术栈：**
- FastAPI
- LangChain
- DashScope SDK
- OpenAI API

---

## 通信架构

### 通信方式

所有服务间通信均使用 **HTTP REST API**，基于 JSON 格式。

### 通信路径

| 通信路径 | 协议 | 用途 | 调用频率 |
|---------|------|------|---------|
| server-api → server-task | HTTP REST | 任务提交、状态查询 | 中等 |
| server-task → server-ai | HTTP REST | AI 能力调用 | 高 |
| server-api → server-ai | HTTP REST | 同步 AI 调用（可选） | 低 |

### 网络配置

```yaml
# docker-compose.yml
networks:
  ai-education-network:
    driver: bridge

services:
  server-api:
    networks:
      - ai-education-network
    # 可通过服务名访问其他服务
    # server-task:7891
    # server-ai:7892
  
  server-task:
    networks:
      - ai-education-network
  
  server-ai:
    networks:
      - ai-education-network
```

---

## API 接口设计

### server-api → server-task

#### 1. 提交任务

```http
POST /api/task/submit
Content-Type: application/json

{
  "task_id": "uuid-string",
  "task_type": "question_generation",
  "payload": {
    "type": "textbook",
    "textbook_id": 1,
    "count": 30
  },
  "priority": 0,
  "timeout": 600
}
```

**响应：**
```json
{
  "task_id": "uuid-string",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 2. 查询任务状态

```http
GET /api/task/{task_id}
```

**响应：**
```json
{
  "task_id": "uuid-string",
  "status": "completed",
  "result": {
    "question_ids": [1, 2, 3],
    "count": 3
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:01:00Z",
  "processing_time": 60.5
}
```

**任务状态：**
- `pending`: 待处理
- `processing`: 处理中
- `completed`: 已完成
- `failed`: 失败
- `cancelled`: 已取消

#### 3. 取消任务

```http
POST /api/task/{task_id}/cancel
```

### server-task → server-ai

#### 1. LLM 文本生成

```http
POST /api/v1/llm/generate
Content-Type: application/json

{
  "prompt": "生成一道数学题",
  "model": "qwen3-max",
  "temperature": 0.7,
  "max_tokens": 2000
}
```

**响应：**
```json
{
  "content": "生成的文本内容",
  "model": "qwen3-max",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200,
    "total_tokens": 300
  }
}
```

#### 2. LLM 结构化输出

```http
POST /api/v1/llm/generate/structured
Content-Type: application/json

{
  "prompt": "生成题目",
  "schema": {
    "type": "object",
    "properties": {
      "questions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "content": {"type": "string"},
            "answer": {"type": "string"}
          }
        }
      }
    }
  },
  "model": "qwen3-max"
}
```

**响应：**
```json
{
  "result": {
    "questions": [
      {
        "content": "题目内容",
        "answer": "答案"
      }
    ]
  }
}
```

#### 3. 图片生成

```http
POST /api/v1/image/generate
Content-Type: application/json

{
  "text": "一只可爱的小猫",
  "width": 1328,
  "height": 1328,
  "optimize_prompt": true
}
```

**响应：**
```json
{
  "image_url": "https://example.com/image.jpg"
}
```

#### 4. 文本转语音（TTS）

```http
POST /api/v1/audio/tts
Content-Type: application/json

{
  "text": "这是要转换的文本",
  "voice": "Cherry",
  "language": "Chinese"
}
```

**响应：**
```json
{
  "audio_url": "https://example.com/audio.mp3"
}
```

#### 5. 答题分析

```http
POST /api/v1/analysis/answer
Content-Type: application/json

{
  "content": "题目内容",
  "options": "选项A、选项B、选项C、选项D",
  "knowledge": "知识点",
  "question_answer": "正确答案",
  "student_answer": "学生答案"
}
```

**响应：**
```json
{
  "is_correct": true,
  "analysis": "分析内容，包含原因说明和改进建议"
}
```

### server-api → server-ai（可选）

同步调用场景，接口与 server-task → server-ai 相同。

---

## 代码实现

### server-api 端实现

#### 1. 任务服务客户端

```python
# apps/server-api/services/task_client.py
"""任务服务客户端 - 与 server-task 通信"""
import httpx
from typing import Optional, Dict, Any
from loguru import logger
from core.settings import envs


class TaskServiceClient:
    """任务服务客户端"""
    
    def __init__(self):
        self.base_url = envs.TASK_SERVICE_URL  # http://server-task:7891
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            headers={"Content-Type": "application/json"}
        )
    
    async def submit_task(
        self,
        task_id: str,
        task_type: str,
        payload: Dict[str, Any],
        priority: int = 0,
        timeout: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        提交任务到 server-task
        
        Args:
            task_id: 任务ID
            task_type: 任务类型
            payload: 任务负载
            priority: 优先级
            timeout: 超时时间（秒）
            
        Returns:
            任务响应
        """
        try:
            request_data = {
                "task_id": task_id,
                "task_type": task_type,
                "payload": payload,
                "priority": priority,
            }
            if timeout:
                request_data["timeout"] = timeout
            
            response = await self.client.post(
                "/api/task/submit",
                json=request_data
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            logger.error(
                f"提交任务失败: {e.response.status_code}, "
                f"{e.response.text}"
            )
            raise ValueError(f"提交任务失败: {e.response.text}")
        except Exception as e:
            logger.error(f"提交任务异常: {e}")
            raise
    
    async def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取任务状态"""
        try:
            response = await self.client.get(f"/api/task/{task_id}")
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"获取任务状态失败: {e}")
            return None
    
    async def cancel_task(self, task_id: str) -> bool:
        """取消任务"""
        try:
            response = await self.client.post(f"/api/task/{task_id}/cancel")
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"取消任务失败: {e}")
            return False
    
    async def close(self):
        """关闭客户端"""
        await self.client.aclose()
```

#### 2. AI 服务客户端（可选）

```python
# apps/server-api/services/ai_client.py
"""AI 服务客户端 - 与 server-ai 通信（同步调用）"""
import httpx
from typing import Dict, Any
from loguru import logger
from core.settings import envs


class AIServiceClient:
    """AI 服务客户端"""
    
    def __init__(self):
        self.base_url = envs.AI_SERVICE_URL  # http://server-ai:7892
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=60.0,
            headers={"Content-Type": "application/json"}
        )
    
    async def analyze_answer(
        self,
        content: str,
        options: str,
        knowledge: str,
        question_answer: str,
        student_answer: str,
    ) -> Dict[str, Any]:
        """分析答题情况"""
        try:
            response = await self.client.post(
                "/api/v1/analysis/answer",
                json={
                    "content": content,
                    "options": options,
                    "knowledge": knowledge,
                    "question_answer": question_answer,
                    "student_answer": student_answer,
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"答题分析失败: {e}")
            raise
    
    async def close(self):
        """关闭客户端"""
        await self.client.aclose()
```

#### 3. 使用示例

```python
# apps/server-api/admin/services/textbook.py
from services.task_client import TaskServiceClient
import uuid

async def generate_textbook_questions(
    db: AsyncSession,
    textbook_id: int,
    count: int = 30,
) -> Dict[str, Any]:
    """根据教材ID生成题目（异步任务）"""
    # 1. 验证教材存在
    textbook = await db.scalar(
        select(Textbook).where(Textbook.id == textbook_id)
    )
    if not textbook:
        raise ValueError("教材不存在")
    
    # 2. 提交任务到 server-task
    task_client = TaskServiceClient()
    task_id = str(uuid.uuid4())
    
    try:
        response = await task_client.submit_task(
            task_id=task_id,
            task_type="question_generation",
            payload={
                "type": "textbook",
                "count": count,
                "textbook_id": textbook_id,
            },
            timeout=600,  # 10分钟
        )
        
        logger.info(
            f"教材题目生成任务已提交: textbook_id={textbook_id}, "
            f"task_id={task_id}"
        )
        
        return {
            "task_id": task_id,
            "status": response.get("status"),
            "message": "题目生成任务已提交，请通过任务ID查询状态",
        }
    finally:
        await task_client.close()
```

### server-task 端实现

#### 1. AI 服务客户端

```python
# apps/server-task/services/ai_client.py
"""AI 服务客户端 - 与 server-ai 通信"""
import httpx
from typing import Dict, Any, Optional
from loguru import logger
from core.settings import envs


class AIServiceClient:
    """AI 服务客户端"""
    
    def __init__(self):
        self.base_url = envs.AI_SERVICE_URL  # http://server-ai:7892
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=120.0,  # AI 调用可能需要较长时间
            headers={"Content-Type": "application/json"}
        )
    
    async def generate_text(
        self,
        prompt: str,
        model: str = "qwen3-max",
        temperature: float = 0.7,
    ) -> str:
        """生成文本"""
        try:
            response = await self.client.post(
                "/api/v1/llm/generate",
                json={
                    "prompt": prompt,
                    "model": model,
                    "temperature": temperature,
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["content"]
        except Exception as e:
            logger.error(f"LLM 文本生成失败: {e}")
            raise
    
    async def generate_structured(
        self,
        prompt: str,
        schema: Dict[str, Any],
        model: str = "qwen3-max",
    ) -> Dict[str, Any]:
        """结构化输出"""
        try:
            response = await self.client.post(
                "/api/v1/llm/generate/structured",
                json={
                    "prompt": prompt,
                    "schema": schema,
                    "model": model,
                }
            )
            response.raise_for_status()
            return response.json()["result"]
        except Exception as e:
            logger.error(f"LLM 结构化输出失败: {e}")
            raise
    
    async def generate_image(
        self,
        text: str,
        width: int = 1328,
        height: int = 1328,
        optimize_prompt: bool = True,
    ) -> str:
        """生成图片"""
        try:
            response = await self.client.post(
                "/api/v1/image/generate",
                json={
                    "text": text,
                    "width": width,
                    "height": height,
                    "optimize_prompt": optimize_prompt,
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["image_url"]
        except Exception as e:
            logger.error(f"图片生成失败: {e}")
            raise
    
    async def generate_audio(
        self,
        text: str,
        voice: str = "Cherry",
        language: str = "Chinese",
    ) -> str:
        """生成语音"""
        try:
            response = await self.client.post(
                "/api/v1/audio/tts",
                json={
                    "text": text,
                    "voice": voice,
                    "language": language,
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["audio_url"]
        except Exception as e:
            logger.error(f"语音生成失败: {e}")
            raise
    
    async def analyze_answer(
        self,
        content: str,
        options: str,
        knowledge: str,
        question_answer: str,
        student_answer: str,
    ) -> Dict[str, Any]:
        """分析答题情况"""
        try:
            response = await self.client.post(
                "/api/v1/analysis/answer",
                json={
                    "content": content,
                    "options": options,
                    "knowledge": knowledge,
                    "question_answer": question_answer,
                    "student_answer": student_answer,
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"答题分析失败: {e}")
            raise
    
    async def close(self):
        """关闭客户端"""
        await self.client.aclose()
```

#### 2. Worker 使用示例

```python
# apps/server-task/workers/question_worker.py
from services.ai_client import AIServiceClient
from typing import Dict, Any

class QuestionWorker:
    """题目生成 Worker"""
    
    async def generate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """生成题目"""
        ai_client = AIServiceClient()
        
        try:
            # 构建 prompt
            prompt = self._build_prompt(payload)
            
            # 定义输出 schema
            schema = {
                "type": "object",
                "properties": {
                    "questions": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "content": {"type": "string"},
                                "answer": {"type": "string"},
                                "options": {"type": "array"}
                            }
                        }
                    }
                }
            }
            
            # 调用 AI 服务生成题目
            result = await ai_client.generate_structured(
                prompt=prompt,
                schema=schema,
                model="qwen3-max",
            )
            
            # 处理结果...
            return result
            
        finally:
            await ai_client.close()
```

### server-ai 端实现

#### 1. API 路由示例

```python
# apps/server-ai/api/routes/llm.py
from fastapi import APIRouter, HTTPException
from schemas.llm import LLMGenerateRequest, LLMGenerateResponse
from services.llm.service import LLMService

router = APIRouter(prefix="/api/v1/llm", tags=["LLM"])

@router.post("/generate", response_model=LLMGenerateResponse)
async def generate_text(request: LLMGenerateRequest):
    """生成文本"""
    try:
        service = LLMService()
        result = await service.generate(
            prompt=request.prompt,
            model=request.model,
            temperature=request.temperature,
        )
        return LLMGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 配置说明

### server-api 配置

```python
# apps/server-api/core/settings.py
class Settings(BaseSettings):
    # ... 现有配置 ...
    
    # 服务间通信配置
    TASK_SERVICE_URL: str = "http://server-task:7891"
    AI_SERVICE_URL: str = "http://server-ai:7892"  # 可选
    
    class Config:
        env_file = ".env"
```

**环境变量：**
```env
TASK_SERVICE_URL=http://server-task:7891
AI_SERVICE_URL=http://server-ai:7892
```

### server-task 配置

```python
# apps/server-task/core/settings.py
class Settings(BaseSettings):
    # ... 现有配置 ...
    
    # AI 服务配置
    AI_SERVICE_URL: str = "http://server-ai:7892"
    
    class Config:
        env_file = ".env"
```

**环境变量：**
```env
AI_SERVICE_URL=http://server-ai:7892
```

### server-ai 配置

```python
# apps/server-ai/core/settings.py
class Settings(BaseSettings):
    # 服务配置
    HOST: str = "0.0.0.0"
    PORT: int = 7892
    
    # AI 平台配置
    AI_PLATFORM_KEY: str
    AI_PLATFORM_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    
    class Config:
        env_file = ".env"
```

---

## 部署指南

### Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ... 现有服务 (mysql, redis, nginx) ...
  
  server-api:
    build:
      context: ./apps/server-api
      dockerfile: Dockerfile
    container_name: ai-education-server-api
    restart: always
    ports:
      - "${SERVER_PORT:-7890}:7890"
    environment:
      # ... 现有环境变量 ...
      TASK_SERVICE_URL: http://server-task:7891
      AI_SERVICE_URL: http://server-ai:7892
    depends_on:
      - mysql
      - redis
      - server-task
      - server-ai
    networks:
      - ai-education-network
  
  server-task:
    build:
      context: ./apps/server-task
      dockerfile: Dockerfile
    container_name: ai-education-server-task
    restart: always
    ports:
      - "${TASK_SERVER_PORT:-7891}:7891"
    environment:
      # ... 现有环境变量 ...
      AI_SERVICE_URL: http://server-ai:7892
    depends_on:
      - redis
      - server-ai
    networks:
      - ai-education-network
  
  server-ai:
    build:
      context: ./apps/server-ai
      dockerfile: Dockerfile
    container_name: ai-education-server-ai
    restart: always
    ports:
      - "${AI_SERVER_PORT:-7892}:7892"
    environment:
      RUN_ENV: ${RUN_ENV:-production}
      AI_PLATFORM_KEY: ${AI_PLATFORM_KEY}
      AI_PLATFORM_URL: ${AI_PLATFORM_URL}
    networks:
      - ai-education-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7892/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  ai-education-network:
    driver: bridge
```

### 启动顺序

1. 启动基础设施：MySQL、Redis
2. 启动 server-ai（AI 服务）
3. 启动 server-task（任务服务）
4. 启动 server-api（业务 API）

### 健康检查

```bash
# 检查 server-api
curl http://localhost:7890/health

# 检查 server-task
curl http://localhost:7891/health

# 检查 server-ai
curl http://localhost:7892/health
```

---

## 最佳实践

### 1. 错误处理

```python
# 使用重试机制
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def call_ai_service():
    # 调用 AI 服务
    pass
```

### 2. 超时设置

```python
# 根据任务类型设置合理的超时时间
timeouts = {
    "question_generation": 600,  # 10分钟
    "image_generation": 300,     # 5分钟
    "audio_generation": 180,     # 3分钟
    "answer_analysis": 30,       # 30秒
}
```

### 3. 连接池管理

```python
# 使用连接池，避免频繁创建连接
client = httpx.AsyncClient(
    base_url=base_url,
    timeout=timeout,
    limits=httpx.Limits(
        max_keepalive_connections=20,
        max_connections=100
    )
)
```

### 4. 日志记录

```python
# 记录关键信息
logger.info(
    f"调用 AI 服务: endpoint={endpoint}, "
    f"duration={duration:.2f}s, status={status}"
)
```

### 5. 监控指标

```python
# 记录性能指标
metrics = {
    "ai_call_count": 0,
    "ai_call_duration": 0.0,
    "ai_call_errors": 0,
}
```

---

## 故障排查

### 常见问题

#### 1. 服务无法连接

**症状：** `Connection refused` 或 `Timeout`

**排查步骤：**
1. 检查服务是否启动：`docker ps`
2. 检查网络配置：`docker network inspect ai-education-network`
3. 检查服务健康状态：`curl http://service:port/health`
4. 检查防火墙和端口配置

#### 2. 任务提交失败

**症状：** 任务提交后立即失败

**排查步骤：**
1. 检查 server-task 日志
2. 检查 Redis 连接
3. 检查任务负载格式是否正确
4. 检查 Worker 是否运行

#### 3. AI 调用超时

**症状：** AI 服务调用超时

**排查步骤：**
1. 检查 AI 服务是否正常
2. 检查网络延迟
3. 增加超时时间
4. 检查 AI 平台 API 状态

#### 4. 任务状态查询失败

**症状：** 无法查询任务状态

**排查步骤：**
1. 检查任务ID是否正确
2. 检查 Redis 中任务是否存在
3. 检查任务是否已过期（TTL）

### 调试技巧

```python
# 启用详细日志
import logging
logging.basicConfig(level=logging.DEBUG)

# 使用 httpx 的调试模式
client = httpx.AsyncClient(
    base_url=base_url,
    event_hooks={
        'request': [print_request],
        'response': [print_response],
    }
)
```

---

## 总结

本方案采用 HTTP REST API 作为三服务间的通信方式，具有以下优势：

1. **简单易用**：开发效率高，团队熟悉
2. **易于调试**：JSON 格式可读性好
3. **工具丰富**：Postman、Swagger 等工具支持完善
4. **性能足够**：对于当前业务场景，HTTP 性能已满足需求

**适用场景：**
- 项目初期快速开发
- 团队对 HTTP REST API 熟悉
- 调用频率中等
- 性能要求不是极致

**后续优化方向：**
- 如果 server-task → server-ai 调用频率非常高，可考虑改为 gRPC
- 添加服务间认证机制
- 实现请求限流和熔断
- 添加分布式追踪

---

**文档版本：** v1.0  
**最后更新：** 2024-01-01  
**维护者：** AI Education Team

