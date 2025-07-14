import { ManagerType, ManagerStatus } from '@/pages/Account/constants';

declare global {
  interface LoginModel {
    username?: string;
    password?: string;
  }

  interface ModifyPasswordModel {
    old_password: string;
    new_password: string;
  }
}

export {};
