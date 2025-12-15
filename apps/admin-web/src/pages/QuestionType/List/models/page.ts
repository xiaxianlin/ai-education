import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { adminApi } from '@/lib/api';
import { message } from 'antd';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const form = useSimpleForm<CreateQuestionTypeRequest, QuestionType>({
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: CreateQuestionTypeRequest) => {
      if (form.edited) {
        await adminApi.updateQuestionType(form.edited.id, values);
      } else {
        await adminApi.createQuestionType(values);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(form.edited ? '更新成功' : '新增成功');
        form.onCancel();
        form.onSubmit();
      },
    },
  );

  return {
    ...form,
    actionRef,
    handleSubmit,
  };
};

export const QuestionTypeListModel = createContainer(useContainer);
export const useQuestionTypeListModel = QuestionTypeListModel.useContainer;

