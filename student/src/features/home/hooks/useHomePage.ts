/**
 * 首页逻辑 Hook
 * 负责首页的业务逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import { profileApi, StudentStats } from '@/services/profile';
import { useApiError } from '@/shared/hooks/useApiError';

export function useHomePage() {
  const { handleError } = useApiError();

  const [showTextbookModal, setShowTextbookModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<StudentStats | null>(null);

  useEffect(() => {
    checkTextbookSetup();
    loadStats();
  }, []);

  const checkTextbookSetup = useCallback(async () => {
    try {
      setChecking(true);
      const profile = await profileApi.getProfile();
      if (!profile || !profile.current_textbook_id) {
        setShowTextbookModal(true);
      }
    } catch (error) {
      console.error('Failed to check textbook setup:', error);
      setShowTextbookModal(true);
    } finally {
      setChecking(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await profileApi.getStats();
      setStats(statsData);
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const closeTextbookModal = useCallback(() => {
    setShowTextbookModal(false);
    // 关闭后重新检查
    checkTextbookSetup();
  }, [checkTextbookSetup]);

  return {
    showTextbookModal,
    checking,
    stats,
    closeTextbookModal,
  };
}

