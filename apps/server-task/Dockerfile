FROM python:3.12-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 uv
RUN pip install uv

# 复制依赖文件
COPY pyproject.toml ./

# 安装依赖（使用 uv）
RUN uv pip install --system \
    fastapi>=0.115.12 \
    uvicorn[standard]>=0.34.2 \
    pydantic-settings>=2.9.1 \
    python-dotenv>=1.1.0 \
    loguru>=0.7.3 \
    aiofiles>=24.1.0 \
    openai>=1.79.0 \
    langchain>=0.3.0,<0.4.0 \
    langchain-openai>=0.2.0,<0.3.0 \
    langchain-core>=0.3.0,<0.4.0 \
    dashscope>=1.25.0 \
    "redis[hiredis]>=6.1.0" \
    rq>=1.15.0

# 复制应用代码
COPY . .

# 创建临时目录
RUN mkdir -p /app/tmp/logs

# 暴露端口
EXPOSE 7891

# 启动命令
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7891"]

