import { useState } from 'react';
import { Form } from 'antd';

export const useTextbookForm = (options?: { onSubmit?: () => void }) => {
  const [form] = Form.useForm();
  const [editId, setEditId] = useState<number>();
  const [visible, setVisible] = useState(false);

  const showForm = (item?: Textbook) => {
    setVisible(true);
    if (item) {
      form.setFieldsValue({ ...item });
      setEditId(item.id);
    }
  };

  const onCancel = () => {
    setEditId(undefined);
    setVisible(false);
  };

  const onSubmit = () => {
    options?.onSubmit?.();
  };
  return {
    form,
    editId,
    visible,
    showForm,
    onCancel,
    onSubmit,
  };
};
