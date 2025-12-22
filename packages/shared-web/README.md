# @ai-education/shared-web

共享的 Web 前端代码包，包含 admin-web 和 student-web 的公共函数和类型定义。

## 目录结构

```
packages/shared-web/
├── src/
│   ├── api/
│   │   └── client.ts         # API 客户端基类
│   ├── types/
│   │   ├── index.ts          # 类型导出入口
│   │   ├── api.ts            # API 相关类型
│   │   ├── schema.ts         # 数据模型类型
│   │   └── practice.ts       # 练习相关类型
│   ├── utils/
│   │   └── router.ts         # 路由工具函数
│   └── index.ts              # 主入口文件
├── package.json
└── tsconfig.json
```

## 使用方式

### 在 admin-web 中使用

```typescript
import { ApiClient } from '@ai-education/shared-web/api';
import type { Manager, Student, Question } from '@ai-education/shared-web/types';
import { go } from '@ai-education/shared-web/utils';

// 继承基类
export class AdminApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: '/api/admin',
      tokenKey: 'token',
      onAuthError: () => go('/login'),
    });
  }
}
```

### 在 student-web 中使用

```typescript
import { ApiClient } from '@ai-education/shared-web/api';
import type { Student, PracticeSession } from '@ai-education/shared-web/types';
import { go } from '@ai-education/shared-web/utils';

export class StudentApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: '/api/student',
      tokenKey: '_t',
      onAuthError: () => go('/login'),
      onError: (message) => toast.error(message),
    });
  }
}
```

## 导出内容

### API 客户端

- `ApiClient`: 基础 API 客户端类
- `ApiClientConfig`: API 客户端配置接口

### 类型定义

- `ApiResponse<T>`: API 响应类型
- `ListData<T>`: 分页列表数据
- `ListResponse<T>`: 分页列表响应
- `SearchParams`: 搜索参数
- `Student`: 学生信息
- `Textbook`: 教材信息
- `Unit`: 单元信息
- `Knowledge`: 知识点信息
- `Question`: 题目信息
- `PracticeSession`: 练习会话
- `PracticeAnswer`: 答题记录
- `PracticeWrongRecord`: 错题记录
- `PracticeReport`: 练习报告
- `PracticeData`: 练习会话详情

### 工具函数

- `history`: History 实例
- `go(path, replace?)`: 路由导航函数

