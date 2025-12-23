import { useDelete } from '@/hooks/useDelete';
import { ActionType } from '@ant-design/pro-components';
import { message } from 'antd';
import { useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<SavePracticePromptRequest>>();

  const { handleDelete, loading: deleteLoading } = useDelete(PracticeApi.deletePracticePrompt, {
    onSuccess: () => actionRef.current?.reload(),
  });

  // 打开新建表单
  const handleCreate = () => {
    setEditingId(null);
    setInitialValues(undefined);
    setModalOpen(true);
  };

  // 打开编辑表单
  const handleEdit = (id: number) => {
    setEditingId(id);
    setDataLoading(true);
    PracticeApi.getPracticePromptDetail(id)
      .then((data) => {
        setInitialValues({
          practice_slug: data.practice_slug,
          subject: data.subject,
          grade: data.grade,
          prompt_slug: data.prompt_slug,
        });
        setModalOpen(true);
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
    setModalOpen(false);
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
    modalOpen,
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
