import { useDelete } from '@/hooks';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';
import { useInitialStateModel } from '@/models/initialState';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const { subject, grade } = useInitialStateModel();

  const { handleDelete } = useDelete(QuestionApi.deleteQuestion, {
    onSuccess: () => actionRef.current?.reload?.(),
  });

  useEffect(() => {
    actionRef.current?.reload?.();
  }, [subject, grade, actionRef]);

  return {
    actionRef,
    subject,
    grade,
    handleDelete,
  };
};

export const QuestionListModel = createContainer(useContainer);
export const useQuestionListModel = QuestionListModel.useContainer;
