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

  // 生成图片
  const { runAsync: handleGenerateImage, loading: generatingImage } = useRequest(
    async () => {
      if (!id) return;
      await QuestionApi.generateQuestionImage(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('图片生成成功');
        refresh();
      },
      onError: (error: any) => {
        message.error(error?.message || '图片生成失败');
      },
    },
  );

  // 生成语音
  const { runAsync: handleGenerateAudio, loading: generatingAudio } = useRequest(
    async () => {
      if (!id) return;
      await QuestionApi.generateQuestionAudio(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('语音生成成功');
        refresh();
      },
      onError: (error: any) => {
        message.error(error?.message || '语音生成失败');
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
    generatingImage,
    generatingAudio,
    deleting,
    handleGenerateImage,
    handleGenerateAudio,
    handleDelete,
  };
};

export const QuestionDetailModel = createContainer(useContainer);
export const useQuestionDetailModel = QuestionDetailModel.useContainer;

