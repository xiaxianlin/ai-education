/**
 * 单元练习页面逻辑 Hook
 * 负责单元练习页面的业务逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { profileApi, Unit, Textbook, Knowledge } from '@/services/profile';
import { practiceApi } from '@/services/practice';
import { toast } from 'sonner';
import { useApiError } from '@/lib/hooks/useApiError';

export function useUnitPracticePage() {
  const navigate = useNavigate();
  const { handleError } = useApiError();

  const [units, setUnits] = useState<Unit[]>([]);
  const [currentTextbook, setCurrentTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [incompleteSessions, setIncompleteSessions] = useState<Record<number, number>>({});
  const [knowledgeModal, setKnowledgeModal] = useState<{
    open: boolean;
    unitName: string;
    knowledges: Knowledge[];
  }>({ open: false, unitName: '', knowledges: [] });
  const [practiceModal, setPracticeModal] = useState<{
    open: boolean;
    unitId: number;
    unitName: string;
  }>({ open: false, unitId: 0, unitName: '' });
  const [difficulty, setDifficulty] = useState<string>('adaptive');
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUnits();
    loadIncompleteSessions();
  }, []);

  // 当页面可见时刷新未完成会话列表（用户从其他页面返回时）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadIncompleteSessions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadUnits = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await profileApi.getProfile();
      if (!profile?.current_textbook_id) {
        setUnits([]);
        setCurrentTextbook(null);
        return;
      }

      const textbooks = await profileApi.getTextbooks();
      const textbook = textbooks.find((t) => t.id === profile.current_textbook_id);
      setCurrentTextbook(textbook || null);

      const unitsData = await profileApi.getUnits(profile.current_textbook_id);
      const enabledUnits = unitsData
        .filter((unit) => unit.status === 1)
        .map((unit) => ({
          ...unit,
          knowledges: (unit.knowledges || []).filter((knowledge) => knowledge.status === 1),
        }));
      setUnits(enabledUnits);
    } catch (error) {
      handleError(error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadIncompleteSessions = useCallback(async () => {
    try {
      const sessions = await practiceApi.getIncompleteUnitSessions();
      setIncompleteSessions(sessions);
    } catch (error) {
      console.error('Failed to load incomplete sessions:', error);
      // 不显示错误，静默失败
    }
  }, []);

  const handleStartPractice = useCallback(async (unit: Unit) => {
    // 检查是否有未完成的练习
    const sessionId = incompleteSessions[unit.id];
    if (sessionId) {
      // 有未完成的练习，直接跳转
      navigate({ to: `/practice/${sessionId}` });
      return;
    }
    
    // 没有未完成的练习，显示弹窗
    setPracticeModal({
      open: true,
      unitId: unit.id,
      unitName: unit.name,
    });
    setDifficulty('adaptive');
    setQuestionCount(30);
  }, [incompleteSessions, navigate]);

  const handleCreatePractice = useCallback(async () => {
    try {
      setCreating(true);
      const session = await practiceApi.createUnitPractice({
        unit_id: practiceModal.unitId,
        difficulty,
        count: questionCount,
      });
      
      // 检查是否有已提交的答案，判断是新创建还是继续未完成的练习
      const hasAnswers = session.answers && session.answers !== '{}';
      if (hasAnswers) {
        toast.success('继续未完成的练习！');
      } else {
        toast.success('练习已创建，开始答题！');
      }
      
      const sessionId = session.session_id ?? session.id;
      if (sessionId) {
        navigate({ to: `/practice/${sessionId}` });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setCreating(false);
    }
  }, [practiceModal.unitId, difficulty, questionCount, navigate, handleError]);

  const openKnowledgeModal = useCallback((unit: Unit) => {
    setKnowledgeModal({
      open: true,
      unitName: unit.name,
      knowledges: unit.knowledges || [],
    });
  }, []);

  const closeKnowledgeModal = useCallback(() => {
    setKnowledgeModal((prev) => ({ ...prev, open: false }));
  }, []);

  const closePracticeModal = useCallback(() => {
    setPracticeModal({ open: false, unitId: 0, unitName: '' });
  }, []);

  return {
    // 数据
    units,
    currentTextbook,
    loading,
    knowledgeModal,
    practiceModal,
    difficulty,
    questionCount,
    creating,
    incompleteSessions,
    // 方法
    setDifficulty,
    setQuestionCount,
    handleStartPractice,
    handleCreatePractice,
    openKnowledgeModal,
    closeKnowledgeModal,
    closePracticeModal,
  };
}

