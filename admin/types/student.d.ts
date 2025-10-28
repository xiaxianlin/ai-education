export interface User {
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

export interface UserCreateSchema {
  username: string;
  password: string;
  nickname?: string;
  phone?: string;
  email?: string;
}

export interface UserUpdateSchema {
  nickname?: string;
  phone?: string;
  email?: string;
}

export interface UserSearchSchema {
  current_page?: number;
  page_size?: number;
  username?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  status?: number;
}