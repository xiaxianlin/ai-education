import { useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();

  const { data: item, loading } = useRequest(() => QuestionApi.getQuestionType(Number(id!)), {
    refreshDeps: [id],
    ready: !!id,
  });

  return {
    item,
    loading,
  };
};

export const QuestionTypeDetailModel = createContainer(useContainer);
export const useQuestionTypeDetailModel = QuestionTypeDetailModel.useContainer;

