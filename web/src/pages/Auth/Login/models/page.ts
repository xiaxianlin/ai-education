import { useSendPhoneCode } from '@/hooks';
import { api } from '@/utils/api';
import { history, useModel } from '@umijs/max';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
export interface LoginFormModel {
  account?: string;
  password?: string;
}

export enum LoginType {
  Account = '1',
  Phone = '2',
}
const useContainer = () => {
  const { refresh } = useModel('@@initialState');
  const [type, setType] = useState(LoginType.Account);

  const send = useSendPhoneCode();

  const { run: login } = useRequest(
    (values: LoginFormModel) => api.post('/user/login', { type: Number(type), ...values }),
    {
      manual: true,
      onSuccess: (res) => {
        refresh();
        localStorage.setItem('token', res.data);
        history.replace('/');
      },
      onError: () => message.error('登录失败'),
    },
  );

  return {
    type,
    send,
    login,
    setType,
  };
};

export const LoginModel = createContainer(useContainer);
export const useLoginModel = LoginModel.useContainer;
