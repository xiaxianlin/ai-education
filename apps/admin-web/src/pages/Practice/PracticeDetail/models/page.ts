import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 获取练习详情
  const { data: detail, loading } = useRequest(
    async () => {
      if (id) {
        return PracticeApi.getPractice(Number(id));
      }
      return null;
    },
    {
      refreshDeps: [id],
    },
  );

  const { runAsync: deletePractice, loading: deleting } = useRequest(
    async () => {
      if (!id) return;
      await PracticeApi.deletePractice(Number(id));
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        navigate('/practice');
      },
      onError: (error: any) => {
        message.error(error?.message || '删除失败');
      },
    },
  );

  const handleEdit = () => {
    navigate(`/practice/form/${id}`);
  };

  const handleBack = () => {
    navigate('/practice');
  };

  const handleDelete = () => {
    if (!detail) return;
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除练习"${detail.name}"吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: () => {
        deletePractice();
      },
    });
  };

  return {
    id,
    detail,
    loading,
    navigate,
    handleEdit,
    handleBack,
    deleting,
    handleDelete,
  };
};

export const PracticeDetailModel = createContainer(useContainer);
export const usePracticeDetailModel = PracticeDetailModel.useContainer;
