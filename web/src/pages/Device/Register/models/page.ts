import { api } from '@/utils/api';
import { useNavigate } from '@umijs/max';
import { useBoolean, useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
const useContainer = () => {
  const [token, setToken] = useState<string>();
  const [visible, { setTrue, setFalse }] = useBoolean(false);
  const [form] = Form.useForm<RobotFormModel>();
  const navigate = useNavigate();

  const { runAsync } = useRequest((values: RobotFormModel) => api.post(`/user/robot`, { token, ...values }), {
    manual: true,
    ready: !!token,
    onSuccess: (res) => {
      if (res.ok) {
        message.success('设备注册成功');
        navigate('/device/my');
      } else {
        message.error(res.message);
      }
    },
  });

  const show = () => {
    if (!token) {
      message.warning('请输入注册码');
      return;
    }
    setTrue();
  };

  const hide = () => {
    setFalse();
    form.resetFields();
    setToken(undefined);
  };

  const submit = async () => {
    if (!(await form.validateFields())) return;
    const values: RobotFormModel = form.getFieldsValue();
    await runAsync(values);
    hide();
  };

  return {
    form,
    token,
    visible,
    show,
    hide,
    submit,
    setToken,
  };
};

export const DeviceRegisterModel = createContainer(useContainer);
export const useDeviceRegisterModel = DeviceRegisterModel.useContainer;
