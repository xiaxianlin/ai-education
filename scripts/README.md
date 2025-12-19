# 脚本说明

## keep-all-and-push.sh

在 "keep all" 操作后自动提交当前变更并推送到远程仓库。

### 使用方法

#### 方法 1: 使用 npm script（推荐）

```bash
# 使用默认提交信息
pnpm keep-all

# 使用自定义提交信息
pnpm keep-all "feat: 重构代码结构"
```

#### 方法 2: 直接运行脚本

```bash
# 使用默认提交信息
./scripts/keep-all-and-push.sh

# 使用自定义提交信息
./scripts/keep-all-and-push.sh "fix: 修复合并冲突"
```

#### 方法 3: 配置 Git Alias（可选）

在 `~/.gitconfig` 中添加：

```ini
[alias]
    keep-all = !bash -c 'bash scripts/keep-all-and-push.sh \"$@\"' -
```

然后使用：

```bash
git keep-all "你的提交信息"
```

### 功能说明

1. 自动检测当前分支
2. 添加所有变更（包括删除的文件）
3. 提交变更（使用提供的或默认的提交信息）
4. 推送到远程仓库的当前分支

### 注意事项

- 脚本会自动添加所有变更（`git add -A`），包括未跟踪的文件
- 如果没有变更，脚本会直接退出
- 如果推送失败，脚本会报错并停止执行

