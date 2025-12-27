import { useDelete } from '@/hooks/useDelete';
import { ActionType } from '@ant-design/pro-components';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();

  const { handleDelete, loading: deleteLoading } = useDelete(PracticeApi.deletePracticePrompt, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const handleCreate = () => {
    navigate('/practice/prompt/form');
  };

  const handleEdit = (id: number) => {
    navigate(`/practice/prompt/form/${id}`);
  };

  const handleDetail = (id: number) => {
    navigate(`/practice/prompt/detail/${id}`);
  };

  return {
    actionRef,
    navigate,
    handleDelete,
    deleteLoading,
    handleCreate,
    handleEdit,
    handleDetail,
  };
};

export const PromptListModel = createContainer(useContainer);
export const usePromptListModel = PromptListModel.useContainer;
