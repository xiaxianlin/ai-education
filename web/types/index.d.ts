declare global {
  interface UserInfo {
    uid: string;
    username: string;
    phone: string;
  }

  interface InitialState {
    user?: UserInfo;
  }

  interface ListResult<T> {
    data?: T[];
    total?: number;
  }
}

export {};
