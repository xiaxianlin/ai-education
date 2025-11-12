/**
 * 首页逻辑 Hook
 * 负责首页的业务逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import { profileApi, StudentStats } from '@/services/profile';
import { practiceApi } from '@/services/practice';
import { useApiError } from '@/lib/hooks/useApiError';

export function useHomePage() {
  const { handleError } = useApiError();

  const [showTextbookModal, setShowTextbookModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [dailyQuestions, setDailyQuestions] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(0);

  useEffect(() => {
    checkTextbookSetup();
    loadStats();
    loadTodayPractice();
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

  const loadTodayPractice = useCallback(async () => {
    try {
      const result = await practiceApi.checkTodayPractice();
      if (result.session) {
        const session = result.session;
        const totalQuestions = session.total_questions || 0;
        
        // 解析已完成的题目数（从answers字段）
        let completedCount = 0;
        if (session.status === 'completed') {
          // 如果已完成，已完成数等于总题目数
          completedCount = totalQuestions;
        } else if (session.answers) {
          try {
            const answers = JSON.parse(session.answers);
            completedCount = Object.keys(answers).length;
          } catch (e) {
            // 如果解析失败，使用correct_questions作为已完成数
            completedCount = session.correct_questions || 0;
          }
        } else {
          completedCount = session.correct_questions || 0;
        }

        setDailyQuestions(totalQuestions);
        setCompletedQuestions(completedCount);
        
        // 计算今日进度百分比
        const progress = totalQuestions > 0 
          ? Math.round((completedCount / totalQuestions) * 100) 
          : 0;
        setTodayProgress(progress);
      } else {
        // 如果没有今日练习，重置为0
        setDailyQuestions(0);
        setCompletedQuestions(0);
        setTodayProgress(0);
      }
    } catch (error) {
      // 静默处理错误，不影响页面显示
      console.error('Failed to load today practice:', error);
      setDailyQuestions(0);
      setCompletedQuestions(0);
      setTodayProgress(0);
    }
  }, []);

  const closeTextbookModal = useCallback(() => {
    setShowTextbookModal(false);
    // 关闭后重新检查
    checkTextbookSetup();
  }, [checkTextbookSetup]);

  return {
    showTextbookModal,
    checking,
    stats,
    todayProgress,
    dailyQuestions,
    completedQuestions,
    closeTextbookModal,
  };
}

