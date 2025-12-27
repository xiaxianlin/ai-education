import { useDelete } from '@/hooks/useDelete';
import { ActionType } from '@ant-design/pro-components';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();

  const { handleDelete, loading: deleteLoading } = useDelete(PracticeApi.deletePractice, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const handleCreate = () => {
    navigate('/practice/form');
  };

  const handleEdit = (id: number) => {
    navigate(`/practice/form/${id}`);
  };

  const handleDetail = (id: number) => {
    navigate(`/practice/detail/${id}`);
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

export const PracticeListModel = createContainer(useContainer);
export const usePracticeListModel = PracticeListModel.useContainer;
