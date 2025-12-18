import { useState } from 'react';
import { Form } from 'antd';
import { useRequest } from 'ahooks';
import { useAntdApp } from '@/lib/antdApp';

export function useSimpleForm<Values, Entity>(options?: {
  service?: (values: Values, item?: Entity) => Promise<void>;
  onSubmit?: () => void;
}) {
  const { message } = useAntdApp();
  const [form] = Form.useForm<Values>();
  const [item, setItem] = useState<Entity>();
  const [visible, setVisible] = useState(false);

  const { runAsync: handleSubmit } = useRequest(
    async (values: Values) => {
      if (options?.service) {
        await options.service(values, item);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(item ? '更新成功' : '新增成功');
        setItem(undefined);
        setVisible(false);
        options?.onSubmit?.();
      },
    },
  );

  const showForm = (item?: Entity) => {
    setVisible(true);
    if (item) {
      form.setFieldsValue({ ...item });
      setItem(item);
    }
  };

  const showCopyForm = (item?: Entity) => {
    setVisible(true);
    if (item) {
      form.setFieldsValue({ ...item });
    }
  };

  const onCancel = () => {
    setItem(undefined);
    setVisible(false);
  };

  return {
    form,
    item,
    visible,
    showForm,
    onCancel,
    showCopyForm,
    handleSubmit,
  };
}
