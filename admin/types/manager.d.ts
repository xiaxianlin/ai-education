import { ManagerType, ManagerStatus } from '@/pages/Account/constants';

declare global {
  interface Manager {
    id: string;
    username: string;
    type: ManagerType;
    status: ManagerStatus;
    create_time: number;
    update_time?: number;
  }

  interface CreateManagerForm {
    username: string;
    type: number;
  }

  interface ManagerSearchParams {
    keywords?: string;
    page_num: number;
    page_size: number;
  }

  interface ModifyPasswordForm {
    old_password: string;
    new_password: string;
  }
}

export {};
