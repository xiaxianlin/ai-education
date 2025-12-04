# 前端集成指南

## Student 端集成

### 1. 安装依赖

```bash
cd student
pnpm add @ai-edu/shared-types
```

### 2. 更新 tsconfig.json

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

### 3. 替换现有类型定义

```typescript
// src/types/schema.ts - 删除此文件，使用共享类型
// src/types/common.d.ts - 删除此文件，使用共享类型
// src/types/service.d.ts - 删除此文件，使用共享类型

// src/types/index.ts - 重新组织类型导入
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

  // 通用类型
  ApiResponse,
  PaginatedResponse,
  BaseEntity,
  Status
} from '@ai-edu/shared-types';
```

### 4. 更新 API 服务

```typescript
// src/services/api.ts
import axios from 'axios';
import type {
  Student,
  LoginRequest,
  LoginResponse,
  PracticeSession,
  CreatePracticeRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  ApiResponse
} from '@ai-edu/shared-types';

const api = axios.create({
  baseURL: '/api/student',
  timeout: 10000,
});

// 登录
export const login = async (params: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', params);
  return response.data.data!;
};

// 获取学生信息
export const getStudent = async (): Promise<Student> => {
  const response = await api.get<ApiResponse<Student>>('/profile');
  return response.data.data!;
};

// 创建练习
export const createPractice = async (params: CreatePracticeRequest): Promise<PracticeSession> => {
  const response = await api.post<ApiResponse<PracticeSession>>('/practices', params);
  return response.data.data!;
};

// 提交答案
export const submitAnswer = async (params: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
  const response = await api.post<ApiResponse<SubmitAnswerResponse>>('/practices/answer', params);
  return response.data.data!;
};
```

### 5. 更新 React 组件

```typescript
// src/components/QuestionCard.tsx
import React from 'react';
import type { Question, SubmitAnswerRequest } from '@ai-edu/shared-types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: SubmitAnswerRequest) => void;
  showResult?: boolean;
  userAnswer?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  showResult = false,
  userAnswer
}) => {
  const [answer, setAnswer] = React.useState<string>('');

  const handleSubmit = () => {
    if (!answer.trim()) return;

    onAnswer({
      session_id: question.session_id!,
      question_id: question.id,
      answer,
      time_spent: 0, // 需要实际计时
    });
  };

  return (
    <div className="question-card">
      <div className="question-content">
        <h3>{question.content}</h3>
        {question.options && (
          <div className="options">
            {question.options.map((option, index) => (
              <label key={index} className="option">
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answer === option}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>

      {showResult && (
        <div className="result">
          <p>你的答案: {userAnswer}</p>
          <p>正确答案: {question.answer}</p>
          {question.analysis && <p>解析: {question.analysis}</p>}
        </div>
      )}

      {!showResult && (
        <button onClick={handleSubmit} disabled={!answer.trim()}>
          提交答案
        </button>
      )}
    </div>
  );
};
```

## Admin 端集成

### 1. 安装依赖

```bash
cd admin
pnpm add @ai-edu/shared-types
```

### 2. 更新全局类型声明

```typescript
// src/types/global.d.ts
import '@ai-edu/shared-types';

// 扩展全局类型（如果需要）
declare global {
  interface Window {
    // 全局变量
  }
}

export {};
```

### 3. 更新 Ant Design 表单

```typescript
// src/pages/Student/StudentForm.tsx
import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import type { Student, Grade, Status } from '@ai-edu/shared-types';

interface StudentFormProps {
  initialValues?: Partial<Student>;
  onFinish: (values: Student) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  initialValues,
  onFinish
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const student: Student = {
      id: initialValues?.id || '',
      name: values.name,
      phone: values.phone,
      grade: values.grade,
      status: values.status,
      create_time: initialValues?.create_time || Date.now(),
    };
    onFinish(student);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item
        name="name"
        label="学生姓名"
        rules={[{ required: true, message: '请输入学生姓名' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="phone"
        label="手机号"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="grade"
        label="年级"
        rules={[{ required: true, message: '请选择年级' }]}
      >
        <Select>
          {Object.values(Grade).map(grade => (
            <Select.Option key={grade} value={grade}>
              {grade}年级
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="状态"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select>
          <Select.Option value={Status.ENABLED>启用</Select.Option>
          <Select.Option value={Status.DISABLED>禁用</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};
```

### 4. 更新表格组件

```typescript
// src/pages/Student/StudentList.tsx
import React from 'react';
import { Table, Button, Space } from 'antd';
import type { Student, ColumnsType } from '@ai-edu/shared-types';
import { StudentForm } from './StudentForm';

export const StudentList: React.FC = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);

  const columns: ColumnsType<Student> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: number) => `${grade}年级`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <span>{status === 1 ? '启用' : '禁用'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => setEditingStudent(record)}>
            编辑
          </Button>
          <Button type="link" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
      />

      {editingStudent && (
        <StudentForm
          initialValues={editingStudent}
          onFinish={(student) => {
            // 处理更新逻辑
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
};
```

## 移动端集成

### 1. 安装依赖

```bash
cd mobile
pnpm add @ai-edu/shared-types
```

### 2. React Native 使用

```typescript
// src/api/types.ts - 导出共享类型
export * from '@ai-edu/shared-types';

// src/api/student.ts
import { Student, PracticeSession, Question } from './types';

export const getStudent = async (): Promise<Student> => {
  // API 调用
};

export const getPracticeQuestions = async (sessionId: number): Promise<Question[]> => {
  // API 调用
};
```

## 最佳实践

### 1. 类型导入方式

```typescript
// ✅ 推荐：命名导入
import { Student, Question } from '@ai-edu/shared-types';

// ❌ 不推荐：整体导入
import * as Types from '@ai-edu/shared-types';
```

### 2. 类型守卫

```typescript
// src/utils/type-guards.ts
import { PracticeSession, PracticeType } from '@ai-edu/shared-types';

export const isDailyPractice = (session: PracticeSession): boolean => {
  return session.session_type === PracticeType.DAILY;
};
```

### 3. 类型扩展

```typescript
// src/types/extensions.ts
import { Student } from '@ai-edu/shared-types';

export interface ExtendedStudent extends Student {
  avatarUrl?: string;
  lastLoginTime?: number;
}
```

### 4. 错误处理

```typescript
// src/utils/api-error.ts
import { ApiResponse } from '@ai-edu/shared-types';

export const handleApiError = (response: ApiResponse) => {
  if (response.code !== 0) {
    throw new Error(response.message);
  }
  return response.data;
};
```