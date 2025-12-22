import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useDelete } from '@/hooks/useDelete';
import { PromptApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();

  const { handleDelete, loading: deleteLoading } = useDelete(PromptApi.deletePromptTestRecord, {
    onSuccess: () => actionRef.current?.reload(),
  });

  return {
    actionRef,
    handleDelete,
    deleteLoading,
  };
};

export const PromptTestRecordsModel = createContainer(useContainer);
export const usePromptTestRecordsModel = PromptTestRecordsModel.useContainer;

