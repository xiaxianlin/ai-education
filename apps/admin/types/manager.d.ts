import { ManagerType } from '@/constants/manager';

declare global {
  interface Manager {
    id: string;
    username: string;
    type: ManagerType;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface CreateManagerModel {
    username: string;
    password: string;
    type: number;
  }


  interface ModifyPasswordForm {
    old_password: string;
    new_password: string;
  }
}

export {};
