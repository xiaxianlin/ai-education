declare global {
  interface InitialState {
    manager?: Manager;
    configs?: Configs;
  }

  interface ListData<T> {
    data?: T[];
    total?: number;
  }

  interface ApiData<T = any> {
    code?: number;
    status?: number; // 兼容旧格式
    message?: string;
    data: T;
  }

  interface ListApiData<T = any> {
    code?: number;
    status?: number; // 兼容旧格式
    message?: string;
    data: ListData<T>;
  }

  interface Configs {
    subjects: string[];
    textbook_versions: string[];
    semesters: string[];
    question_types: Record<string, string[]>;
    question_subtypes?: Record<string, string[]>;
    difficulty_levels: string[];
  }

  interface SearchParams {
    page?: number;
    size?: number;
    sort?: string;
    order?: string;
    keywords?: string;
  }
}

export {};
