import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 加载详情数据
  const {
    data: question,
    loading,
    refresh,
  } = useRequest(() => QuestionApi.getQuestion(id!), {
    ready: !!id,
    onError: () => {
      message.error('加载问题失败');
      navigate(-1);
    },
  });

  // 生成资源
  const { runAsync: handleGenerateResources, loading: generatingResources } = useRequest(
    async () => {
      if (!id) return;
      await QuestionApi.generateQuestionResources(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('资源生成成功');
        refresh();
      },
      onError: (error: any) => {
        message.error(error?.message || '资源生成失败');
      },
    },
  );

  // 删除题目
  const { runAsync: handleDelete, loading: deleting } = useRequest(
    async () => {
      if (!id) return;
      await QuestionApi.deleteQuestion(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        navigate('/question');
      },
      onError: (error: any) => {
        message.error(error?.message || '删除失败');
      },
    },
  );

  return {
    question,
    loading,
    navigate,
    generatingResources,
    deleting,
    handleGenerateResources,
    handleDelete,
  };
};

export const QuestionDetailModel = createContainer(useContainer);
export const useQuestionDetailModel = QuestionDetailModel.useContainer;

