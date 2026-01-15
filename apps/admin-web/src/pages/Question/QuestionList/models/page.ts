import { useDelete, useSimpleForm } from '@/hooks';

import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const { subject, grade } = useInitialStateModel();

  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>();

  const { handleDelete } = useDelete(QuestionApi.deleteQuestion, {
    onSuccess: () => actionRef.current?.reload?.(),
  });

  const formProps = useSimpleForm<any, Question>({
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
    onSubmit: () => actionRef.current?.reload?.(),
  });

  const showDetail = (question: Question) => setCurrentQuestion(question);

  const closeDetail = () => setCurrentQuestion(undefined);

  useEffect(() => {
    actionRef.current?.reload?.();
  }, [subject, grade]);

  return {
    grade,
    subject,
    actionRef,
    currentQuestion,
    ...formProps,
    showDetail,
    closeDetail,
    handleDelete,
  };
};

export const QuestionListModel = createContainer(useContainer);
export const useQuestionListModel = QuestionListModel.useContainer;
