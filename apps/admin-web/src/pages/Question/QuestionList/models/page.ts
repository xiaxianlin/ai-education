import { useDelete, useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { subject, grade } = useInitialStateModel();

  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((key) => key + 1);

  const formProps = useSimpleForm<
    {
      explanation?: string;
      content_raw: string;
      answer_raw: string;
    },
    Question
  >({
    service: async (values, item) => {
      if (!item?.id) return;

      let content = item.content;
      let answer = item.answer;

      try {
        content = JSON.parse(values.content_raw);
        answer = JSON.parse(values.answer_raw);
      } catch (e) {
        throw new Error('内容或答案 JSON 格式不正确');
      }

      await QuestionApi.updateQuestion(item.id, {
        content,
        answer,
        explanation: values.explanation,
      });
    },
    onSubmit: refresh,
  });

  const { handleDelete } = useDelete(QuestionApi.deleteQuestion, {
    onSuccess: refresh,
  });

  const showDetail = (question: Question) => setCurrentQuestion(question);

  const closeDetail = () => setCurrentQuestion(undefined);

  useEffect(() => {
    refresh();
  }, [subject, grade]);

  return {
    grade,
    subject,
    refreshKey,
    currentQuestion,
    ...formProps,
    showDetail,
    closeDetail,
    handleDelete,
  };
};

export const QuestionListModel = createContainer(useContainer);
export const useQuestionListModel = QuestionListModel.useContainer;
