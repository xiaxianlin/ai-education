declare global {
  interface InitialState {
    manager?: Manager;
  }

  interface ListResult<T> {
    data?: T[];
    total?: number;
  }

  interface ApiData<T = any> {
    data: T;
    message?: string;
    status?: number;
  }
}

export {};
