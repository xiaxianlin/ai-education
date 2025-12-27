import { useDelete } from '@/hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';
import { ActionType } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';

const useContainer = () => {
  const actionRef = useRef<ActionType>();

  const [questionTypeId, setQuestionTypeId] = useState<number>();

  const { data: questionTypes } = useRequest(() => QuestionApi.listAllQuestionTypes());
  const questionTypesOptions = useMemo(
    () => questionTypes?.map((t) => ({ value: t.id, label: t.name })) || [],
    [questionTypes],
  );
  // 删除
  const { handleDelete } = useDelete(QuestionApi.deleteQuestionTemplate, {
    onSuccess: () => actionRef.current?.reload?.(),
  });

  useEffect(() => {
    actionRef.current?.reload?.();
  }, [questionTypeId]);

  return {
    actionRef,
    questionTypeId,
    questionTypesOptions,
    setQuestionTypeId,
    handleDelete,
  };
};

export const QuestionTemplateModel = createContainer(useContainer);
export const useQuestionTemplateModel = QuestionTemplateModel.useContainer;
