import { api } from '@/utils/api';
import { useBoolean, useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
const useContainer = () => {
  const [device, setDevice] = useState<Device>();
  const [visible, { setTrue, setFalse }] = useBoolean(false);
  const [form] = Form.useForm();

  const { data, refresh, loading } = useRequest(() => api.get<Device[]>('/user/device/all'));

  const { runAsync: modify } = useRequest((values: RobotFormModel) => api.patch(`/user/robot/${device?.did}`, values), {
    manual: true,
    onSuccess: (res) => {
      if (res.ok) {
        refresh();
        message.success(`${device?.name}配置修改成功`);
      }
    },
  });

  const { run: modifyStatus } = useRequest((did: string, status: number) => api.patch(`/robot/${did}`, { status }), {
    manual: true,
    onSuccess: (res, [, status]) => {
      if (res.ok) {
        refresh();
        message.success(`${status ? '上线' : '下线'}成功`);
      }
    },
  });

  const edit = (device: Device) => {
    setTrue();
    setDevice(device);
    form.setFieldsValue(device.robot);
  };

  const hide = () => {
    setFalse();
    form.resetFields();
    setDevice(undefined);
  };

  const submit = async () => {
    if (!(await form.validateFields())) return;
    const values: RobotFormModel = form.getFieldsValue();
    await modify(values);
    hide();
  };

  return {
    data,
    form,
    loading,
    visible,
    hide,
    edit,
    submit,
    modifyStatus,
  };
};

export const DeviceListModel = createContainer(useContainer);
export const useDeviceListModel = DeviceListModel.useContainer;
