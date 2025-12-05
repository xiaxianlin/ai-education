#!/bin/bash

# RQ Worker 启动脚本

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "警告: .env 文件不存在，请先创建并配置环境变量"
    exit 1
fi

# 获取队列名称（默认为 default）
QUEUE_NAME=${1:-default}

echo "启动 RQ Worker，队列: $QUEUE_NAME"
echo "按 Ctrl+C 停止 Worker"

# 启动 Worker
python worker.py "$QUEUE_NAME"

