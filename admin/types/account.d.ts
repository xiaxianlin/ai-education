import { AccountType } from '@/pages/Account/constants';

declare global {
  interface Account {
    id: string;
    username: string;
    type: AccountType;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface AccountForm {
    username: string;
    type: number;
  }

  interface AccountSearchParams {
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
