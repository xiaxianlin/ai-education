#!/bin/bash

# Task Service 启动脚本

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "警告: .env 文件不存在，请先创建并配置环境变量"
    echo "可以参考以下配置："
    echo "  RUN_ENV=development"
    echo "  TASK_SERVER_HOST=0.0.0.0"
    echo "  TASK_SERVER_PORT=7891"
    echo "  AI_PLATFORM_KEY=your-api-key"
    echo "  AI_PLATFORM_URL=https://dashscope.aliyuncs.com/compatible-mode/v1"
    exit 1
fi

# 启动服务
echo "启动 Task Service..."
python main.py

