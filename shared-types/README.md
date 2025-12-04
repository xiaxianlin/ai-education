# @ai-edu/shared-types

共享类型定义包，为 AI 教育平台提供跨端类型一致性保证。

## 🚀 特性

- **单一数据源**：TypeScript 类型定义作为唯一真源
- **三端支持**：自动生成 TypeScript、Python、Dart 代码
- **类型安全**：基于 TypeScript Compiler API 的准确解析
- **自动验证**：构建时验证生成代码的语法和导入
- **版本管理**：独立的包版本控制和发布

## 🏗️ 架构设计

```
shared-types/
├── src/types/           # TypeScript 类型定义（单一数据源）
│   ├── common.ts       # 通用类型
│   ├── user.ts         # 用户相关类型
│   ├── education.ts    # 教育内容类型
│   ├── practice.ts     # 练习相关类型
│   ├── media.ts        # 媒体文件类型
│   └── index.ts        # 统一导出
├── scripts/           # 构建和生成脚本
│   ├── generate-python-types-improved.js  # Python 类型生成器（升级版）
│   ├── generate-dart-types.js             # Dart 类型生成器
│   ├── validate-types.js                  # 类型验证脚本
│   └── build.sh                          # 构建脚本
├── build/             # 构建输出
│   ├── index.d.ts    # TypeScript 声明文件
│   ├── python/       # Python Pydantic 模型
│   │   └── models.py
│   └── dart/         # Flutter Dart 模型
│       ├── enums.dart
│       ├── models.dart
│       └── shared_types.dart
└── examples/         # 集成示例
    ├── frontend-integration.md
    ├── backend-integration.md
    └── flutter-integration.md
```

## 🚀 开发

### 安装依赖
```bash
npm install
```

### 开发模式（监听文件变化）
```bash
npm run dev
```

### 构建所有平台类型
```bash
npm run build
```

这会同时生成：
- TypeScript 声明文件
- Python Pydantic 模型
- Dart/Flutter 模型

### 单独构建
```bash
npm run build:python  # 仅生成 Python 类型
npm run build:dart    # 仅生成 Dart 类型
```

### 验证生成结果
```bash
npm run validate  # 验证所有生成代码
npm run type-check  # TypeScript 类型检查
```

## 🔗 使用方式

### 前端项目

```typescript
import { Student, Question, PracticeSession } from '@ai-edu/shared-types';

// 使用类型
const student: Student = {
  id: '123',
  name: '张三',
  phone: '13800138000',
  grade: Grade.GRADE_5,
  status: Status.ENABLED,
  create_time: Date.now()
};

const question: Question = {
  id: 1,
  type: QuestionType.MULTIPLE_CHOICE,
  subject: Subject.MATH,
  grade: Grade.GRADE_5,
  content: '1 + 1 = ?',
  // ...
};
```

### 后端项目

FastAPI 自动导入生成的 Python 模型：

```python
from shared_types.python.models import Student, Question, PracticeSession

@app.post("/students/", response_model=Student)
async def create_student(student: Student):
    # 处理逻辑
    return student
```

### Flutter 项目

复制生成的 Dart 文件到 Flutter 项目：

```bash
# 在项目根目录执行
./scripts/sync-flutter-types.sh

# 或手动复制
cp -r shared-types/build/dart/* mobile/lib/core/shared_types/
```

然后在 Flutter 代码中使用：

```dart
import 'package:your_project/core/shared_types/shared_types.dart';

// 使用类型
Student student = Student(
  id: '123',
  name: '张三',
  phone: '13800138000',
  grade: 5,
  status: 1,
  createTime: 1640995200,
);
```

## 🔄 发布流程

1. 更新版本号
```bash
npm version patch|minor|major
```

2. 发布到私有 NPM 仓库
```bash
npm publish
```

3. 在各项目中更新依赖
```bash
npm update @ai-edu/shared-types
```

## 🛠️ 技术特点

### TypeScript Compiler API
- **准确解析**：基于 AST 的类型解析，避免字符串匹配错误
- **依赖关系**：自动解析接口继承和类型依赖
- **复杂类型**：支持联合类型、泛型、可选字段等复杂场景

### 代码质量保证
- **自动验证**：构建时验证生成代码的语法正确性
- **导入测试**：验证生成的 Python/Dart 代码能否正常导入
- **类型检查**：TypeScript 严格模式编译时类型检查

### 跨端映射
- **字段映射**：自动处理 snake_case ↔ camelCase 转换
- **类型映射**：智能映射 TS 类型到目标语言类型
- **注解生成**：自动添加序列化注解（@JsonSerializable、@JsonKey等）

## 📝 类型设计原则

### 1. 单一数据源
- 所有类型定义集中在 `shared-types` 包中
- 前后端移动端使用相同的类型定义
- 避免重复定义造成的类型不一致

### 2. 版本兼容性
- 遵循语义化版本控制
- 只进行增量更新，不破坏现有 API
- 废弃字段先标记，后移除

### 3. 类型完整性
- 所有 API 接口必须有对应的类型定义
- 请求和响应类型必须成对定义
- 必要时提供示例和文档注释

### 4. 扩展性考虑
- 预留扩展字段（如 `metadata`）
- 使用联合类型支持多种格式
- 考虑未来可能的业务场景

## 🔧 维护指南

### 添加新类型

1. 在对应的类型文件中定义新类型
2. 更新 `index.ts` 导出新类型
3. 运行构建生成 Python 模型
4. 更新各端依赖

### 修改现有类型

1. 评估影响范围
2. 遵循向后兼容原则
3. 如需破坏性更改，升级主版本号
4. 通知所有使用方进行相应调整

### 代码规范

- 使用 TypeScript 严格模式
- 所有类型必须有明确的文档注释
- 枚举值使用有意义的名称
- 避免使用 `any` 类型

## 📊 类型统计

当前版本包含：
- 通用类型：20+
- 用户相关类型：10+
- 教育内容类型：10+
- 练习相关类型：20+
- 媒体文件类型：10+

## 🤝 贡献

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 创建 Pull Request

## 📄 许可证

MIT License