/**
 * 单元练习页面逻辑 Hook
 * 负责单元练习页面的业务逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { profileApi, Unit, Textbook, Knowledge } from '@/services/profile';
import { practiceApi } from '@/services/practice';
import { toast } from 'sonner';
import { useApiError } from '@/hooks/useApiError';

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
    loading?: boolean;
  }>({ open: false, unitName: '', knowledges: [], loading: false });
  const [practiceModal, setPracticeModal] = useState<{
    open: boolean;
    unitId: number;
    unitName: string;
  }>({ open: false, unitId: 0, unitName: '' });
  const [creating, setCreating] = useState(false);

  const loadIncompleteSessions = useCallback(async () => {
    try {
      if (!currentTextbook?.id) {
        setIncompleteSessions({});
        return;
      }
      
      // 使用 getUnitsStatus 获取所有单元的未完成练习记录
      const status = await practiceApi.getUnitsStatus(currentTextbook.id);
      const sessions: Record<number, number> = {};
      
      // 从状态中提取未完成会话的 session id
      // 后端返回的 status 键是字符串（JSON 序列化后），值是 PracticeSession
      Object.entries(status).forEach(([unitId, session]) => {
        if (session && session.id) {
          sessions[parseInt(unitId)] = session.id;
        }
      });
      
      setIncompleteSessions(sessions);
    } catch (error) {
      console.error('Failed to load incomplete sessions:', error);
      // 不显示错误，静默失败
      setIncompleteSessions({});
    }
  }, [currentTextbook?.id]);

  const loadUnits = useCallback(async () => {
    try {
      setLoading(true);
      const checkResponse = await profileApi.check();
      if (!checkResponse.textbook?.id) {
        setUnits([]);
        setCurrentTextbook(null);
        return;
      }

      const textbooks = await profileApi.getTextbooks();
      const textbook = textbooks.find((t) => t.id === checkResponse.textbook?.id);
      setCurrentTextbook(textbook || null);

      // 根据 API.md: GET /api/student/textbook/units?textbook_id=1
      // 新接口只返回 id, name, textbook_id，不包含 status 和 knowledges
      const unitsData = await profileApi.getUnits(checkResponse.textbook?.id);
      setUnits(unitsData);
    } catch (error) {
      handleError(error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  // 当教材加载完成后，加载未完成会话
  useEffect(() => {
    if (currentTextbook?.id) {
      loadIncompleteSessions();
    }
  }, [currentTextbook?.id, loadIncompleteSessions]);

  // 当页面可见时刷新未完成会话列表（用户从其他页面返回时）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentTextbook?.id) {
        loadIncompleteSessions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentTextbook?.id, loadIncompleteSessions]);

  const handleStartPractice = useCallback(async (unit: Unit) => {
    // 检查是否有未完成的练习
    const sessionId = incompleteSessions[unit.id];
    if (sessionId) {
      // 有未完成的练习，直接跳转
      navigate({ to: `/practice/${sessionId}` });
      return;
    }
    
    // 没有未完成的练习，显示弹窗确认创建
    setPracticeModal({
      open: true,
      unitId: unit.id,
      unitName: unit.name,
    });
  }, [incompleteSessions, navigate]);

  const handleCreatePractice = useCallback(async () => {
    try {
      setCreating(true);
      // 后端接口只需要 unit_id，不支持 difficulty 和 count 参数
      const session = await practiceApi.createUnitPractice(practiceModal.unitId);
      
        toast.success('练习已创建，开始答题！');
      
      const sessionId = session.id;
      if (sessionId) {
        // 更新未完成会话列表
        setIncompleteSessions(prev => ({
          ...prev,
          [practiceModal.unitId]: sessionId,
        }));
      
        navigate({ to: `/practice/${sessionId}` });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setCreating(false);
    }
  }, [practiceModal.unitId, navigate, handleError]);

  const openKnowledgeModal = useCallback(async (unit: Unit) => {
    // 先显示弹窗，设置加载状态
    setKnowledgeModal({
      open: true,
      unitName: unit.name,
      knowledges: [],
      loading: true,
    });
    
    try {
      // 调用接口获取单元知识点
      const knowledges = await profileApi.getUnitKnowledges(unit.id);
      setKnowledgeModal({
        open: true,
        unitName: unit.name,
        knowledges: knowledges || [],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load knowledges:', error);
      // 加载失败，显示空列表
      setKnowledgeModal({
        open: true,
        unitName: unit.name,
        knowledges: [],
        loading: false,
    });
    }
  }, []);

  const closeKnowledgeModal = useCallback(() => {
    setKnowledgeModal((prev) => ({ ...prev, open: false }));
  }, []);

  const closePracticeModal = useCallback(() => {
    setPracticeModal({ open: false, unitId: 0, unitName: '' });
  }, []);

  // 检查是否有任何进行中的单元练习
  const hasInProgressPractice = Object.keys(incompleteSessions).length > 0;

  return {
    // 数据
    units,
    currentTextbook,
    loading,
    knowledgeModal,
    practiceModal,
    creating,
    incompleteSessions,
    hasInProgressPractice,
    // 方法
    handleStartPractice,
    handleCreatePractice,
    openKnowledgeModal,
    closeKnowledgeModal,
    closePracticeModal,
  };
}

