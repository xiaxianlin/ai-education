import { useSendPhoneCode } from '@/hooks';
import { api } from '@/utils/api';
import { history, useModel } from '@umijs/max';
import { useRequest } from 'ahooks';
import { message } from 'antd';

export interface LoginFormModel {
  username?: string;
  password?: string;
}

export const useLogin = () => {
  const { refresh } = useModel('@@initialState');

  const send = useSendPhoneCode();

  const { runAsync: login } = useRequest((values: LoginFormModel) => api.post('/login', values), {
    manual: true,
    onSuccess: (res) => {
      if (!res.ok) {
        return;
      }
      refresh();
      localStorage.setItem('token', res.data);
      history.replace('/');
    },
  });

  return {
    send,
    login,
  };
};
