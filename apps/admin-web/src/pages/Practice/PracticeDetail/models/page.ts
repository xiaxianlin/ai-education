import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<Question>();

  // 加载练习详情
  const { data, loading, error } = useRequest(() => PracticeApi.getPracticeDetail(id!), {
    ready: !!id,
    onError: (err: any) => {
      message.error(err?.message || '加载练习详情失败');
    },
  });

  // 构建答案映射
  const answersMap = useMemo(() => {
    if (!data?.answers) return {};
    return data.answers.reduce(
      (acc, answer) => {
        acc[answer.question_id] = answer;
        return acc;
      },
      {} as Record<string, PracticeAnswer>,
    );
  }, [data?.answers]);

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleCloseQuestion = () => {
    setSelectedQuestion(undefined);
  };

  return {
    id,
    navigate,
    loading,
    error,
    session: data?.session,
    questions: data?.questions || [],
    answers: data?.answers || [],
    report: data?.report,
    answersMap,
    selectedQuestion,
    handleViewQuestion,
    handleCloseQuestion,
  };
};

export const PracticeDetailModel = createContainer(useContainer);
export const usePracticeDetailModel = PracticeDetailModel.useContainer;
