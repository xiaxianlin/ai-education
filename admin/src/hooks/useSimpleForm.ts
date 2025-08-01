import { useState } from 'react';
import { Form } from 'antd';

export function useSimpleForm<Values, Entity>(options?: { onSubmit?: () => void }) {
  const [form] = Form.useForm<Values>();
  const [editingItem, setEditingItem] = useState<Entity>();
  const [visible, setVisible] = useState(false);

  const showForm = (item?: Entity) => {
    setVisible(true);
    if (item) {
      form.setFieldsValue({ ...item });
      setEditingItem(item);
    }
  };

  const onCancel = () => {
    setEditingItem(undefined);
    setVisible(false);
  };

  const onSubmit = () => {
    options?.onSubmit?.();
  };

  return {
    form,
    editingItem,
    visible,
    showForm,
    onCancel,
    onSubmit,
  };
}
