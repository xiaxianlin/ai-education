# AI Provider 模块

## 概述

AI Provider 模块为 AI 教育项目提供了统一的 AI 服务接口，支持多种 AI 平台（目前支持阿里云 DashScope 和 OpenAI），并具有良好的扩展性。

## 特性

- **统一接口**: 通过 `BaseProvider` 抽象基类定义标准方法
- **平台无关**: 通过配置轻松切换不同的 AI 平台
- **多模态支持**: 支持文本生成、图片生成、语音合成、语音识别等
- **LangChain 集成**: 完全兼容 LangChain 生态
- **异步支持**: 所有方法都是异步的，提高性能
- **错误处理**: 统一的异常处理机制
- **类型安全**: 完整的类型提示支持

## 目录结构

```
shared/provider/
├── __init__.py          # 模块入口，工厂函数
├── base.py              # BaseProvider 抽象基类
├── aliyun.py            # 阿里云 DashScope Provider
├── openai.py            # OpenAI Provider（预留）
├── exceptions.py        # Provider 异常类
├── test.py              # 测试文件
├── example.py           # 使用示例
└── README.md            # 文档
```

## 快速开始

### 1. 基本使用

```python
from shared.provider import get_provider

# 获取 Provider 实例（自动从配置读取）
provider = get_provider()

# 文本生成
result = await provider.invoke_text_generate(
    "请介绍一下人工智能",
    max_tokens=200
)
```

### 2. LangChain 链式调用

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from shared.provider import get_provider

provider = get_provider()

# 创建提示词模板
prompt = ChatPromptTemplate.from_template("请解释: {concept}")
parser = StrOutputParser()

# 链式调用
result = await provider.invoke_chain(
    prompt=prompt,
    inputs={"concept": "机器学习"},
    parser=parser
)
```

### 3. 多模态功能

```python
provider = get_provider()

# 图片生成
image_url = await provider.invoke_image_generate(
    "一只可爱的小猫",
    width=512,
    height=512
)

# 语音合成
audio_url = await provider.invoke_tts(
    "你好，这是一个测试",
    voice="Cherry",
    language="Chinese"
)

# 语音识别
text = await provider.invoke_asr(
    audio_data=b"...",  # 音频二进制数据
    language="zh"
)
```

## 配置

### 环境变量

在 `.env` 文件中配置：

```bash
# AI 平台配置
AI_PLATFORM=aliyun  # aliyun, openai
AI_PLATFORM_KEY=your-api-key
AI_PLATFORM_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# AI 模型配置
AI_MODEL_NAME=qwen3-max
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000

# TTS 配置
AI_TTS_VOICE=Cherry
AI_TTS_LANGUAGE=Chinese

# 图像生成配置
AI_IMAGE_MODEL=qwen-image-plus
AI_IMAGE_WIDTH=1024
AI_IMAGE_HEIGHT=1024

# 语音识别配置
AI_ASR_MODEL=qwen-audio-turbo
AI_ASR_LANGUAGE=zh
AI_ASR_FORMAT=wav
```

### 动态配置

```python
from shared.provider import get_provider

# 使用自定义配置
provider = get_provider(
    platform="openai",
    api_key="your-openai-key",
    base_url="https://api.openai.com/v1"
)
```

## API 参考

### BaseProvider 抽象基类

```python
class BaseProvider(ABC):
    def get_openai_client(self) -> OpenAI
    def get_langchain_client(self, **kwargs) -> ChatOpenAI
    def get_provider_client(self) -> Optional[Any]
    
    async def invoke_text_generate(self, prompt: str, **kwargs) -> str
    async def invoke_chain(self, prompt: ChatPromptTemplate, inputs: Dict[str, Any], parser: Optional[BaseOutputParser] = None, **kwargs) -> Any
    async def invoke_image_generate(self, prompt: str, width: Optional[int] = None, height: Optional[int] = None, **kwargs) -> str
    async def invoke_video_generate(self, prompt: str, **kwargs) -> str
    async def invoke_tts(self, text: str, voice: Optional[str] = None, language: Optional[str] = None, **kwargs) -> str
    async def invoke_asr(self, audio_data: bytes, **kwargs) -> str
```

### 异常类

- `ProviderError`: 通用 Provider 错误
- `ProviderNotSupportedError`: 不支持的功能
- `ProviderConfigError`: 配置错误

## 支持的平台

### 阿里云 DashScope (aliyun)

- **文本生成**: ✓ 支持
- **图片生成**: ✓ 支持
- **语音合成**: ✓ 支持
- **语音识别**: ✓ 支持
- **视频生成**: ✗ 不支持

### OpenAI (openai)

- **文本生成**: ✓ 支持
- **图片生成**: ✓ 支持 (DALL-E)
- **语音合成**: ✓ 支持 (TTS)
- **语音识别**: ✓ 支持 (Whisper)
- **视频生成**: ✗ 不支持

## 扩展新 Provider

### 1. 创建 Provider 类

```python
from shared.provider.base import BaseProvider
from shared.provider.exceptions import ProviderError, ProviderNotSupportedError

class CustomProvider(BaseProvider):
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
    
    def get_openai_client(self) -> OpenAI:
        # 实现 OpenAI 客户端
        pass
    
    def get_langchain_client(self, **kwargs) -> ChatOpenAI:
        # 实现 LangChain 客户端
        pass
    
    def get_provider_client(self) -> Optional[Any]:
        # 返回平台原生 SDK
        pass
    
    async def invoke_text_generate(self, prompt: str, **kwargs) -> str:
        # 实现文本生成
        pass
    
    # 实现其他方法...
```

### 2. 注册 Provider

```python
from shared.provider import register_provider

register_provider("custom", CustomProvider)
```

## 迁移指南

### 从现有代码迁移

**原来的代码：**
```python
from ai.utils.llm import get_chat_client

client = get_chat_client()
result = client.invoke("请介绍一下人工智能")
```

**迁移后的代码：**
```python
from shared.provider import get_provider

provider = get_provider()
result = await provider.invoke_text_generate("请介绍一下人工智能")
```

### LangChain 代码保持兼容

**原来的代码：**
```python
from ai.utils.llm import get_chat_client
from langchain_core.prompts import ChatPromptTemplate

client = get_chat_client()
prompt = ChatPromptTemplate.from_template("请解释: {concept}")
chain = prompt | client
result = chain.invoke({"concept": "机器学习"})
```

**迁移后的代码：**
```python
from shared.provider import get_provider
from langchain_core.prompts import ChatPromptTemplate

provider = get_provider()
prompt = ChatPromptTemplate.from_template("请解释: {concept}")
result = await provider.invoke_chain(prompt, {"concept": "机器学习"})
```

## 测试

运行测试：

```bash
cd apps/server
source .venv/bin/activate
python -m shared.provider.test
```

运行示例：

```bash
cd apps/server
source .venv/bin/activate
python -m shared.provider.example
```

## 最佳实践

1. **使用异步调用**: 所有方法都是异步的，使用 `await` 关键字
2. **错误处理**: 始终使用 try-catch 处理可能的异常
3. **配置管理**: 通过环境变量管理配置，避免硬编码
4. **日志记录**: Provider 模块会自动记录调用日志
5. **资源管理**: 客户端实例会被缓存，无需手动管理

## 故障排除

### 常见问题

1. **API 密钥错误**: 检查 `AI_PLATFORM_KEY` 配置
2. **网络连接问题**: 检查 `AI_PLATFORM_URL` 配置
3. **不支持的功能**: 使用 `ProviderNotSupportedError` 处理
4. **导入错误**: 确保安装了相应的依赖包

### 调试

启用调试日志：

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 更新日志

### v1.0.0
- 初始版本
- 支持阿里云 DashScope 和 OpenAI
- 完整的多模态功能支持
- LangChain 集成
- 异步支持
