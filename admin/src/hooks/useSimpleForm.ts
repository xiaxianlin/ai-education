import { useState } from 'react';
import { Form } from 'antd';

export function useSimpleForm<Values, Entity>(options?: { onSubmit?: () => void }) {
  const [instance] = Form.useForm<Values>();
  const [item, setItem] = useState<Entity>();
  const [visible, setVisible] = useState(false);

  const showForm = (item?: Entity) => {
    setVisible(true);
    if (item) {
      instance.setFieldsValue({ ...item });
      setItem(item);
    }
  };

  const onCancel = () => {
    setItem(undefined);
    setVisible(false);
  };

  const onSubmit = () => {
    options?.onSubmit?.();
  };

  return {
    instance,
    edited: item,
    visible,
    showForm,
    onCancel,
    onSubmit,
  };
}
