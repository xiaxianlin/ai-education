import { useCallback, useRef } from 'react';
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

  const tableRequest = useCallback(async ({ pageSize, current, ...filter }: any) => {
    const data = await adminApi.searchTextbooks({
      page: current || 1,
      size: pageSize || 10,
      ...filter,
    });
    return {
      data: data.data || [],
      success: true,
      total: data.total || 0,
    };
  }, []);

  return {
    ...form,
    actionRef,
    tableRequest,
  };
};

export const TextbookListModel = createContainer(useContainer);
export const useTextbookListModel = TextbookListModel.useContainer;
