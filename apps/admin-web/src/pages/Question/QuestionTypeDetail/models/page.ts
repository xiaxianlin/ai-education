import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: item, loading } = useRequest(() => QuestionApi.getQuestionType(Number(id!)), {
    refreshDeps: [id],
    ready: !!id,
  });

  const { runAsync: deleteQuestionType, loading: deleting } = useRequest(
    async () => {
      if (!id) return;
      await QuestionApi.deleteQuestionType(Number(id));
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        navigate('/question_type');
      },
      onError: (error: any) => {
        message.error(error?.message || '删除失败');
      },
    },
  );

  const handleDelete = () => {
    if (!item) return;
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除题型"${item.name}"吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: () => {
        deleteQuestionType();
      },
    });
  };

  return {
    item,
    loading,
    navigate,
    deleting,
    handleDelete,
  };
};

export const QuestionTypeDetailModel = createContainer(useContainer);
export const useQuestionTypeDetailModel = QuestionTypeDetailModel.useContainer;

