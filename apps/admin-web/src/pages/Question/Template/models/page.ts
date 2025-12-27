import { useDelete, useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  // 筛选条件
  const [questionTypeId, setQuestionTypeId] = useState<number>();

  // 获取所有模板
  const { data, refresh, loading } = useRequest(() => QuestionApi.listQuestionTemplates({ questionTypeId }), {
    refreshDeps: [questionTypeId],
  });

  // 获取所有题型（用于下拉框）
  const { data: questionTypes } = useRequest(() => QuestionApi.listAllQuestionTypes());

  // 表单
  const form = useSimpleForm<QuestionTemplateCreateRequest, QuestionTemplate>({
    service: async (values, item) => {
      if (item) {
        await QuestionApi.updateQuestionTemplate(item.id, values);
      } else {
        await QuestionApi.createQuestionTemplate(values);
      }
    },
    onSubmit: () => {
      message.success('保存成功');
      refresh();
    },
  });

  // 删除
  const { handleDelete } = useDelete(QuestionApi.deleteQuestionTemplate, {
    onSuccess: () => refresh(),
  });

  return {
    ...form,
    data,
    loading,
    refresh,
    questionTypes,
    // 筛选
    questionTypeId,
    setQuestionTypeId,
    // 操作
    handleDelete,
  };
};

export const QuestionTemplateModel = createContainer(useContainer);
export const useQuestionTemplateModel = QuestionTemplateModel.useContainer;
