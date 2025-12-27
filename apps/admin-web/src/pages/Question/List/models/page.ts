import { useDelete } from '@/hooks';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';
import { useInitialStateModel } from '@/models/initialState';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const { subject, grade } = useInitialStateModel();
  const [previewQuestion, setPreviewQuestion] = useState<Question | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);

  const { handleDelete } = useDelete(QuestionApi.deleteQuestion, {
    onSuccess: () => actionRef.current?.reload?.(),
  });

  const handlePreview = (question: Question) => {
    setPreviewQuestion(question);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewQuestion(undefined);
  };

  useEffect(() => {
    actionRef.current?.reload?.();
  }, [subject, grade, actionRef]);

  return {
    actionRef,
    subject,
    grade,
    handleDelete,
    previewQuestion,
    previewOpen,
    handlePreview,
    handleClosePreview,
  };
};

export const QuestionListModel = createContainer(useContainer);
export const useQuestionListModel = QuestionListModel.useContainer;
