import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useDelete } from '@/hooks/useDelete';
import { PromptApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();

  const { handleDelete, loading: deletePromptLoading } = useDelete(PromptApi.deletePrompt, {
    onSuccess: () => actionRef.current?.reload(),
  });

  return {
    actionRef,
    handleDelete,
    deletePromptLoading,
  };
};

export const PromptListModel = createContainer(useContainer);
export const usePromptListModel = PromptListModel.useContainer;
