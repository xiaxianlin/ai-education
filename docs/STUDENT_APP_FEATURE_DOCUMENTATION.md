# AI 教育平台 - 学生端应用详细功能文档

## 概述

学生端应用是基于 React 18 + TypeScript 构建的现代化在线学习平台，采用 Rsbuild 构建工具，集成了阿里巴巴云 AI 服务，为学生提供智能化的个性化学习体验。应用采用响应式设计，支持多设备访问，具备完整的练习系统、学习分析和用户体验优化。

## 技术架构

### 核心技术栈
- **框架**: React 18.2.0 + TypeScript 5.3.3
- **构建工具**: Rsbuild (基于 Rspack 的现代构建工具)
- **路由管理**: React Router v6 (支持懒加载)
- **状态管理**: Zustand (轻量级状态管理库)
- **UI 组件**: Radix UI + 自定义组件系统
- **样式方案**: Tailwind CSS + CSS-in-JS
- **HTTP 客户端**: Axios (基于共享 API 客户端)
- **工具库**: ahooks (React Hooks 工具集)
- **AI 服务**: 阿里巴巴云通义千问、语音识别

### 项目结构
```
src/
├── components/           # UI 组件
│   ├── ui/              # 基础 UI 组件 (Radix UI)
│   ├── business/        # 业务组件
│   └── guards/          # 路由守卫
├── pages/               # 页面组件
│   ├── Home/            # 首页
│   ├── Login/           # 登录页
│   ├── Profile/         # 个人中心
│   ├── Practice/        # 练习系统
│   │   ├── Daily/       # 每日练习
│   │   ├── Unit/        # 单元练习
│   │   ├── Session/     # 练习会话
│   │   ├── History/     # 练习历史
│   │   ├── Detail/      # 练习详情
│   │   └── Report/      # 练习报告
│   └── WrongRecords/    # 错题记录
├── layouts/            # 布局组件
├── stores/             # 状态管理
├── hooks/              # 自定义 Hooks
├── lib/                # 工具库
└── types/              # TypeScript 类型定义
```

## 应用路由结构

### 路由层级设计
```
/ (RootLayout - 全局布局)
├── /login (GuestRouteGuard - 游客路由守卫)
└── / (ProtectedRouteGuard - 认证路由守卫 → MainLayout)
    ├── /home → 首页
    ├── /profile → 个人中心
    ├── /practice/
    │   ├── /daily → 每日练习
    │   ├── /unit → 单元练习
    │   ├── /assessment → 综合评估
    │   ├── /history → 练习历史
    │   ├── /session/:sessionId → 练习会话
    │   ├── /detail/:sessionId → 练习详情
    │   └── /report/:sessionId → 练习报告
    └── /wrong-records → 错题记录
```

### 路由守卫机制
- **GuestRouteGuard**: 限制已登录用户访问登录页面
- **ProtectedRouteGuard**: 保护需要登录的路由，未登录时重定向到登录页
- **认证检查**: 通过 localStorage 中的 token 调用后端 API 验证有效性

## 核心页面功能详解

### 1. 登录页面 (`/login`)

#### 功能定位
用户身份认证入口，提供安全、友好的登录体验。

#### 主要功能模块

##### 1.1 认证表单
- **手机号输入框**
  - 支持手机号格式验证
  - 实时输入验证反馈
  - 中国手机号格式支持

- **密码输入框**
  - 密码类型输入
  - 显示/隐藏密码切换
  - 安全的密码处理

- **表单验证**
  - 统一的表单验证逻辑 (`useFormValidation`)
  - 前端实时验证
  - 后端数据校验
  - 友好的错误提示

##### 1.2 视觉设计
- **响应式布局**: 适配不同屏幕尺寸
- **毛玻璃效果背景**: 现代化视觉效果
- **动态欢迎元素**: 提升用户体验
- **品牌 Logo 展示**: 增强品牌识别度

##### 1.3 业务逻辑
```typescript
// 核心认证流程
const login = async (credentials: LoginCredentials) => {
  // 1. 表单验证
  if (!validateForm(credentials)) return false;

  // 2. 调用 API 认证
  const result = await studentApi.login(credentials);

  // 3. 存储 token
  authStore.setToken(result.token);

  // 4. 跳转到首页
  navigate('/home');

  return true;
};
```

#### 技术特点
- 使用 `useRequest` 管理异步请求状态
- 统一的错误处理机制
- 加载状态和错误反馈
- 安全的密码处理和传输

---

### 2. 首页 (`/home`)

#### 功能定位
应用的主要入口页面，展示学习概览和快速访问各种功能。

#### 主要功能模块

##### 2.1 欢迎区域 (`WelcomeCard`)
- **动态欢迎表情**: 根据时间显示不同表情
- **个性化问候语**: "早上好"、"下午好"、"晚上好"
- **渐变文字效果**: 提升视觉吸引力
- **用户信息显示**: 姓名和年级信息

##### 2.2 练习入口区 (`PracticeCard`)
采用 3 列网格布局，展示主要学习功能：

**每日练习卡片**
- 图标：📚 (书本)
- 标题：每日练习
- 描述：基于已选教材的智能练习
- 跳转链接：`/practice/daily`

**单元练习卡片**
- 图标：🎯 (靶心)
- 标题：单元练习
- 描述：按教材单元精确练习
- 跳转链接：`/practice/unit`

**综合评估卡片**
- 图标：📊 (图表)
- 标题：综合评估
- 描述：全面能力检测和薄弱环节分析
- 跳转链接：`/practice/assessment`

##### 2.3 快速操作 (`QuickActions`)
- **练习记录入口**: 快速访问历史记录
- **错题复习入口**: 错题回顾和复习
- **预留功能入口**: 为未来功能预留位置
- **悬停动画效果**: 提升交互体验

#### 交互设计
- **卡片式布局**: 清晰的信息分组
- **渐进式信息展示**: 避免信息过载
- **流畅的页面过渡**: 提升用户体验
- **响应式设计**: 适配各种设备

---

### 3. 练习系统核心功能

### 3.1 每日练习 (`/practice/daily`)

#### 功能定位
基于用户已选教材智能生成每日练习，提供个性化的学习体验。

#### 主要功能模块

##### 3.1.1 功能介绍卡片
- **功能说明**: 解释每日练习的作用和优势
- **使用指南**: 简单的操作说明
- **学习建议**: 基于用户情况的学习建议

##### 3.1.2 空状态提示
- **引导信息**: 无教材时的友好提示
- **操作指引**: 引导用户去选择教材
- **视觉设计**: 使用图标和颜色提升吸引力

##### 3.1.3 学科标签页 (`SubjectTabs`)
```typescript
interface SubjectTab {
  subject: string;        // 学科名称
  textbooks: Textbook[];  // 该学科的教材列表
  practiceCount: number;  // 可用练习数量
}

// 组件功能
- 按学科分组展示已选教材
- 显示每个学科的可用练习数量
- 点击切换不同学科视图
- 空状态处理和友好提示
```

#### 业务逻辑
- **数据获取**: 从 `profileStore` 获取用户教材信息
- **学科分组**: 按科目对教材进行分类
- **练习生成**: 调用后端 API 生成每日练习
- **状态管理**: 使用共享状态管理练习数据

#### 数据流
```
用户已选教材 → API 调用生成练习 → 学科分组展示 → 用户选择练习 → 跳转会话页面
```

---

### 3.2 单元练习 (`/practice/unit`)

#### 功能定位
针对教材特定单元的专项练习，提供精准的知识点巩固。

#### 主要功能模块

##### 3.2.1 教材选择器 (`TextbookTabs`)
```typescript
interface TextbookTab {
  textbook: Textbook;
  units: Unit[];
  hasPractice: boolean;
}

// 核心功能
- 按学科分组展示教材
- 动态标签切换
- 教材基本信息展示
- 练习可用性检测
```

##### 3.2.2 单元管理 (`TextbookUnits`)
```typescript
interface UnitCard {
  unit: Unit;
  practiceStatus: 'waiting' | 'generating' | 'in_progress' | 'completed';
  practiceSession?: PracticeSession;
}

// 组件功能
- 教材单元列表展示
- 单元练习状态检测
- 练习进度跟踪
- 单元信息详情展示
```

##### 3.2.3 练习卡片 (`UnitPracticeCard`)
支持多种状态的卡片展示：

**等待状态卡片 (`WaitCard`)**
- 显示单元名称和知识点数量
- "开始练习" 按钮
- 单元基本信息展示

**生成中状态卡片 (`GeneratingCard`)**
- 显示生成进度动画
- "正在生成练习" 提示
- 禁用交互状态

**进行中状态卡片 (`InProgressCard`)**
- 显示练习进度信息
- "继续练习" 按钮
- 已完成题目数量统计

##### 3.2.4 知识点详情 (`KnowledgeModal`)
```typescript
interface KnowledgePoint {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  importance: number;
}

// 模态框功能
- 知识点详细信息展示
- 难度和重要性评级
- 相关知识点推荐
- 关闭和查看练习操作
```

##### 3.2.5 练习确认 (`ConfirmModal`)
```typescript
interface ConfirmModalProps {
  unit: Unit;
  onConfirm: () => void;
  onCancel: () => void;
}

// 确认功能
- 练习信息确认
- 题目数量预估
- 预计时长提示
- 确认/取消操作
```

#### 状态管理
使用 `useUnitPracticeStore` 管理单元练习相关状态：
```typescript
interface UnitPracticeStoreState {
  loading: boolean;
  textbooks: Textbook[];
  selectedTextbook: Textbook | null;
  units: Unit[];
  practiceSessions: Record<number, PracticeSession>;
  generating: boolean;

  // Actions
  loadTextbooks: () => Promise<void>;
  selectTextbook: (textbook: Textbook) => void;
  createPractice: (unitId: number) => Promise<void>;
  refreshStatus: () => Promise<void>;
}
```

#### 业务流程
1. **教材选择**: 用户选择要练习的教材
2. **单元浏览**: 查看该教材的所有单元
3. **知识点预览**: 了解单元包含的知识点
4. **练习创建**: 确认后创建练习会话
5. **跳转答题**: 自动跳转到练习会话页面

---

### 3.3 练习会话 (`/practice/session/:sessionId`)

#### 功能定位
统一的核心答题界面，支持多种题型和智能答题体验。

#### 核心架构设计

##### 3.3.1 状态管理层 (`session-store.ts`)
这是整个练习系统的核心状态管理，包含完整的会话生命周期管理：

```typescript
interface SessionStoreState {
  // === 基础状态 ===
  loading: boolean;                    // 加载状态
  session: PracticeSession | null;     // 练习会话信息
  questions: Question[];               // 题目列表
  currentQuestionIndex: number;        // 当前题目索引

  // === 答案状态 ===
  userAnswers: Record<number, string>;     // 文本答案 (questionId -> answer)
  audioAnswers: Record<number, string>;    // 音频答案 (questionId -> OSS路径)
  audioAnalysis: Record<number, UploadRecordingResult>; // 音频分析结果
  answerStatus: Record<number, AnswerStatus>; // 答案状态 (0-未答, 1-正确, 2-错误)

  // === 时间管理 ===
  startTime: number;                   // 当前题目开始时间
  submitting: boolean;                 // 提交状态
  report: PracticeReport | null;       // 练习报告

  // === 核心操作 ===
  loadSession: (sessionId: number) => Promise<void>;
  beginPractice: () => Promise<void>;
  setAnswer: (questionId: number, answer: string) => void;
  setAudioAnswer: (questionId: number, audioBase64: string) => void;
  submitCurrentAnswer: () => Promise<SubmitAnswerResponse>;
  goPrev: () => void;
  goNext: () => void;
  completePractice: () => Promise<void>;
}
```

##### 3.3.2 派生状态选择器
提供高效的派生状态计算：
```typescript
// 当前题目
export const useCurrentQuestion = () => {
  return useSessionStore((state) => {
    if (state.questions.length === 0) return null;
    return state.questions[state.currentQuestionIndex] || null;
  });
};

// 总题数
export const useTotalQuestions = () => {
  return useSessionStore((state) => state.questions.length);
};

// 已答题数
export const useAnsweredCount = () => {
  return useSessionStore((state) => {
    return Object.values(state.answerStatus).filter(
      (status) => status !== undefined && status !== 0
    ).length;
  });
};

// 当前答案状态
export const useCurrentAnswerStatus = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return undefined;
    return state.answerStatus[currentQuestion.id];
  });
};
```

##### 3.3.3 会话加载和恢复机制
```typescript
loadSession: async (sessionId: number) => {
  try {
    set({ loading: true });

    // 获取会话详情
    const detail = await studentApi.getSessionDetail(sessionId);
    const { session, questions, answers, report } = detail;

    // 恢复已提交的答案
    const restoredAnswers: Record<number, string> = {};
    const restoredAudioAnswers: Record<number, string> = {};
    const restoredStatus: Record<number, AnswerStatus> = {};

    if (answers && answers.length > 0) {
      answers.forEach((answer: PracticeAnswer) => {
        if (answer.text_answer) {
          restoredAnswers[answer.question_id] = answer.text_answer;
        }
        if (answer.audio_answer) {
          restoredAudioAnswers[answer.question_id] = answer.audio_answer;
        }
        if (answer.status !== undefined) {
          restoredStatus[answer.question_id] = answer.status as AnswerStatus;
        }
      });
    }

    // 找到第一个未回答的题目
    let firstUnansweredIndex = 0;
    if (questions && questions.length > 0) {
      const index = questions.findIndex(
        (q: Question) => restoredStatus[q.id] === undefined || restoredStatus[q.id] === 0
      );
      if (index !== -1) {
        firstUnansweredIndex = index;
      }
    }

    set({
      session,
      questions: questions || [],
      userAnswers: restoredAnswers,
      audioAnswers: restoredAudioAnswers,
      answerStatus: restoredStatus,
      currentQuestionIndex: firstUnansweredIndex,
      report: report || null,
      startTime: Date.now(),
      loading: false,
    });
  } catch (error) {
    console.error("Failed to load session:", error);
    set({ loading: false });
    throw error;
  }
}
```

##### 3.3.4 视图层架构 (`views/`)

**LoadingView** - 加载状态视图
```typescript
const LoadingView = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">正在加载练习内容...</p>
    </div>
  </div>
);
```

**StartPanel** - 开始练习面板
```typescript
const StartPanel = ({ session, onStart }: StartPanelProps) => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold mb-4">准备开始练习</h2>
    <p className="text-muted-foreground mb-6">
      共 {session.question_count} 道题目，预计需要 {Math.ceil(session.question_count * 2)} 分钟
    </p>
    <Button onClick={onStart} size="lg">
      开始练习
    </Button>
  </div>
);
```

**QuestionStep** - 答题界面 (核心组件)
```typescript
const QuestionStep = () => {
  const currentQuestion = useCurrentQuestion();
  const currentAnswer = useCurrentAnswer();
  const hasAnswered = useHasAnsweredCurrent();
  const submitting = useSessionStore((state) => state.submitting);

  const handleSubmit = async () => {
    try {
      await submitCurrentAnswer();
      toast.success("答案提交成功");
    } catch (error) {
      toast.error("提交答案失败，请重试");
    }
  };

  return (
    <div className="space-y-6">
      {/* 题目头部信息 */}
      <QuestionHeader
        index={currentQuestionIndex}
        type={currentQuestion.type}
        difficulty={currentQuestion.difficulty}
        knowledge={currentQuestion.knowledge}
        answerStatus={currentAnswerStatus}
      />

      {/* 题目内容 */}
      <QuestionContent
        content={currentQuestion.content}
        answerStatus={currentAnswerStatus}
      />

      {/* 题目资源 (图片/音频) */}
      <QuestionResource
        resource={currentQuestion.resource}
        resourceType={currentQuestion.resource_type}
      />

      {/* 答题区域 - 根据题型渲染不同组件 */}
      <AnswerPanel
        question={currentQuestion}
        value={currentAnswer}
        disabled={hasAnswered || submitting}
        onChange={handleAnswerChange}
      />

      {/* 提交和导航按钮 */}
      <NavigationButtons
        onSubmit={handleSubmit}
        submitting={submitting}
        hasAnswered={hasAnswered}
        canGoPrev={currentQuestionIndex > 0}
        canGoNext={currentQuestionIndex < questions.length - 1}
        onPrev={() => goPrev()}
        onNext={() => goNext()}
      />
    </div>
  );
};
```

**ResultView** - 结果展示
```typescript
const ResultView = ({ session, report, onViewReport }: ResultViewProps) => (
  <div className="text-center py-12">
    <div className="mb-6">
      <div className="text-4xl font-bold text-green-600 mb-2">
        练习完成！
      </div>
      <p className="text-muted-foreground">
        正确率：{Math.round((session.correct_count / session.question_count) * 100)}%
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard label="总题数" value={session.question_count} />
      <StatCard label="正确数" value={session.correct_count} />
      <StatCard label="用时" value={`${Math.round(session.total_time / 60)}分钟`} />
      <StatCard label="得分" value={report?.total_score || 0} />
    </div>

    <Button onClick={onViewReport} size="lg">
      查看详细报告
    </Button>
  </div>
);
```

##### 3.3.5 题目组件系统 (`components/question/`)

**QuestionHeader** - 题目头部组件
```typescript
interface QuestionHeaderProps {
  index: number;              // 题号
  type: string;               // 题型
  difficulty?: string;        // 难度
  knowledge?: string;         // 知识点
  answerStatus?: number;      // 答案状态
}

// 功能特性
- 题号圆形展示 (1, 2, 3...)
- 题型标签 (选择题、判断题、文本题、口语题)
- 难度等级标签 (简单、中等、困难)
- 知识点信息展示
- 答案状态徽章 (✓ 正确 / ✗ 错误)
```

**QuestionContent** - 题目内容组件
```typescript
interface QuestionContentProps {
  content: string;           // 题目文本内容
  answerStatus?: number;     // 答案状态 (用于颜色变化)
}

// 功能特性
- 支持多行文本和格式化
- 根据答题状态变化颜色 (正确-绿色，错误-红色)
- 响应式文字大小
- 优雅的排版和间距
```

**QuestionResource** - 题目资源组件
```typescript
interface QuestionResourceProps {
  resource?: string;         // 资源文件路径
  resourceType?: string;     // 资源类型 (image/audio)
}

// 功能特性
- 图片资源展示 (120x120px，圆角，阴影)
- 音频资源播放 (集成 AudioPlayer 组件)
- 资源 URL 解析和处理
- 优雅的布局和间距
```

##### 3.3.6 答题组件系统 (`components/answer/`)

**多题型支持架构**
```typescript
type QuestionType = "选择题" | "判断题" | "文本题" | "口语题";

interface AnswerPanelProps {
  question: Question;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const AnswerPanel: FC<AnswerPanelProps> = ({ question, value, disabled, onChange }) => {
  switch (question.type) {
    case "选择题":
      return <MultipleChoice options={question.options} value={value} onChange={onChange} disabled={disabled} />;
    case "判断题":
      return <TrueFalse value={value} onChange={onChange} disabled={disabled} />;
    case "文本题":
      return <TextInput value={value} onChange={onChange} disabled={disabled} />;
    case "口语题":
      return <AudioInput value={value} onChange={onChange} disabled={disabled} />;
    default:
      return <div>不支持的题型</div>;
  }
};
```

**AudioInput** - 口语题录音输入组件
```typescript
interface AudioInputProps {
  value?: string;                    // OSS 存储路径
  disabled?: boolean;
  hasAnswered?: boolean;
  onChange: (answer: string, audioOssPath: string, analysis: UploadRecordingResult) => void;
  maxDuration?: number;              // 最大录音时长
}

// 核心功能流程
1. 用户点击录音按钮 → 开始录音
2. 录音过程中显示计时器和动画
3. 达到最大时长或用户停止 → 结束录音
4. 音频上传到 OSS 并进行 AI 分析
5. 返回转录文本和分析结果
6. 更新答案状态和显示成功提示
```

**AudioRecorder** - 录音组件
```typescript
interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  maxDuration?: number;
}

// 技术实现
- 使用 MediaRecorder API 录制音频
- WebM 格式音频输出
- 实时计时显示 (MM:SS 格式)
- 最大时长自动停止
- 录音状态可视化 (脉冲动画)
- 麦克风权限检查和错误处理
```

##### 3.3.7 答题业务逻辑

**答案提交流程**
```typescript
submitCurrentAnswer: async () => {
  const {
    session,
    questions,
    currentQuestionIndex,
    userAnswers,
    audioAnswers,
    audioAnalysis,
    startTime,
  } = get();

  // 1. 数据验证
  if (!session || !questions || questions.length === 0) {
    throw new Error("会话或题目不存在");
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    throw new Error("当前题目不存在");
  }

  const answer = userAnswers[currentQuestion.id];
  const audioOssPath = audioAnswers[currentQuestion.id];

  // 2. 答案验证
  if (currentQuestion.type === "口语题" && !audioOssPath) {
    throw new Error("请先录音");
  }
  if (currentQuestion.type !== "口语题" && !answer) {
    throw new Error("请先选择答案");
  }

  try {
    set({ submitting: true });

    // 3. 计算答题时间
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // 4. 构建提交参数
    const submitParams = {
      session_id: session.id,
      question_id: currentQuestion.id,
      answer: answer || "",
      time_spent: timeSpent,
      is_audio_answer: !!audioOssPath,
      audio_data: audioOssPath,
    };

    // 5. 调用 API 提交答案
    const result = await studentApi.submitAnswer(submitParams);

    // 6. 更新本地状态
    set((state) => ({
      answerStatus: {
        ...state.answerStatus,
        [currentQuestion.id]: result.is_correct ? 1 : 2,
      },
      session: state.session && progress ? {
        ...state.session,
        answer_count: progress.answer_count,
        correct_count: progress.correct_count,
        status: progress.status,
      } : state.session,
      startTime: Date.now(), // 重置开始时间
    }));

    return result;
  } catch (error) {
    console.error("Failed to submit answer:", error);
    throw error;
  } finally {
    set({ submitting: false });
  }
}
```

**题目导航逻辑**
```typescript
// 上一题
goPrev: () => {
  const { currentQuestionIndex } = get();
  if (currentQuestionIndex > 0) {
    set({
      currentQuestionIndex: currentQuestionIndex - 1,
      startTime: Date.now(),
    });
  }
},

// 下一题
goNext: () => {
  const { currentQuestionIndex, questions } = get();
  if (currentQuestionIndex < questions.length - 1) {
    set({
      currentQuestionIndex: currentQuestionIndex + 1,
      startTime: Date.now(),
    });
  }
}
```

##### 3.3.8 答题状态流转图
```
会话加载 → 开始练习 → 答题循环 → 它成练习 → 查看报告
    ↓           ↓          ↓          ↓          ↓
[加载中] → [未开始] → [进行中] → [已完成] → [报告页]
    ↓           ↓          ↓          ↓          ↓
 Loading → Start → Question → Result → Report
```

##### 3.3.9 性能优化特性

**状态优化**
- Zustand 轻量级状态管理，避免不必要的重渲染
- 选择器模式，只订阅需要的状态片段
- 记忆化组件 (`React.memo`) 避免重复渲染

**数据缓存**
- 答案本地缓存，支持断点续传
- 会话状态持久化，刷新页面不丢失进度
- API 响应缓存，减少重复请求

**用户体验优化**
- 答题状态实时保存
- 流畅的页面过渡动画
- 友好的加载和错误状态
- 响应式设计适配多设备

---

### 4. 学习数据分析模块

### 4.1 练习历史 (`/practice/history`)

#### 功能定位
为学生提供完整的练习历史记录，支持按类型分类查看。

#### 主要功能模块

##### 4.1.1 分类标签页
```typescript
type PracticeSessionType = "daily" | "unit" | "assessment";

interface TabConfig {
  key: PracticeSessionType;
  label: string;
  icon: ReactNode;
  component: ReactNode;
}

// 标签页配置
const tabs: TabConfig[] = [
  {
    key: "daily",
    label: "每日练习",
    icon: <BookOpen className="h-4 w-4" />,
    component: <DailyHistory />
  },
  {
    key: "unit",
    label: "单元练习",
    icon: <Target className="h-4 w-4" />,
    component: <UnitHistory />
  },
  {
    key: "assessment",
    label: "综合评估",
    icon: <ChartBar className="h-4 w-4" />,
    component: <AssessmentHistory />
  }
];
```

##### 4.1.2 会话卡片组件
```typescript
interface SessionCardProps {
  session: PracticeSession;
  onViewDetail: (sessionId: number) => void;
  onViewReport: (sessionId: number) => void;
}

// 卡片信息展示
- 会话基本信息 (类型、创建时间、状态)
- 统计数据 (总题数、已答题、正确数)
- 进度可视化 (进度条、百分比)
- 操作按钮 (查看详情、查看报告)
- 状态标识 (进行中、已完成、已中断)
```

##### 4.1.3 数据结构
```typescript
interface PracticeSession {
  id: number;
  session_type: PracticeSessionType;  // daily/unit/assessment
  status: PracticeSessionStatus;      // 0-未开始 1-进行中 2-已完成
  create_time: string;                // 创建时间
  start_time?: string;                // 开始时间
  end_time?: string;                  // 结束时间
  question_count: number;             // 总题数
  answer_count: number;               // 已答题数
  correct_count: number;              // 正确题数
  total_time?: number;                // 总用时(秒)
  textbook?: Textbook;                // 关联教材
  unit?: Unit;                        // 关联单元(单元练习)
}
```

#### 交互设计
- **标签切换**: 平滑的标签页切换动画
- **加载状态**: 骨架屏和加载指示器
- **空状态**: 友好的无数据提示
- **响应式**: 适配不同屏幕尺寸的网格布局

---

### 4.2 练习详情 (`/practice/detail/:sessionId`)

#### 功能定位
展示练习会话的详细信息，包括题目列表、答案分析和继续练习功能。

#### 主要功能模块

##### 4.2.1 会话信息面板
```typescript
interface SessionInfoProps {
  session: PracticeSession;
  report?: PracticeReport;
}

// 展示内容
- 会话基本信息 (ID、类型、创建时间)
- 统计概览 (总题数、已答题、正确数、正确率)
- 用时统计 (总用时、平均每题用时)
- 能力评估 (当前能力等级、百分位排名)
```

##### 4.2.2 题目详情卡片
```typescript
interface QuestionAnswerCardProps {
  question: Question;
  answer?: PracticeAnswer;
  questionNumber: number;
  showActions?: boolean;
}

// 卡片内容
- 题目基本信息 (题号、题型、难度、知识点)
- 题目内容展示 (支持富文本和资源)
- 用户答案 vs 正确答案对比
- 答题状态 (正确/错误/未答)
- 用时统计和答题时间
- 操作按钮 (查看解析、重新答题)
```

##### 4.2.3 答案分析组件
```typescript
interface AnswerAnalysisProps {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

// 分析内容
- 答案正确性判断和展示
- 错误原因分析 (如果可用)
- 知识点关联和推荐
- 相似题目推荐
- 学习建议和改进方向
```

##### 4.2.4 继续练习功能
```typescript
const ContinuePractice = ({ session, onResume }: ContinuePracticeProps) => {
  const canResume = session.status === 1 && session.answer_count < session.question_count;

  if (!canResume) return null;

  return (
    <Button onClick={() => onResume(session.id)} size="lg" className="w-full">
      继续练习 ({session.question_count - session.answer_count} 题未完成)
    </Button>
  );
};
```

#### 技术实现
- **路由参数**: 使用 React Router 参数获取会话 ID
- **数据加载**: 异步加载会话详情和相关数据
- **错误处理**: 完善的错误处理和重试机制
- **响应式布局**: 适配不同设备的网格系统

---

### 4.3 练习报告 (`/practice/report/:sessionId`)

#### 功能定位
提供 AI 生成的详细学习报告，包含能力评估、知识分析和学习建议。

#### 主要功能模块

##### 4.3.1 报告概览
```typescript
interface ReportOverviewProps {
  report: PracticeReport;
  session: PracticeSession;
}

// 概览指标
- 总体得分 (0-100 分)
- 能力等级 (-3 到 +3 等级)
- 百分位排名 (相对于同龄人)
- 学习速度评估
- 学习一致性分析
- 进步趋势展示
```

##### 4.3.2 知识点分析
```typescript
interface KnowledgeAnalysisProps {
  knowledgePoints: KnowledgePointAnalysis[];
}

// 分析维度
- 知识点掌握度分布
- 薄弱知识点识别
- 强项知识点展示
- 知识点关联分析
- 学习优先级建议
```

##### 4.3.3 能力雷达图
```typescript
interface AbilityRadarProps {
  abilities: AbilityScore[];
}

// 能力维度
- 理解能力
- 应用能力
- 分析能力
- 综合能力
- 创新能力
- 记忆能力
```

##### 4.3.4 学习建议
```typescript
interface LearningSuggestionsProps {
  suggestions: LearningSuggestion[];
}

// 建议类型
- 薄弱环节强化建议
- 学习方法优化建议
- 练习频率调整建议
- 知识点复习建议
- 学习资源推荐
```

---

### 5. 用户管理模块

### 5.1 个人中心 (`/profile`)

#### 功能定位
展示和管理学生个人信息、教材设置和账户相关操作。

#### 主要功能模块

##### 5.1.1 用户信息展示
```typescript
interface UserInfoProps {
  student: Student;
}

// 展示内容
- 用户头像 (支持显示默认头像)
- 学生姓名
- 手机号码 (脱敏显示)
- 年级信息
- 注册时间
- 最后登录时间
```

##### 5.1.2 教材管理网格
```typescript
interface TextbookGridProps {
  textbooks: Textbook[];
  onManage?: () => void;
}

// 网格布局
- 3列响应式网格布局
- 教材封面和信息展示
- 学科分类和颜色标识
- 版本和年级信息
- 激活状态显示
- 管理操作入口
```

##### 5.1.3 退出登录功能
```typescript
const LogoutButton = () => {
  const handleLogout = () => {
    // 1. 清理本地状态
    authStore.logout();

    // 2. 清理本地存储
    localStorage.removeItem('_t');

    // 3. 跳转到登录页
    navigate('/login');

    // 4. 显示退出成功提示
    toast.success('已安全退出');
  };

  return (
    <Button variant="outline" onClick={handleLogout} className="w-full">
      退出登录
    </Button>
  );
};
```

#### 交互设计
- **卡片式布局**: 清晰的信息分组
- **响应式网格**: 适配不同屏幕尺寸
- **友好提示**: 空状态和操作反馈
- **安全设计**: 敏感信息脱敏显示

---

### 5.2 认证机制 (`auth-store.ts`)

#### 功能定位
管理用户认证状态、token 生命周期和路由访问控制。

#### 核心功能

##### 5.2.1 状态管理
```typescript
interface AuthStoreState {
  isAuthenticated: boolean;
  token: string | null;
  user: Student | null;

  // Actions
  setToken: (token: string) => void;
  logout: () => void;
  check: () => Promise<void>;
  setUser: (user: Student) => void;
}
```

##### 5.2.2 Token 管理
```typescript
// 设置 token
setToken: (token: string) => {
  localStorage.setItem('_t', token);
  set({ token, isAuthenticated: true });
},

// 清理 token
logout: () => {
  localStorage.removeItem('_t');
  set({ token: null, isAuthenticated: false, user: null });
},

// Token 验证
check: async () => {
  const token = localStorage.getItem('_t');
  if (!token) {
    set({ isAuthenticated: false });
    return;
  }

  try {
    // 调用后端 API 验证 token 有效性
    const user = await studentApi.checkToken();
    set({ token, isAuthenticated: true, user });
  } catch (error) {
    // Token 无效，清理状态
    localStorage.removeItem('_t');
    set({ token: null, isAuthenticated: false, user: null });
    throw error;
  }
}
```

##### 5.2.3 路由守卫集成
```typescript
// ProtectedRouteGuard 使用认证状态
const ProtectedRouteGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, check } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    check()
      .catch(() => navigate('/login'))
      .finally(() => setChecking(false));
  }, [check]);

  if (checking) {
    return <LoadingView />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

---

### 5.3 档案管理 (`profile-store.ts`)

#### 功能定位
管理学生档案信息、教材数据和学科分类。

#### 核心功能

##### 5.3.1 状态结构
```typescript
interface ProfileStoreState {
  student?: Student;
  textbooks?: Textbook[];
  activeTextbooks?: Textbook[];    // 当前年级教材
  subjects?: string[];             // 去重科目列表

  // Actions
  setProfile: (profile: Profile) => void;
  updateStudent: (student: Partial<Student>) => void;
  refreshTextbooks: () => Promise<void>;
}
```

##### 5.3.2 数据处理逻辑
```typescript
setProfile: (profile: Profile) => {
  const { student, textbooks } = profile;

  // 过滤当前年级教材
  const activeTextbooks = textbooks?.filter(
    book => book.grade === student?.grade
  ) || [];

  // 提取去重科目列表
  const subjects = Array.from(
    new Set(activeTextbooks.map(book => book.subject))
  ).sort();

  // 按科目和学期排序
  const sortedTextbooks = activeTextbooks.sort((a, b) => {
    const subjectOrder = { '语文': 1, '数学': 2, '英语': 3 };
    const semesterOrder = { '上学期': 1, '下学期': 2 };

    if (a.subject !== b.subject) {
      return (subjectOrder[a.subject as keyof typeof subjectOrder] || 99) -
             (subjectOrder[b.subject as keyof typeof subjectOrder] || 99);
    }

    return (semesterOrder[a.semester as keyof typeof semesterOrder] || 99) -
           (semesterOrder[b.semester as keyof typeof semesterOrder] || 99);
  });

  set({
    student,
    textbooks,
    activeTextbooks: sortedTextbooks,
    subjects,
  });
}
```

##### 5.3.3 数据同步
- **初始化加载**: 应用启动时自动加载用户档案
- **实时更新**: 教材选择后立即更新状态
- **错误恢复**: 加载失败时的重试机制
- **缓存策略**: 避免重复请求相同数据

---

## 状态管理架构

### 1. 全局状态设计

#### 1.1 Zustand 状态管理
采用轻量级状态管理库 Zustand，具有以下优势：
- **轻量级**: 小于 3KB，无额外依赖
- **TypeScript 友好**: 完整的类型推导
- **性能优化**: 选择器模式避免不必要的重渲染
- **简单易用**: 直观的 API 设计

#### 1.2 状态分层设计
```typescript
// 1. 认证状态 (auth-store.ts)
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: Student | null;
}

// 2. 档案状态 (profile-store.ts)
interface ProfileState {
  student?: Student;
  textbooks?: Textbook[];
  activeTextbooks?: Textbook[];
  subjects?: string[];
}

// 3. 会话状态 (session-store.ts)
interface SessionState {
  session: PracticeSession | null;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  answerStatus: Record<number, AnswerStatus>;
}

// 4. 单元练习状态 (unit-practice-store.ts)
interface UnitPracticeState {
  textbooks: Textbook[];
  selectedTextbook: Textbook | null;
  units: Unit[];
  practiceSessions: Record<number, PracticeSession>;
}
```

### 2. 选择器模式

#### 2.1 派生状态计算
```typescript
// 高效的派生状态示例
export const useAnsweredCount = () => {
  return useSessionStore((state) => {
    return Object.values(state.answerStatus).filter(
      (status) => status !== undefined && status !== 0
    ).length;
  });
};

export const useCurrentQuestion = () => {
  return useSessionStore((state) => {
    if (state.questions.length === 0) return null;
    return state.questions[state.currentQuestionIndex] || null;
  });
};
```

#### 2.2 性能优化
- **浅比较**: Zustand 自动进行浅比较优化
- **选择器缓存**: 避免重复计算派生状态
- **组件隔离**: 只订阅需要的状态片段
- **记忆化**: 结合 React.memo 使用

### 3. 状态持久化

#### 3.1 本地存储策略
```typescript
// Token 持久化
const setToken = (token: string) => {
  localStorage.setItem('_t', token);
  set({ token, isAuthenticated: true });
};

// 答案状态持久化 (在会话加载时恢复)
const restoreAnswers = (answers: PracticeAnswer[]) => {
  const restoredAnswers: Record<number, string> = {};
  const restoredAudioAnswers: Record<number, string> = {};
  const restoredStatus: Record<number, AnswerStatus> = {};

  answers.forEach((answer) => {
    if (answer.text_answer) {
      restoredAnswers[answer.question_id] = answer.text_answer;
    }
    if (answer.audio_answer) {
      restoredAudioAnswers[answer.question_id] = answer.audio_answer;
    }
    if (answer.status !== undefined) {
      restoredStatus[answer.question_id] = answer.status;
    }
  });

  set({
    userAnswers: restoredAnswers,
    audioAnswers: restoredAudioAnswers,
    answerStatus: restoredStatus,
  });
};
```

#### 3.2 数据同步机制
- **双向同步**: 本地状态 ↔ 后端数据
- **冲突解决**: 以服务器数据为准
- **增量更新**: 只同步变更的数据
- **错误恢复**: 同步失败时的回滚机制

## API 集成架构

### 1. 共享 API 客户端

#### 1.1 基础配置
```typescript
// 使用 workspace 共享包
import { studentApi } from "@ai-education/shared-student";

// 自动 token 管理
// 统一错误处理
// 请求/响应拦截
// 超时控制 (10分钟)
```

#### 1.2 核心 API 接口
```typescript
// 认证相关
studentApi.login(credentials)           // 用户登录
studentApi.checkToken()                 // Token 验证
studentApi.logout()                     // 用户登出

// 档案管理
studentApi.getProfile()                 // 获取用户档案
studentApi.updateProfile(profile)       // 更新用户档案

// 练习系统
studentApi.createDailyPractice()        // 创建每日练习
studentApi.createUnitPractice(unitId)   // 创建单元练习
studentApi.getSessionDetail(sessionId)  // 获取会话详情
studentApi.beginPractice(sessionId)     // 开始练习
studentApi.submitAnswer(params)         // 提交答案
studentApi.completePractice(sessionId)  // 完成练习

// 学习分析
studentApi.getPracticeHistory(type)     // 获取练习历史
studentApi.getPracticeReport(sessionId) // 获取练习报告
studentApi.getWrongRecords()            // 获取错题记录
```

### 2. 请求状态管理

#### 2.1 统一请求处理
```typescript
// 使用 useRequest Hook 管理异步请求
const { loading, error, data, run } = useRequest(
  () => studentApi.getSessionDetail(sessionId),
  {
    manual: true,
    onSuccess: (data) => {
      // 处理成功响应
      console.log('Session loaded:', data);
    },
    onError: (error) => {
      // 处理错误响应
      toast.error('加载会话失败');
    },
  }
);
```

#### 2.2 错误处理策略
- **全局错误拦截**: API 客户端统一处理
- **友好错误提示**: 用户可理解的错误信息
- **自动重试**: 网络错误时的重试机制
- **降级处理**: 部分功能不可用时的备选方案

### 3. 数据缓存策略

#### 3.1 内存缓存
```typescript
// 使用 React Query 或自定义缓存
const cachedData = useMemo(() => {
  return expensiveCalculation(rawData);
}, [rawData]);

// 本地状态缓存
const [profile, setProfile] = useState<Profile | null>(() => {
  // 初始化时从缓存读取
  return loadFromCache('profile');
});
```

#### 3.2 持久化缓存
- **localStorage**: 用户 token 和设置
- **sessionStorage**: 临时会话数据
- **IndexedDB**: 大量数据缓存 (如练习历史)

## 用户体验设计

### 1. 响应式设计

#### 1.1 断点系统
```typescript
// Tailwind CSS 断点
sm: 640px   // 小屏幕
md: 768px   // 中等屏幕
lg: 1024px  // 大屏幕
xl: 1280px  // 超大屏幕
2xl: 1536px // 超超大屏幕
```

#### 1.2 布局适配
- **移动端优先**: 基础样式针对移动设备设计
- **弹性布局**: 使用 Flexbox 和 Grid 实现自适应
- **响应式组件**: 根据屏幕尺寸调整组件行为
- **触摸优化**: 增大触摸目标，优化手势操作

### 2. 加载状态管理

#### 2.1 加载指示器
```typescript
// 骨架屏
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// 加载动画
const LoadingSpinner = () => (
  <Loader2 className="h-6 w-6 animate-spin" />
);
```

#### 2.2 乐观更新
```typescript
// 立即更新 UI，然后在后台同步
const handleAnswerSubmit = async (answer: string) => {
  // 乐观更新
  setAnswer(currentQuestion.id, answer);

  try {
    // 后台提交
    await submitAnswer(answer);
  } catch (error) {
    // 回滚更新
    setAnswer(currentQuestion.id, '');
    toast.error('提交失败，请重试');
  }
};
```

### 3. 交互反馈

#### 3.1 状态反馈
- **成功操作**: Toast 通知 + 绿色强调
- **错误提示**: 明确的错误信息 + 重试选项
- **进度指示**: 进度条 + 百分比显示
- **状态变化**: 颜色和图标变化

#### 3.2 动画效果
```typescript
// 页面过渡
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

// 微交互
const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
};
```

## 性能优化策略

### 1. 代码分割

#### 1.1 路由级别分割
```typescript
// 懒加载页面组件
const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const PracticeSession = lazy(() => import('@/pages/Practice/Session'));

// Suspense 边界
<Suspense fallback={<PageLoading />}>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/home" element={<Home />} />
    <Route path="/practice/session/:sessionId" element={<PracticeSession />} />
  </Routes>
</Suspense>
```

#### 1.2 组件级别分割
```typescript
// 动态导入大型组件
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

// 条件加载
{showHeavy && (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
)}
```

### 2. 渲染优化

#### 2.1 记忆化组件
```typescript
// 使用 React.memo 避免不必要的重渲染
const QuestionCard = React.memo<QuestionCardProps>(({ question, answer }) => {
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.question.id === nextProps.question.id &&
         prevProps.answer === nextProps.answer;
});
```

#### 2.2 回调函数优化
```typescript
// 使用 useCallback 缓存函数
const handleSubmit = useCallback(async () => {
  await submitAnswer();
  toast.success('答案提交成功');
}, [submitAnswer]);

// 使用 useMemo 缓存计算结果
const processedData = useMemo(() => {
  return expensiveCalculation(rawData);
}, [rawData]);
```

### 3. 资源优化

#### 3.1 图片优化
```typescript
// 懒加载图片
const LazyImage = ({ src, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} {...props}>
      {loaded && <img src={src} alt={alt} />}
    </div>
  );
};
```

#### 3.2 音频优化
```typescript
// 音频预加载和缓存
const useAudioCache = () => {
  const cache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const preloadAudio = useCallback((url: string) => {
    if (!cache.current.has(url)) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      cache.current.set(url, audio);
    }
    return cache.current.get(url)!;
  }, []);

  return { preloadAudio };
};
```

## 安全机制

### 1. 认证安全

#### 1.1 Token 管理
```typescript
// Token 存储安全
const setToken = (token: string) => {
  // 使用 localStorage 而非 cookie，避免 CSRF 攻击
  localStorage.setItem('_t', token);

  // 设置 Token 过期检查
  const payload = parseJWT(token);
  if (payload.exp) {
    const expiresIn = payload.exp * 1000 - Date.now();
    setTimeout(() => {
      logout(); // 自动登出
    }, expiresIn);
  }
};
```

#### 1.2 请求安全
```typescript
// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('_t');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 添加请求时间戳，防止重放攻击
  config.headers['X-Request-Time'] = Date.now().toString();

  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，自动登出
      logout();
      navigate('/login');
    }
    return Promise.reject(error);
  }
);
```

### 2. 数据安全

#### 2.1 输入验证
```typescript
// 前端输入验证
const validateInput = (value: string, type: 'phone' | 'text' | 'answer') => {
  switch (type) {
    case 'phone':
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(value);
    case 'text':
      // XSS 防护
      return !/<script|javascript:|on\w+=/i.test(value);
    case 'answer':
      // 答案内容清理
      return value.trim().slice(0, 1000); // 长度限制
    default:
      return true;
  }
};
```

#### 2.2 敏感信息保护
```typescript
// 敏感信息脱敏
const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 避免在控制台输出敏感信息
const safeLog = (data: any) => {
  if (data.token || data.password) {
    console.log('[REDACTED SENSITIVE DATA]');
  } else {
    console.log(data);
  }
};
```

## 测试策略

### 1. 单元测试

#### 1.1 组件测试
```typescript
// 组件渲染测试
describe('QuestionCard', () => {
  it('renders question content correctly', () => {
    const mockQuestion = {
      id: 1,
      content: 'Test question',
      type: '选择题',
      options: ['A', 'B', 'C', 'D']
    };

    render(<QuestionCard question={mockQuestion} />);

    expect(screen.getByText('Test question')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
```

#### 1.2 状态管理测试
```typescript
// Store 测试
describe('useSessionStore', () => {
  it('should update answer correctly', () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.setAnswer(1, 'A');
    });

    expect(result.current.userAnswers[1]).toBe('A');
  });
});
```

### 2. 集成测试

#### 2.1 API 集成测试
```typescript
// API 测试
describe('Student API', () => {
  it('should login successfully', async () => {
    const credentials = {
      phone: '13800138000',
      password: 'password123'
    };

    const result = await studentApi.login(credentials);

    expect(result.token).toBeDefined();
    expect(result.user.phone).toBe(credentials.phone);
  });
});
```

### 3. E2E 测试

#### 3.1 用户流程测试
```typescript
// 完整学习流程测试
describe('Learning Flow', () => {
  it('should complete daily practice flow', async () => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('[data-testid="phone-input"]', '13800138000');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // 2. 进入每日练习
    await page.click('[data-testid="daily-practice-card"]');

    // 3. 开始练习
    await page.click('[data-testid="start-practice"]');

    // 4. 回答问题
    await page.click('[data-testid="option-a"]');
    await page.click('[data-testid="submit-answer"]');

    // 5. 检查结果
    await expect(page.locator('[data-testid="result-view"]')).toBeVisible();
  });
});
```

## 部署和运维

### 1. 构建配置

#### 1.1 Rsbuild 配置
```typescript
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
    assetPrefix: process.env.NODE_ENV === 'production' ? '/cdn/' : '/',
  },
  performance: {
    removeConsole: process.env.NODE_ENV === 'production',
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:7890',
        changeOrigin: true,
      },
    },
  },
});
```

### 2. 环境配置

#### 2.1 环境变量
```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:7890
VITE_APP_NAME=AI教育学生端(开发)
VITE_ENABLE_MOCK=true

// .env.production
VITE_API_BASE_URL=https://api.ai-education.com
VITE_APP_NAME=AI教育学生端
VITE_ENABLE_MOCK=false
VITE_CDN_URL=https://cdn.ai-education.com
```

### 3. 监控和日志

#### 3.1 错误监控
```typescript
// 错误边界
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 发送错误到监控服务
    errorReporting.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
}

// 性能监控
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'measure') {
      analytics.track('performance', {
        name: entry.name,
        duration: entry.duration,
      });
    }
  }
});

performanceObserver.observe({ entryTypes: ['measure'] });
```

## 总结

### 技术亮点

1. **现代化技术栈**: React 18 + TypeScript + Rsbuild 的现代前端技术组合
2. **智能化学习体验**: 集成阿里巴巴云 AI 服务，提供个性化学习推荐
3. **完善的状态管理**: Zustand 轻量级状态管理，性能优异
4. **优秀的用户体验**: 响应式设计、流畅动画、友好交互
5. **健壮的架构设计**: 模块化组件、清晰的数据流、完善的错误处理

### 业务价值

1. **个性化学习**: 基于用户数据的智能练习推荐和学习路径规划
2. **多维度评估**: 支持日常练习、单元练习、综合评估等多种学习模式
3. **实时反馈**: 即时的答题反馈和详细的学习分析报告
4. **错题管理**: 智能错题收集和分析，针对性薄弱环节强化
5. **学习效果追踪**: 完整的学习数据记录和进度跟踪系统

### 扩展性

1. **模块化架构**: 清晰的模块划分，便于功能扩展和维护
2. **组件化设计**: 高复用性的组件系统，提高开发效率
3. **类型安全**: 完整的 TypeScript 类型定义，减少运行时错误
4. **国际化支持**: 预留多语言支持框架
5. **主题系统**: 支持多种主题和个性化定制

这个学生端应用展现了一个现代化、智能化、人性化的在线学习平台，通过先进的技术架构和精心设计的用户体验，为学生提供高效、便捷、个性化的学习服务。

---

**文档版本**: v1.0
**最后更新**: 2025-12-05
**维护团队**: AI 教育平台开发团队