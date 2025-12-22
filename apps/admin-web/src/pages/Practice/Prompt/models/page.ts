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
  const [initialValues, setInitialValues] = useState<Partial<SavePracticePromptRequest>>();

  const { handleDelete, loading: deleteLoading } = useDelete(
    PracticeApi.deletePracticePrompt,
    {
      onSuccess: () => actionRef.current?.reload(),
    }
  );

  // 打开新建表单
  const handleCreate = () => {
    setEditingId(null);
    setInitialValues(undefined);
    setDrawerOpen(true);
  };

  // 打开编辑表单
  const handleEdit = (id: number) => {
    setEditingId(id);
    setDataLoading(true);
    PracticeApi
      .getPracticePromptDetail(id)
      .then((data) => {
        setInitialValues({
          practice_type: 'daily_practice', // 默认值，实际应该从 data 中获取
          subject: data.subject,
          grade: data.grade,
          prompt_id: data.prompt?.id || 0, // 从关联的 prompt 中获取 id
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

  // 关闭抽屉
  const handleClose = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setInitialValues(undefined);
  };

  // 提交表单
  const handleSubmit = async (values: SavePracticePromptRequest) => {
    setFormLoading(true);
    try {
      if (editingId) {
        await PracticeApi.updatePracticePrompt(editingId, values);
        message.success('更新成功');
      } else {
        await PracticeApi.createPracticePrompt(values);
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

export const PracticePromptModel = createContainer(useContainer);
export const usePracticePromptModel = PracticePromptModel.useContainer;
