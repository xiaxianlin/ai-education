import { useDelete, useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  // 筛选条件
  const [subject, setSubject] = useState<string>();
  const [interactionType, setInteractionType] = useState<InteractionType>();
  const [stage, setStage] = useState<Stage>();

  // 获取所有题型
  const { data, refresh, loading } = useRequest(() => QuestionApi.listAllQuestionTypes(), {
    refreshDeps: [],
  });

  // 根据筛选条件过滤数据
  const filteredData = data?.filter((item) => {
    if (subject && item.subject !== subject) return false;
    if (interactionType && item.interactionType !== interactionType) return false;
    if (stage && !item.stages.includes(stage)) return false;
    return true;
  });

  // 表单
  const form = useSimpleForm<QuestionTypeCreateRequest, QuestionType>({
    service: async (values, item) => {
      if (item) {
        await QuestionApi.updateQuestionType(item.id, values);
      } else {
        await QuestionApi.createQuestionType(values);
      }
    },
    onSubmit: () => {
      message.success('保存成功');
      refresh();
    },
  });

  // 删除
  const { handleDelete } = useDelete(QuestionApi.deleteQuestionType, {
    onSuccess: () => refresh(),
  });

  return {
    ...form,
    data: filteredData,
    loading,
    refresh,
    // 筛选
    subject,
    setSubject,
    interactionType,
    setInteractionType,
    stage,
    setStage,
    // 操作
    handleDelete,
  };
};

export const QuestionTypeModel = createContainer(useContainer);
export const useQuestionTypeModel = QuestionTypeModel.useContainer;
