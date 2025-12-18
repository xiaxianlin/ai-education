import { useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<SaveTeacherBookRequest, TeacherBook>({
    service: async (values, item) => {
      if (item) {
        await adminApi.updateTeacherBook(item.id, values);
      } else {
        await adminApi.createTeacherBook(values);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  const tableRequest = useCallback(async ({ pageSize, current, ...filter }: any) => {
    const data = await adminApi.searchTeacherBooks({
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
    formProps,
    actionRef,
    tableRequest,
  };
};

export const TeacherBookListModel = createContainer(useContainer);
export const useTeacherBookListModel = TeacherBookListModel.useContainer;
