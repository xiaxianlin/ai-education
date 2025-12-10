/**
 * 全局类型声明文件
 * 使所有类型在全局范围内可用，无需导入
 * 
 * 使用方法：在应用的入口文件中导入此文件
 * import '@ai-education/shared-web/types';
 */

import type * as CommonTypes from './common';
import type * as AdminTypes from './admin';
import type * as TextbookTypes from './textbook';
import type * as QuestionTypes from './question';
import type * as StudentTypes from './student';
import type * as PracticeTypes from './practice';
import type * as ServiceTypes from './service';

declare global {
  // ===== 通用类型 =====
  interface ApiResponse<T = unknown> extends CommonTypes.ApiResponse<T> {}
  interface ListData<T> extends CommonTypes.ListData<T> {}
  interface ListResponse<T = any> extends CommonTypes.ListResponse<T> {}
  interface PaginatedResponse<T> extends CommonTypes.PaginatedResponse<T> {}
  interface SearchParams extends CommonTypes.SearchParams {}
  interface Configs extends CommonTypes.Configs {}
  interface InitialState extends CommonTypes.InitialState {}
  interface Profile extends CommonTypes.Profile {}

  // ===== 管理端类型 =====
  interface Manager extends AdminTypes.Manager {}
  interface CreateManagerModel extends AdminTypes.CreateManagerModel {}
  interface LoginModel extends AdminTypes.LoginModel {}
  interface ModifyPasswordModel extends AdminTypes.ModifyPasswordModel {}

  // ===== 教材相关类型 =====
  interface Textbook extends TextbookTypes.Textbook {}
  interface TextbookSearchParams extends TextbookTypes.TextbookSearchParams {}
  interface TextbookForm extends TextbookTypes.TextbookForm {}
  interface TeacherBook extends TextbookTypes.TeacherBook {}
  interface TeacherBookSearchParams extends TextbookTypes.TeacherBookSearchParams {}
  interface TeacherBookForm extends TextbookTypes.TeacherBookForm {}
  interface Unit extends TextbookTypes.Unit {}
  interface UnitSearchParams extends TextbookTypes.UnitSearchParams {}
  interface UnitForm extends TextbookTypes.UnitForm {}
  interface UnitUpdateForm extends TextbookTypes.UnitUpdateForm {}
  interface Knowledge extends TextbookTypes.Knowledge {}
  interface KnowledgeSearchParams extends TextbookTypes.KnowledgeSearchParams {}
  interface KnowledgeForm extends TextbookTypes.KnowledgeForm {}
  interface KnowledgeUpdateForm extends TextbookTypes.KnowledgeUpdateForm {}
  interface TextbookContentForm extends TextbookTypes.TextbookContentForm {}

  // ===== 题目相关类型 =====
  interface Question extends QuestionTypes.Question {}
  interface QuestionCreateSchema extends QuestionTypes.QuestionCreateSchema {}
  interface QuestionUpdateForm extends QuestionTypes.QuestionUpdateForm {}
  interface QuestionSearchParams extends QuestionTypes.QuestionSearchParams {}

  // ===== 学生相关类型 =====
  interface Student extends StudentTypes.Student {}
  interface StudentForm extends StudentTypes.StudentForm {}
  interface StudentSearchParams extends StudentTypes.StudentSearchParams {}
  interface ResetPasswordResponse extends StudentTypes.ResetPasswordResponse {}
  interface SaveStudentSubjectSchema extends StudentTypes.SaveStudentSubjectSchema {}

  // ===== 练习相关类型 =====
  interface PracticeSession extends PracticeTypes.PracticeSession {}
  interface PracticeAnswer extends PracticeTypes.PracticeAnswer {}
  interface PracticeWrongRecord extends PracticeTypes.PracticeWrongRecord {}
  interface PracticeReport extends PracticeTypes.PracticeReport {}
  interface PracticeDetail extends PracticeTypes.PracticeDetail {}
  
  // 练习相关的类型别名
  type PracticeSessionStatus = PracticeTypes.PracticeSessionStatus;
  type PracticeGenerateStatus = PracticeTypes.PracticeGenerateStatus;
  type PracticeSessionType = PracticeTypes.PracticeSessionType;

  // ===== 服务相关类型 =====
  interface LoginParams extends ServiceTypes.LoginParams {}
  interface AnswerParams extends ServiceTypes.AnswerParams {}
  interface AnswerResponse extends ServiceTypes.AnswerResponse {}
  interface PracticeSessionDetail extends ServiceTypes.PracticeSessionDetail {}
  interface CompletePracticeResponse extends ServiceTypes.CompletePracticeResponse {}
  interface CreatePracticeTaskResponse extends ServiceTypes.CreatePracticeTaskResponse {}
  interface PracticeTaskStatusResponse extends ServiceTypes.PracticeTaskStatusResponse {}
  interface SubmitAnswerParams extends ServiceTypes.SubmitAnswerParams {}
  interface SubmitAnswerResponse extends ServiceTypes.SubmitAnswerResponse {}
  interface UploadRecordingResult extends ServiceTypes.UploadRecordingResult {}
  interface BeginPracticeResponse extends ServiceTypes.BeginPracticeResponse {}
  
  // 服务相关的类型别名
  type TaskStatus = ServiceTypes.TaskStatus;
}

export {};
