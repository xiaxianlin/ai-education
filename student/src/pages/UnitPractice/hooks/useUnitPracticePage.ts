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
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUnits();
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

  const handleStartPractice = useCallback((unit: Unit) => {
    setPracticeModal({
      open: true,
      unitId: unit.id,
      unitName: unit.name,
    });
    setDifficulty('adaptive');
    setQuestionCount(10);
  }, []);

  const handleCreatePractice = useCallback(async () => {
    try {
      setCreating(true);
      const session = await practiceApi.createUnitPractice({
        unit_id: practiceModal.unitId,
        difficulty,
        count: questionCount,
      });
      toast.success('练习已创建，开始答题！');
      navigate({ to: `/unit-practice/${session.id}` });
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

