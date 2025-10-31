declare global {
  interface Student {
    id: string;
    name: string;
    phone: string;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface StudentForm {
    name: string;
    phone: string;
  }

  interface StudentUpdateForm {
    name?: string;
    phone?: string;
    status?: number;
  }

  interface StudentSearchParams extends SearchParams {
    phone?: string;
    status?: number;
  }

  // 兼容旧的Manager页面导入
  interface User {
    id: string;
    username: string;
    nickname?: string;
    avatar?: string;
    phone?: string;
    email?: string;
    status: number;
    created_at?: string;
    updated_at?: string;
  }

  interface UserCreateSchema {
    username: string;
    password: string;
    nickname?: string;
    phone?: string;
    email?: string;
  }

  interface UserUpdateSchema {
    nickname?: string;
    phone?: string;
    email?: string;
  }
}

export {};
