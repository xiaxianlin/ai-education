import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { useDelete, useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const [subject, setSubject] = useState('英语');
  const [grade, setGrade] = useState(1);
  const [scene, setScene] = useState<string>();

  const { data, refresh } = useRequest(() => adminApi.searchQuestionTypes({ subject, grade, scene }), {
    refreshDeps: [subject, grade, scene],
  });

  const form = useSimpleForm<CreateQuestionTypeRequest, QuestionType>({
    service: async (values, item) => {
      if (item) {
        await adminApi.updateQuestionType(item.id, values);
      } else {
        await adminApi.createQuestionType({ ...values, subject, grade });
      }
    },
    onSubmit: refresh,
  });

  const { handleDelete } = useDelete(adminApi.deleteQuestionType, {
    onSuccess: () => refresh(),
  });

  return {
    ...form,
    data,
    grade,
    subject,
    scene,
    setGrade,
    setSubject,
    setScene,
    handleDelete,
  };
};

export const QuestionTypeListModel = createContainer(useContainer);
export const useQuestionTypeListModel = QuestionTypeListModel.useContainer;
