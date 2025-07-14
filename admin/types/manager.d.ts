import { ManagerType, ManagerStatus } from '@/constants/manager';

declare global {
  interface Manager {
    id: string;
    username: string;
    type: ManagerType;
    status: ManagerStatus;
    create_time: number;
    update_time?: number;
  }

  interface CreateManagerModel {
    username: string;
    type: number;
  }

  interface ManagerSearchParams {
    keywords?: string;
    type?: ManagerType;
    status?: ManagerStatus;
    current_page?: number;
    page_size?: number;
  }

  interface ModifyPasswordForm {
    old_password: string;
    new_password: string;
  }
}

export {};
