# shared-types 多端集成与继承方案

本文档描述 `@ai-edu/shared-types` 在 **Admin 前端 / Student 前端 / FastAPI 后端 / Flutter 移动端** 四端的集成方式与渐进式迁移（继承）方案。

---

## 1. 总体思路

### 1.1 单一类型源

- 唯一可信的类型定义来源：`shared-types/src/types/*.ts`
- 通过生成器导出多端可用模型：

```text
shared-types/
  src/types/           # TS 源类型（真源）
  build/
    index.d.ts         # TS 声明（供前端 / Node 端直接使用）
    python/models.py   # Pydantic 模型（供 FastAPI 使用）
    dart/              # Dart 模型（供 Flutter 使用）
      enums.dart
      models.dart
      shared_types.dart
```

### 1.2 三端职责分工

- **TS 前端**：直接使用 TS 接口/枚举，不需要运行时转换
- **Python 后端**：使用 Pydantic 模型进行校验 & 文档生成
- **Flutter**：使用 Dart `@JsonSerializable()` 模型进行 JSON 编解码

---

## 2. TypeScript 前端集成（Admin / Student）

### 2.1 安装与基础设置

#### 2.1.1 安装依赖

Admin：

```bash
cd admin
pnpm add @ai-edu/shared-types
```

Student：

```bash
cd student
pnpm add @ai-edu/shared-types
```

#### 2.1.2 tsconfig 调整（示例）

Admin `tsconfig.json`：

```json
{
  "compilerOptions": {
    "types": ["@ai-edu/shared-types"]
  },
  "include": [
    "src/**/*",
    "../shared-types/build/**/*"
  ]
}
```

Student `tsconfig.json`：

```json
{
  "compilerOptions": {
    "types": ["@ai-edu/shared-types"]
  },
  "include": [
    "src/**/*",
    "node_modules/@ai-edu/shared-types/build/**/*"
  ]
}
```

### 2.2 替换项目本地类型

#### 2.2.1 统一类型出口

示例：Student 前端 `src/types/index.ts`：

```ts
// 统一从 shared-types 导出需要在前端层使用的类型
export type {
  // 用户相关
  Student,
  StudentLoginRequest,
  StudentLoginResponse,

  // 教育内容
  Textbook,
  Unit,
  Knowledge,
  Question,
  QuestionType,
  Difficulty,
  Subject,
  Grade,

  // 练习相关
  PracticeSession,
  PracticeType,
  PracticeSessionStatus,
  PracticeAnswer,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  WrongRecord,
  PracticeReport,

  // 通用
  ApiResponse,
  PaginatedResponse,
  BaseEntity,
  Status,
} from '@ai-edu/shared-types';
```

#### 2.2.2 在服务层使用

示例：Student 前端 `src/services/practice.ts`：

```ts
import axios from 'axios';
import type {
  PracticeSession,
  CreatePracticeRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  ApiResponse,
} from '@ai-edu/shared-types';

const api = axios.create({
  baseURL: '/api/student',
  timeout: 10000,
});

export async function createPractice(
  params: CreatePracticeRequest,
): Promise<PracticeSession> {
  const res = await api.post<ApiResponse<PracticeSession>>('/practices', params);
  if (res.data.code !== 0 || !res.data.data) {
    throw new Error(res.data.message || '创建练习失败');
  }
  return res.data.data;
}

export async function submitAnswer(
  params: SubmitAnswerRequest,
): Promise<SubmitAnswerResponse> {
  const res = await api.post<ApiResponse<SubmitAnswerResponse>>(
    '/practices/answer',
    params,
  );
  if (res.data.code !== 0 || !res.data.data) {
    throw new Error(res.data.message || '提交答案失败');
  }
  return res.data.data;
}
```

#### 2.2.3 在组件层使用

示例：Admin `StudentForm`：

```ts
import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import type { Student, Grade, Status } from '@ai-edu/shared-types';

interface StudentFormProps {
  initialValues?: Partial<Student>;
  onFinish: (values: Student) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ initialValues, onFinish }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const student: Student = {
      id: initialValues?.id || '',
      name: values.name,
      phone: values.phone,
      grade: values.grade,
      status: values.status,
      create_time: initialValues?.create_time || Date.now(),
      update_time: initialValues?.update_time,
    };
    onFinish(student);
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleFinish}>
      {/* ... 表单字段 ... */}
      <Button type="primary" htmlType="submit">
        保存
      </Button>
    </Form>
  );
};
```

### 2.3 渐进式替换策略

1. **第一步**：service 层先接共享类型（改动集中、易回滚）
2. **第二步**：组件 prop 与状态使用共享类型
3. **第三步**：删除项目内重复定义的 DTO / enum / interface

---

## 3. Python / FastAPI 集成

### 3.1 引入生成的 Python 模型

前提：在仓库根目录执行：

```bash
cd shared-types
npm install
npm run build   # 会生成 build/python/models.py
```

### 3.2 server 工程中增加统一类型入口

`server/types/__init__.py`（统一挂载共享类型）：

```python
"""
类型定义模块：从 shared-types 生成的 Python 模型统一导入。
"""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
PYTHON_MODELS_PATH = PROJECT_ROOT / "shared-types" / "build" / "python"
sys.path.insert(0, str(PYTHON_MODELS_PATH))

try:
  from models import (
      # 通用
      ApiResponse,
      PaginatedResponse,
      BaseEntity,
      Status,
      Subject,
      Grade,
      # 用户
      Student,
      Admin,
      StudentLoginRequest,
      StudentLoginResponse,
      # 教育 / 练习
      Textbook,
      Unit,
      Knowledge,
      Question,
      PracticeSession,
      PracticeAnswer,
      PracticeReport,
      WrongRecord,
  )
except ImportError as e:
  raise RuntimeError(
      f"导入 shared-types 生成的 Python 模型失败: {e}. "
      "请先在 shared-types 目录运行 `npm run build`。"
  )

__all__ = [
    "ApiResponse",
    "PaginatedResponse",
    "BaseEntity",
    "Status",
    "Subject",
    "Grade",
    "Student",
    "Admin",
    "StudentLoginRequest",
    "StudentLoginResponse",
    "Textbook",
    "Unit",
    "Knowledge",
    "Question",
    "PracticeSession",
    "PracticeAnswer",
    "PracticeReport",
    "WrongRecord",
]
```

### 3.3 在路由中使用共享类型

示例：`server/student/routes/student.py`：

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from server.core.database import get_db
from server.student.services.student import StudentService
from server.types import (
    Student,
    StudentLoginRequest,
    StudentLoginResponse,
    ApiResponse,
)

router = APIRouter(prefix="/student", tags=["student"])


@router.post("/login", response_model=ApiResponse[StudentLoginResponse])
async def login(
    request: StudentLoginRequest,
    db: Session = Depends(get_db),
):
    """学生登录"""
    try:
        service = StudentService(db)
        result = await service.login(request.phone, request.password)
        return ApiResponse(code=0, message="登录成功", data=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile", response_model=ApiResponse[Student])
async def get_profile(
    current_student: Student = Depends(...),
):
    """获取学生信息"""
    return ApiResponse(code=0, message="success", data=current_student)
```

### 3.4 ORM ↔ Pydantic 模型转换

示例：`server/core/models.py` 中的 `StudentDB`：

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from server.types import Student as StudentSchema

Base = declarative_base()


class StudentDB(Base):
    __tablename__ = "students"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    grade = Column(Integer, nullable=False)
    status = Column(Integer, default=1)
    password_hash = Column(String(255))
    create_time = Column(Integer, nullable=False)
    update_time = Column(Integer)

    def to_schema(self) -> StudentSchema:
        return StudentSchema(
            id=self.id,
            name=self.name,
            phone=self.phone,
            grade=self.grade,
            status=self.status,
            create_time=self.create_time,
            update_time=self.update_time,
        )

    @classmethod
    def from_schema(cls, schema: StudentSchema) -> "StudentDB":
        return cls(
            id=schema.id,
            name=schema.name,
            phone=schema.phone,
            grade=schema.grade,
            status=schema.status,
            create_time=schema.create_time,
            update_time=schema.update_time,
        )
```

### 3.5 渐进式迁移建议

1. 为避免一次性大改，可暂时并行保留老的 Pydantic Schema：
   - 新生成的模型放在 `server/types`，旧模型在原模块
   - 新增接口优先使用共享模型，老接口在重构时逐步迁移
2. 将 `ApiResponse` 等通用响应类型切换为共享模型，以统一前后端约定。

---

## 4. Flutter / Dart 集成与继承

### 4.1 引入生成的 Dart 类型

前提：在仓库根目录：

```bash
cd shared-types
npm install
npm run build   # 会生成 build/dart/* 文件
```

将生成结果引入 `mobile`：

```bash
cd mobile
mkdir -p lib/core/shared_types
cp -r ../shared-types/build/dart/* lib/core/shared_types/
```

推荐通过脚本封装：

```bash
# scripts/sync-shared-types-to-mobile.sh
cd shared-types
npm run build
cd ../mobile
rm -rf lib/core/shared_types
mkdir -p lib/core/shared_types
cp -r ../shared-types/build/dart/* lib/core/shared_types/
```

### 4.2 Flutter 工程配置

`mobile/pubspec.yaml` 中已有：

```yaml
dependencies:
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.10.4
  json_serializable: ^6.11.2
```

生成 `*.g.dart`：

```bash
cd mobile
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

### 4.3 使用共享 Dart 类型

#### 4.3.1 统一导出

`mobile/lib/core/shared_types/index.dart`：

```dart
export 'shared_types.dart'; // 由生成器产出的根导出文件
```

#### 4.3.2 在 API 层使用

```dart
import 'package:dio/dio.dart';
import 'package:mobile/core/shared_types/index.dart';

class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  Future<Student> getStudentProfile() async {
    final res = await _dio.get('/api/student/profile');
    final data = res.data['data'] as Map<String, dynamic>;
    return Student.fromJson(data);
  }

  Future<StudentLoginResponse> login(StudentLoginRequest request) async {
    final res = await _dio.post(
      '/api/student/login',
      data: request.toJson(),
    );
    final data = res.data['data'] as Map<String, dynamic>;
    return StudentLoginResponse.fromJson(data);
  }
}
```

#### 4.3.3 在 UI 层使用

```dart
import 'package:flutter/material.dart';
import 'package:mobile/core/shared_types/index.dart';

class StudentHeader extends StatelessWidget {
  final Student student;

  const StudentHeader({super.key, required this.student});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(student.name, style: Theme.of(context).textTheme.titleLarge),
        Text('手机号：${student.phone}'),
        Text('年级：${student.grade}'),
      ],
    );
  }
}
```

### 4.4 与现有 `core/models` 的继承/迁移

当前 mobile 里已有手写模型，例如：

```dart
// lib/core/models/student.dart
@JsonSerializable()
class Student {
  final String id;
  final String name;
  final String phone;
  final int grade;
  final int status;
  @JsonKey(name: 'create_time')
  final int createTime;
  // ...
}
```

迁移建议：

1. **新代码优先用共享模型**：
   - 在新 feature 中直接从 `core/shared_types` import
2. **旧模型做 shim（中间层）**（如有必要保持 API 不变）：

   ```dart
   // 旧 API 仍返回 core/models 中的 Student，
   // 但内部通过 shared_types.Student 构建。
   import 'package:mobile/core/shared_types/index.dart' as Shared;

   @JsonSerializable()
   class Student {
     // 原字段...

     factory Student.fromShared(Shared.Student s) => Student(
       id: s.id,
       name: s.name,
       phone: s.phone,
       grade: s.grade,
       status: s.status,
       createTime: s.createTime,
     );
   }
   ```

3. **清理阶段**：
   - 当大部分代码已直接依赖共享模型时，逐步删除 `core/models` 中重复的模型，仅保留 domain 级别的组合/封装类型。

---

## 5. 版本与兼容性

### 5.1 版本约定

- `shared-types` 使用 **语义化版本**：
  - `MAJOR`：破坏性字段变更（字段删除 / 类型变化）
  - `MINOR`：新增字段 / 新类型（向后兼容）
  - `PATCH`：注释修正 / 生成逻辑小修

### 5.2 端侧更新流程

1. 在 `shared-types` 中完成类型修改，更新版本号并打 tag
2. 在根仓库中运行：

   ```bash
   cd shared-types
   npm run build
   # 如有私有 npm 仓库，可执行 npm publish
   ```

3. 在各端更新依赖：
   - Admin / Student：`pnpm update @ai-edu/shared-types`
   - Server：同步 `build/python`（或通过 Python 包管理升级）
   - Mobile：重新同步 `build/dart` 至 `lib/core/shared_types`，并运行 `build_runner`

4. 执行各端测试，确认无编译 & 运行期错误。

---

## 6. 常见问题 & 建议

- **Q: TS / Python / Dart 字段名不一致怎么办？**  
  A: 以 **后端 JSON 字段** 为基准（通常是下划线命名），在 TS / Dart 中通过 `@JsonKey` 或类似机制映射到 camelCase 属性，Python 使用 Pydantic 的 `alias`（可在生成逻辑中扩展）。

- **Q: 能否在后端直接用生成的 Pydantic 覆盖现有 Schema？**  
  A: 建议逐模块迁移，避免一次性重写所有 service；优先迁移通用 DTO（如 `ApiResponse`、`Student`、`Question`）以获得最大收益。

- **Q: Flutter 是否必须删除现有 model？**  
  A: 不必须。推荐通过 shared-types 驱动 **API DTO 层**，但 domain 层可以继续保留领域模型，用作 UI/业务逻辑的内部表示。

---

## 7. 落地优先级建议

1. **高优先级**
   - 在 server 中接入 Python 共享模型 + 通用响应类型
   - 在 Student 前端的 API service 中使用共享类型
2. **中优先级**
   - 在 mobile 中接入 Dart 共享类型（至少用于练习核心链路）
   - Admin 端的管理表单使用共享类型
3. **低优先级**
   - 清理历史类型定义 / 重复模型
   - 为共享类型补充更完整的 JSDoc 注释和示例

通过以上方案，可以在保证**现有业务稳定**的前提下，逐步把整个 AI 教育平台迁移到一个真正「单一类型源、三端共享」的架构上。  
后续如增加新端（例如 Node 服务、脚本工具）也可以直接消费 `shared-types`，避免再次造轮子。


