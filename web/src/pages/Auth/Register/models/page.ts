import { useSendPhoneCode } from '@/hooks';
import { api } from '@/utils/api';
import { history } from '@umijs/max';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
export interface RegisterFormModel {
  account?: string;
  password?: string;
  phone?: string;
  code?: string;
}

export enum LoginType {
  Account = '1',
  Phone = '2',
}
const useContainer = () => {
  const [type, setType] = useState(LoginType.Phone);

  const send = useSendPhoneCode();

  const { runAsync: regsiter } = useRequest((values: RegisterFormModel) => api.post('/user/register', values), {
    manual: true,
    onSuccess: (res) => {
      if (res.ok) {
        history.replace('/login');
      } else {
        message.error(res.message);
      }
    },
    onError: () => message.error('登录失败'),
  });

  return {
    type,
    send,
    regsiter,
    setType,
  };
};

export const RegisterModel = createContainer(useContainer);
export const useRegisterModel = RegisterModel.useContainer;
