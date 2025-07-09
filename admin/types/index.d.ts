declare global {

  interface InitialState {
    user?: Account;
  }

  interface ListResult<T> {
    data?: T[];
    total?: number;
  }
}

export {};
