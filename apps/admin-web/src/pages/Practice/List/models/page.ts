import { useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { message } from 'antd';
import { useDelete } from '@/hooks/useDelete';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<Practice>>();

  const { handleDelete, loading: deleteLoading } = useDelete(
    PracticeApi.deletePractice,
    {
      onSuccess: () => actionRef.current?.reload(),
    }
  );

  const handleCreate = () => {
    setEditingId(null);
    setInitialValues({ type: 'custom' });
    setDrawerOpen(true);
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setDataLoading(true);
    PracticeApi
      .getPractice(id)
      .then((data) => {
        setInitialValues({
          name: data.name,
          slug: data.slug,
          icon: data.icon,
          description: data.description,
          type: data.type,
        });
        setDrawerOpen(true);
      })
      .catch(() => {
        message.error('加载数据失败');
      })
      .finally(() => {
        setDataLoading(false);
      });
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setInitialValues(undefined);
  };

  const handleSubmit = async (values: Practice) => {
    setFormLoading(true);
    try {
      if (editingId) {
        await PracticeApi.updatePractice(editingId, values);
        message.success('更新成功');
      } else {
        await PracticeApi.createPractice(values);
        message.success('创建成功');
      }
      handleClose();
      actionRef.current?.reload();
    } catch (error) {
      // error handled by interceptor
    } finally {
      setFormLoading(false);
    }
  };

  return {
    actionRef,
    handleDelete,
    deleteLoading,
    drawerOpen,
    editingId,
    formLoading: formLoading || dataLoading,
    initialValues,
    handleCreate,
    handleEdit,
    handleClose,
    handleSubmit,
  };
};

export const PracticeListModel = createContainer(useContainer);
export const usePracticeListModel = PracticeListModel.useContainer;
