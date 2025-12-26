import { useDelete, useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { useRequest } from 'ahooks';
import { message } from 'antd';
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

  const { runAsync: handleBatchDelete, loading: batchDeleteLoading } = useRequest(
    async (ids: number[]) => {
      await QuestionApi.batchDeleteQuestionTypes(ids);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('批量删除成功');
        refresh();
      },
      onError: (error: any) => {
        message.error(error?.message || '批量删除失败');
      },
    },
  );

  return {
    ...form,
    data,
    grade,
    subject,
    scene,
    setScene,
    handleDelete,
    handleBatchDelete,
    batchDeleteLoading,
  };
};

export const QuestionTypeListModel = createContainer(useContainer);
export const useQuestionTypeListModel = QuestionTypeListModel.useContainer;
