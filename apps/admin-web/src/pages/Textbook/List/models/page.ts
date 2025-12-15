import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const form = useSimpleForm<SaveTextbookRequest, Textbook>({
    service: async (values, item) => {
      if (item) {
        await adminApi.updateTextbook(item.id, values);
      } else {
        await adminApi.createTextbook(values);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  return {
    ...form,
    actionRef,
  };
};

export const TextbookListModel = createContainer(useContainer);
export const useTextbookListModel = TextbookListModel.useContainer;
