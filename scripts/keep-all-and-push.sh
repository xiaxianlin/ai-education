#!/bin/bash

# 脚本：keep-all-and-push.sh
# 功能：在 keep all 操作后自动提交当前变更并推送到远程仓库
# 使用方法：./scripts/keep-all-and-push.sh [commit_message]

set -e

# 获取提交信息，如果没有提供则使用默认信息
COMMIT_MESSAGE="${1:-chore: keep all changes and push}"

# 获取当前分支名
CURRENT_BRANCH=$(git branch --show-current)

# 检查是否有变更
if [ -z "$(git status --porcelain)" ]; then
    echo "没有变更需要提交"
    exit 0
fi

echo "当前分支: $CURRENT_BRANCH"
echo "提交信息: $COMMIT_MESSAGE"
echo ""

# 显示将要提交的变更
echo "=== 变更列表 ==="
git status --short
echo ""

# 添加所有变更（包括删除的文件）
echo "正在添加所有变更..."
git add -A

# 提交变更
echo "正在提交变更..."
git commit -m "$COMMIT_MESSAGE"

# 推送到远程仓库
echo "正在推送到远程仓库..."
git push origin "$CURRENT_BRANCH"

echo ""
echo "✅ 完成！所有变更已提交并推送到远程仓库"
echo "分支: $CURRENT_BRANCH"
echo "提交: $(git log -1 --oneline)"

