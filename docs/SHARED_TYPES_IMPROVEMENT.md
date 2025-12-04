# shared-types 生成器改进方案（含 Flutter 支持）

## 1. 现状与问题

当前 `shared-types` 只提供：

- **TS → `.d.ts`**：通过 `tsc` 生成声明文件
- **TS → Python**：通过 `scripts/generate-python-types.js` 用正则/字符串解析生成 Pydantic 模型

主要问题：

- **解析方式脆弱**：依赖字符串 & 正则，遇到以下情况容易失败或生成错误代码：
  - 联合类型（`string | string[]`）
  - 泛型（`Record<string, number>`、`Array<T>` 等）
  - 交叉类型 / 条件类型
  - 多行 / 带注释的复杂声明
- **类型依赖关系未建模**：
  - 接口继承（`extends BaseEntity`）只是简单字符串截取
  - 字段中引用的自定义类型不做拓扑排序，生成顺序不稳定
- **缺少 Dart/Flutter 端生成**：
  - Flutter 目前在 `mobile/lib/core/models` 下手写 model，与 TS/Python 定义存在漂移风险
- **缺少系统化的验证与 CI**：
  - 没有自动校验生成的 Python / Dart 代码能否正常导入 / 编译
  - 没有覆盖多端类型一致性的测试

## 2. 改进目标

### 2.1 功能目标

1. **统一的类型源**：仍以 `src/types/*.ts` 为单一真源
2. **三端生成**：
   - TS: `.d.ts`（已有）
   - Python: Pydantic 模型（改造）
   - Dart: Flutter 可直接使用的 `@JsonSerializable()` model（新增）
3. **结构保持一致**：字段、枚举、可选性、嵌套结构保持跨端对齐

### 2.2 质量目标

1. **使用 TypeScript Compiler API**，替代字符串/正则解析
2. **构建失败即中断**：任何一端生成失败应让 CI/构建失败
3. **可测试**：提供单元 + 集成测试，验证：
   - 生成代码可导入
   - 基本序列化/反序列化往返无损

## 3. 总体技术方案

### 3.1 工具链与输出目录

在 `shared-types/` 中维护三类输出：

```text
shared-types/
  src/types/              # 源 TS 类型定义（单一数据源）
  build/
    index.d.ts            # TS 声明
    python/
      models.py           # Python Pydantic 模型
    dart/
      enums.dart          # Dart 枚举
      models.dart         # Dart 数据模型
      shared_types.dart   # 统一导出
```

### 3.2 编译配置（tsconfig）

复用现有 `tsconfig.json`，确保包含：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./build",
    "strict": true,
    "declaration": true
  },
  "include": ["src/types/**/*"]
}
```

## 4. Python 生成器改造方案

### 4.1 设计原则

- 基于 **TypeScript Compiler API** 做 AST 级解析
- 映射关系明确、可扩展：
  - `string` → `str`
  - `number` → `int | float`（先统一为 `int`，必要时增加配置）
  - `boolean` → `bool`
  - `T[]` / `Array<T>` → `List[T]`
  - `Record<K, V>` → `Dict[K, V]`
- **可选字段**：TS 中带 `?` 的字段映射为 `Optional[T] = None`
- 枚举：TS `enum` → Python `Enum`（字符串枚举）

### 4.2 核心生成流程

伪代码（新文件建议命名：`scripts/generate-python-types-improved.js`，之后替换老脚本）：

```js
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

class ImprovedPythonTypeGenerator {
  initProgram() {
    const configPath = ts.findConfigFile(
      path.join(__dirname, '..'),
      ts.sys.fileExists,
      'tsconfig.json',
    );
    if (!configPath) throw new Error('tsconfig.json not found');

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath),
    );

    this.program = ts.createProgram(parsed.fileNames, parsed.options);
    this.checker = this.program.getTypeChecker();
  }

  generate() {
    this.initProgram();
    const models = [];
    const enums = [];

    for (const sf of this.program.getSourceFiles()) {
      if (sf.isDeclarationFile || !sf.fileName.includes('src/types')) continue;
      ts.forEachChild(sf, node => {
        if (ts.isInterfaceDeclaration(node)) models.push(this.parseInterface(node));
        if (ts.isEnumDeclaration(node)) enums.push(this.parseEnum(node));
      });
    }

    const sortedModels = this.sortByDependency(models);
    const code = this.emitPython(sortedModels, enums);

    const outDir = path.join(__dirname, '../build/python');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'models.py'), code);
  }

  // parseInterface / parseEnum / sortByDependency / emitPython 等方法略
}

if (require.main === module) {
  new ImprovedPythonTypeGenerator().generate();
}
```

### 4.3 映射规则示例

以 `education.ts` 中的 `Question` 为例：

```ts
export interface Question extends BaseEntity {
  id: number;
  type: QuestionType;
  subject: Subject;
  grade: Grade;
  content: string;
  options?: string[];
  answer?: string | string[];
  knowledge_ids?: number[];
}
```

生成 Python 目标结构：

```python
class Question(BaseEntity):
    id: int
    type: QuestionType
    subject: Subject
    grade: Grade
    content: str
    options: Optional[List[str]] = None
    answer: Optional[Union[str, List[str]]] = None
    knowledge_ids: Optional[List[int]] = None

    class Config:
        extra = "ignore"
        from_attributes = True
```

## 5. Dart / Flutter 生成器方案

### 5.1 目标

- 从 `src/types/*.ts` 自动生成 Dart model，尽量贴合现有 `mobile/lib/core/models` 的风格：
  - 使用 `@JsonSerializable()`
  - `final` 字段 + const 构造函数
  - 字段命名保持 Dart 风格（`create_time` → `createTime`），同时通过 `@JsonKey(name: 'create_time')` 映射后端 JSON
- 统一输出到 `shared-types/build/dart`，由 Flutter 项目通过 **Git 子模块 / 复制** 方式集成。

### 5.2 核心生成思路

新文件：`scripts/generate-dart-types.js`

关键点：

- 使用 TypeScript AST 解析接口/枚举
- 将 TS 字段名拆成两层语义：
  - JSON 字段：保持与后端/TS 一致（`create_time`）
  - Dart 字段：转换为 camelCase（`createTime`）
- 自动生成：
  - `enums.dart`：保存所有枚举及 `value` / `fromValue` 帮助方法
  - `models.dart`：所有接口对应的 Dart 类
  - `shared_types.dart`：统一导出文件

字段映射示例：

```ts
export interface PracticeSession extends BaseEntity {
  id: number;
  student_id: string;
  session_type: PracticeType;
  start_time: number;
  end_time?: number;
}
```

生成 Dart：

```dart
@JsonSerializable()
class PracticeSession {
  final int id;
  @JsonKey(name: 'student_id')
  final String studentId;
  @JsonKey(name: 'session_type')
  final PracticeType sessionType;
  @JsonKey(name: 'start_time')
  final int startTime;
  @JsonKey(name: 'end_time')
  final int? endTime;

  const PracticeSession({
    required this.id,
    required this.studentId,
    required this.sessionType,
    required this.startTime,
    this.endTime,
  });

  factory PracticeSession.fromJson(Map<String, dynamic> json) =>
      _$PracticeSessionFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeSessionToJson(this);
}
```

### 5.3 与现有 Flutter 模型的继承/迁移策略

- **短期**：保留 `mobile/lib/core/models` 现有模型，逐步替换为共享生成模型：
  - 第一阶段：新增 `lib/core/shared_types/`，引入生成模型，仅在新业务中试点使用
  - 第二阶段：将旧模型迁移为对共享模型的 **wrapper / alias**，确保兼容旧代码
  - 第三阶段：清理旧模型，所有入口统一使用共享模型
- **兼容策略**：
  - 如果现有 Dart 模型字段名和 TS 字段名完全一致，可直接替换 import
  - 如果不一致（例如现有 Dart 已经是 camelCase），则优先保持旧行为：通过 `@JsonKey` 映射，尽量让生成代码与现有实现一致（需要在生成规则里参考当前 mobile 模型，逐步对齐）

## 6. scripts 与 npm scripts 调整

### 6.1 新增/更新脚本

`shared-types/package.json` 中建议的脚本：

```json
{
  "scripts": {
    "build": "tsc && npm run build:python && npm run build:dart",
    "build:python": "node scripts/generate-python-types-improved.js",
    "build:dart": "node scripts/generate-dart-types.js",
    "validate": "node scripts/validate-types.js",
    "dev": "tsc --watch",
    "clean": "rimraf build",
    "prepublishOnly": "npm run clean && npm run build"
  }
}
```

新增 `scripts/validate-types.js`，做基础校验（伪代码）：

```js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function validatePython() {
  const pyFile = path.join(__dirname, '../build/python/models.py');
  if (!fs.existsSync(pyFile)) throw new Error('Python models.py not found');
  execSync(`python3 -c "import sys; sys.path.insert(0, '${path.dirname(pyFile)}'); import models"`, { stdio: 'inherit' });
}

function validateDart() {
  const dartDir = path.join(__dirname, '../build/dart');
  if (!fs.existsSync(dartDir)) throw new Error('Dart output not found');
  try {
    execSync(`dart analyze ${dartDir}`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('dart analyze 失败，可在 CI 环境中再强校验：', e.message);
  }
}

if (require.main === module) {
  validatePython();
  validateDart();
}
```

## 7. 测试与 CI 集成

### 7.1 本地回归步骤

```bash
cd shared-types
npm install
npm run build
npm run validate
```

再分别在三个端项目中做 smoke test：

- `admin` / `student`：`pnpm lint && pnpm test`（或现有命令）
- `server`：`uv run python -m pytest`（或现有测试命令）
- `mobile`：`flutter test`

### 7.2 CI 工作流示例（伪代码）

在根仓库 CI 中添加 job：

```yaml
jobs:
  shared-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Build shared types
        run: |
          cd shared-types
          npm install
          npm run build
          npm run validate
```

## 8. 迁移与继承策略总结

- **Python 侧**：
  - 先并行保留老的 `models.py`，引入新生成文件到另一个路径（例如 `models_v2.py`）
  - 服务层逐模块迁移为新模型后，再统一切换 import
- **Flutter 侧**：
  - 先在 `lib/core/shared_types/` 引入生成模型，业务代码通过中间层（DTO → Domain Model）渐进式接入
  - 确认现有 UI / 状态管理全部切换到共享模型后，再删除老 model
- **TS 前端**：
  - 直接从 `@ai-edu/shared-types` 导出类型，在 service 层优先替换类型签名，组件层在重构时同步替换

落地顺序建议：

1. 先在 `shared-types` 内完成生成器改造 + 本地验证
2. 后端 `server` 先接入新的 Python 模型（最能直接发现字段/类型问题）
3. 前端 & Flutter 再逐步接入共享类型，期间保持双轨兼容，避免一次性大改。


