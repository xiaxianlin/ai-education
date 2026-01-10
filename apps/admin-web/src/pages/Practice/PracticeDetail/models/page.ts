import { QuestionApi } from '@/pages/Question/api';
import { useRequest } from 'ahooks';
import { Modal, message } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<Question>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);
  const [generationResults, setGenerationResults] = useState<
    Record<string, 'waiting' | 'generating' | 'success' | 'error'>
  >({});

  // 加载练习详情
  const { data, loading, error, refresh } = useRequest(() => PracticeApi.getPracticeDetail(id!), {
    ready: !!id,
    onError: (err: any) => {
      message.error(err?.message || '加载练习详情失败');
    },
  });

  const questions = useMemo(() => data?.questions || [], [data?.questions]);

  // 判定是否需要生成素材的题目
  const ungeneratedQuestions = useMemo(() => {
    return questions.filter((q) => {
      const hasResource = q.resources && q.resources.length > 0;
      if (!hasResource) return false;
      const resourcesWithUrl = q.resources!.filter((r) => r.url && r.url.trim() !== '');
      return resourcesWithUrl.length < q.resources!.length;
    });
  }, [questions]);

  const hasUngeneratedQuestions = ungeneratedQuestions.length > 0;

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

  const handleOpenGenerationModal = () => {
    setIsModalOpen(true);
    const initialResults: Record<string, 'waiting' | 'generating' | 'success' | 'error'> = {};
    ungeneratedQuestions.forEach((q) => {
      initialResults[q.id] = 'waiting';
    });
    setGenerationResults(initialResults);
  };

  const handleStartGeneration = async () => {
    const ids = ungeneratedQuestions.map((q) => q.id);
    setGeneratingIds(ids);

    for (const id of ids) {
      setGenerationResults((prev) => ({ ...prev, [id]: 'generating' }));
      try {
        await QuestionApi.generateQuestionResources(id);
        setGenerationResults((prev) => ({ ...prev, [id]: 'success' }));
      } catch (err) {
        console.error(`Failed to generate materials for ${id}:`, err);
        setGenerationResults((prev) => ({ ...prev, [id]: 'error' }));
      }
    }

    setGeneratingIds([]);
    setIsModalOpen(false);
    message.success('素材生成完成');
    refresh();
  };

  const handleResetPractice = () => {
    if (!id) return;

    Modal.confirm({
      title: '重置练习确认',
      content: '确定要重置整个练习的所有答题记录吗？此操作将清空所有答题数据，无法恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await PracticeApi.resetPractice(id);
          message.success('练习重置成功');
          refresh();
        } catch (err: any) {
          message.error(err?.message || '重置练习失败');
        }
      },
    });
  };

  const handleResetAnswer = (questionId: string) => {
    if (!id) return;

    Modal.confirm({
      title: '重置答案确认',
      content: '确定要重置该题目的答案记录吗？此操作将清空该题的答题数据，无法恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await PracticeApi.resetPracticeAnswer(id, questionId);
          message.success('答案重置成功');
          refresh();
        } catch (err: any) {
          message.error(err?.message || '重置答案失败');
        }
      },
    });
  };

  return {
    id,
    navigate,
    loading,
    error,
    session: data?.session,
    questions,
    answers: data?.answers || [],
    report: data?.report,
    answersMap,
    selectedQuestion,
    handleViewQuestion,
    handleCloseQuestion,
    ungeneratedQuestions,
    hasUngeneratedQuestions,
    isModalOpen,
    setIsModalOpen,
    generationResults,
    handleOpenGenerationModal,
    handleStartGeneration,
    isGenerating: generatingIds.length > 0,
    handleResetPractice,
    handleResetAnswer,
  };
};

export const PracticeDetailModel = createContainer(useContainer);
export const usePracticeDetailModel = PracticeDetailModel.useContainer;
