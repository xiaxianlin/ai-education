/**
 * 全局类型声明
 * 引用 shared-web 的统一类型，使类型全局可用
 */
import '@ai-education/shared-web/types';

// 确保全局类型可用
declare global {
  /**
   * 初始状态
   */
  interface InitialState {
    manager?: Manager;
    configs?: Configs;
  }
  /**
   * 配置信息
   */
  interface Configs {
    subjects: string[];
    textbook_versions: string[];
    semesters: string[];
    question_scenes: string[];
    difficulty_levels: string[];
    providers: string[];
  }

  interface LoginModel {
    username?: string;
    password?: string;
  }
}
