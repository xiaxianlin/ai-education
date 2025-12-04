/**
 * 使用共享类型定义
 * 从 @ai-edu/shared-types 导入所有类型
 */

// 重新导出共享类型
export type {
  // 通用类型
  ApiResponse,
  PaginatedResponse,
  SearchParams,
  SearchResult,
  BaseEntity,
  Status,
  Gender,
  Subject,
  Grade,
  Semester,
  QuestionType,
  Difficulty,
  ResourceType,
  PracticeType,
  PracticeSessionStatus,
  PracticeGenerateStatus,
  AnswerStatus,

  // 用户相关
  Admin,
  LoginRequest,
  LoginResponse,
  Student,
  StudentLoginRequest,
  StudentLoginResponse,
  StudentProfile,
  StudentStatistics,

  // 教育内容
  Textbook,
  Unit,
  Knowledge,
  Question,
  QuestionOption,
  QuestionGroup,

  // 练习相关
  PracticeSession,
  CreatePracticeRequest,
  PracticeAnswer,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  WrongRecord,
  PracticeReport,
  AbilityAssessment,
  LearningStatistics,

  // 媒体文件
  MediaFile,
  AudioTranscription,
  AudioMatchAnalysis,
  AudioUploadResult,
  ImageGenerationRequest,
  ImageGenerationResult
} from '@ai-edu/shared-types';

// 为了兼容性，保留一些全局类型声明
declare global {
  // 兼容现有代码的全局类型访问
  type ApiData<T = unknown> = import('@ai-edu/shared-types').ApiResponse<T>;
}

export {};