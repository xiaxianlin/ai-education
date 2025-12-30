import { useDelete } from '@/hooks';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';
import { useInitialStateModel } from '@/models/initialState';

const useContainer = () => {
  const actionRef = useRef<ActionType>();

  const { subject, grade } = useInitialStateModel();

  // 删除
  const { handleDelete } = useDelete(QuestionApi.deleteQuestionType, {
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

export const QuestionTypeModel = createContainer(useContainer);
export const useQuestionTypeModel = QuestionTypeModel.useContainer;
