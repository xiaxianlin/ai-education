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
    data: T;
    message?: string;
    status?: number;
  }

  interface ListApiData<T = any> {
    data: ListData<T>;
    message?: string;
    status?: number;
  }

  interface Configs {
    subjects: string[];
    textbook_versions: string[];
    semesters: string[];
    question_types: string[];
  }
}

export {};
