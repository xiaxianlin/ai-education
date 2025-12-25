import { useDelete, useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { subject, grade } = useInitialStateModel();
  const [scene, setScene] = useState<string>();

  const { data, refresh } = useRequest(() => QuestionApi.searchQuestionTypes({ subject, grade, scene }), {
    refreshDeps: [subject, grade, scene],
  });

  const form = useSimpleForm<CreateQuestionTypeRequest, QuestionType>({
    service: async (values, item) => {
      if (item) {
        await QuestionApi.updateQuestionType(item.id, values);
      } else {
        await QuestionApi.createQuestionType({ ...values, subject, grade });
      }
    },
    onSubmit: refresh,
  });

  const { handleDelete } = useDelete(QuestionApi.deleteQuestionType, {
    onSuccess: () => refresh(),
  });

  return {
    ...form,
    data,
    grade,
    subject,
    scene,
    setScene,
    handleDelete,
  };
};

export const QuestionTypeListModel = createContainer(useContainer);
export const useQuestionTypeListModel = QuestionTypeListModel.useContainer;
