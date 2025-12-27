import { useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();

  const { data: item, loading } = useRequest(() => QuestionApi.getQuestionTemplate(Number(id!)), {
    refreshDeps: [id],
    ready: !!id,
  });

  const { data: questionTypes } = useRequest(() => QuestionApi.listAllQuestionTypes(), {
    ready: !!id,
  });

  const questionType = questionTypes?.find((t) => t.id === item?.question_type_id);

  return {
    item,
    loading,
    questionType,
  };
};

export const QuestionTemplateDetailModel = createContainer(useContainer);
export const useQuestionTemplateDetailModel = QuestionTemplateDetailModel.useContainer;

