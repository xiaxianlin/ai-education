import { modifyPassword } from '@/services/account';
import { history, useModel } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { createContainer } from 'unstated-next';
const useContainer = () => {
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm<ModifyPasswordForm>();

  const { runAsync } = useRequest(modifyPassword, {
    manual: true,
    ready: !!initialState?.user?.id,
    onSuccess: (res) => {
      if (!res.ok) return;
      message.success('修改成功');
      localStorage.removeItem('token');
      history.replace('/login');
    },
  });

  const modify = (values: any) => {
    return runAsync(initialState?.user?.id || '', values);
  };

  return { form, modify };
};

export const PasswordModel = createContainer(useContainer);
export const usePasswordModel = PasswordModel.useContainer;
