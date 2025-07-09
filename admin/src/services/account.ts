import { api } from '@/utils/api';

export const searchAccount = (params: AccountSearchParams) => {
  return api.get<ListResult<Account>>('/manager/search', params);
};

export const createAccount = (params: AccountForm) => {
  return api.post('/manager/add', params);
};

export const modifyAccountStatus = (id: string, value: number) => {
  return api.post('/manager/status', { id, status: value });
};

export const deleteAccount = (id: string) => {
  return api.post(`/manager/remove/${id}`);
};

export const modifyPassword = (id: string, data: ModifyPasswordForm) => {
  return api.post(`/modify_password`, { id, ...data });
};
