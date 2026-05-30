import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { useRef, useState } from 'react';

type SimpleFormApi<Values> = {
  getFieldsValue: () => Partial<Values>;
  setFieldsValue: (values: Partial<Values>) => void;
  resetFields: () => void;
};

export function useSimpleForm<Values, Entity>(options?: {
  service?: (values: Values, item?: Entity) => Promise<void>;
  onSubmit?: () => void;
}) {
  const valuesRef = useRef<Partial<Values>>({});
  const [item, setItem] = useState<Entity>();
  const [visible, setVisible] = useState(false);

  const form: SimpleFormApi<Values> = {
    getFieldsValue: () => valuesRef.current,
    setFieldsValue: (values) => {
      valuesRef.current = { ...valuesRef.current, ...values };
    },
    resetFields: () => {
      valuesRef.current = {};
    },
  };

  const { runAsync: handleSubmit, loading } = useRequest(
    async (values: Values) => {
      if (options?.service) {
        await options.service(values, item);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success(item ? '更新成功' : '新增成功');
        setItem(undefined);
        setVisible(false);
        valuesRef.current = {};
        options?.onSubmit?.();
      },
      onError: (error: Error) => {
        toast.error(error.message || '提交失败');
      },
    },
  );

  const showForm = (nextItem?: Entity) => {
    setVisible(true);
    if (nextItem) {
      valuesRef.current = { ...(nextItem as Partial<Values>) };
      setItem(nextItem);
      return;
    }
    valuesRef.current = {};
    setItem(undefined);
  };

  const showCopyForm = (nextItem?: Entity) => {
    setVisible(true);
    valuesRef.current = nextItem ? { ...(nextItem as Partial<Values>) } : {};
    setItem(undefined);
  };

  const onCancel = () => {
    setItem(undefined);
    setVisible(false);
    valuesRef.current = {};
  };

  return {
    form,
    item,
    visible,
    loading,
    showForm,
    onCancel,
    showCopyForm,
    handleSubmit,
  };
}
