# 迁移指南

本文档说明如何将 admin-web 和 student-web 迁移到使用 `@ai-education/shared-web` 共享包。

## 步骤 1: 安装依赖

在项目根目录运行：

```bash
pnpm install
```

这会将共享包安装到两个项目中。

## 步骤 2: 更新 admin-web

### 2.1 更新 API 客户端

修改 `apps/admin-web/src/lib/api.ts`：

```typescript
import { ApiClient } from '@ai-education/shared-web/api';
import type { Manager, Student, Question, Textbook, Unit, Knowledge, PracticeSession } from '@ai-education/shared-web/types';
import { go } from '@ai-education/shared-web/utils';

/**
 * 管理端 API 客户端类
 */
export class AdminApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: '/api/admin',
      tokenKey: 'token',
      onAuthError: () => go('/login'),
    });
  }

  // ... 保留所有现有的方法
}

export const adminApi = new AdminApiClient();
```

### 2.2 更新路由文件

修改 `apps/admin-web/src/lib/router.tsx`：

```typescript
import { history, go } from '@ai-education/shared-web/utils';
// 移除本地的 history 和 go 定义
// ... 其他代码保持不变
```

### 2.3 更新类型定义

可以逐步将 `apps/admin-web/types/*.d.ts` 中的类型迁移到使用共享包的类型，或者保留作为扩展类型。

## 步骤 3: 更新 student-web

### 3.1 更新 API 客户端

修改 `apps/student-web/src/lib/api.ts`：

```typescript
import { ApiClient } from '@ai-education/shared-web/api';
import type { Student, PracticeSession } from '@ai-education/shared-web/types';
import { go } from '@ai-education/shared-web/utils';
import { toast } from 'sonner';

export class StudentApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: '/api/student',
      tokenKey: '_t',
      onAuthError: () => go('/login'),
      onError: (message) => toast.error(message),
    });
  }

  // ... 保留所有现有的方法
}

export const studentApi = new StudentApiClient();
```

### 3.2 更新路由文件

修改 `apps/student-web/src/lib/router.tsx`：

```typescript
import { history, go } from '@ai-education/shared-web/utils';
// 移除本地的 history 和 go 定义
// ... 其他代码保持不变
```

### 3.3 更新类型定义

可以逐步将 `apps/student-web/src/types/*.ts` 中的类型迁移到使用共享包的类型。

## 步骤 4: 测试

1. 启动开发服务器，确保两个应用都能正常运行
2. 测试 API 调用是否正常工作
3. 测试路由导航是否正常
4. 检查类型检查是否通过

## 注意事项

1. **类型兼容性**: 如果两个项目的类型定义有差异，需要统一后再迁移
2. **全局类型声明**: 如果使用 `declare global`，需要确保类型定义一致
3. **依赖版本**: 确保 `axios` 和 `history` 的版本兼容
4. **构建配置**: rsbuild 应该能够自动处理 TypeScript 源码，无需额外配置

## 回滚

如果遇到问题，可以：

1. 从 `package.json` 中移除 `@ai-education/shared-web` 依赖
2. 恢复原来的代码
3. 运行 `pnpm install` 重新安装依赖

