/**
 * 首页逻辑 Hook
 * 负责首页的业务逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import { profileApi, StudentStats } from '@/services/profile';
import { practiceApi } from '@/services/practice';
import { useApiError } from '@/lib/hooks/useApiError';
import type { PracticeSession } from '@/lib/types/schema';
import type { DailyPracticeStatus } from '../components/DailyPracticeCard';
import { toast } from 'sonner';

export function useHomePage() {
  const { handleError } = useApiError();

  const [showTextbookModal, setShowTextbookModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [dailyPracticeStatus, setDailyPracticeStatus] = useState<DailyPracticeStatus>('not_generated');
  const [dailyPracticeSession, setDailyPracticeSession] = useState<PracticeSession | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [dailyQuestions, setDailyQuestions] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(0);

  useEffect(() => {
    checkTextbookSetup();
    loadStats();
    loadDailyPractice();
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

  const loadDailyPractice = useCallback(async () => {
    try {
      const session = await practiceApi.getDailyPractice();
      
      if (session) {
        setDailyPracticeSession(session);
        
        // 根据状态判断：0-未开始, 1-进行中, 2-已完成
        if (session.status === 0) {
          setDailyPracticeStatus('ready'); // 已生成但未开始
        } else if (session.status === 1 || session.status === 2) {
          setDailyPracticeStatus('ready'); // 进行中或已完成
        } else {
          setDailyPracticeStatus('ready');
        }
        
        // 更新统计数据
        const totalQuestions = session.question_count ?? session.total_questions ?? 0;
        const answerCount = session.answer_count ?? session.completed_questions ?? 0;
        const correctCount = session.correct_count ?? session.right_questions ?? 0;
        
        setDailyQuestions(totalQuestions);
        setCompletedQuestions(answerCount);
        
        // 计算今日进度百分比
        const progress = totalQuestions > 0 
          ? Math.round((answerCount / totalQuestions) * 100) 
          : 0;
        setTodayProgress(progress);
      } else {
        // 没有每日练习，状态为未生成
        setDailyPracticeStatus('not_generated');
        setDailyPracticeSession(null);
        setDailyQuestions(0);
        setCompletedQuestions(0);
        setTodayProgress(0);
      }
    } catch (error) {
      // 静默处理错误，不影响页面显示
      console.error('Failed to load daily practice:', error);
      setDailyPracticeStatus('not_generated');
      setDailyPracticeSession(null);
      setDailyQuestions(0);
      setCompletedQuestions(0);
      setTodayProgress(0);
    }
  }, []);

  const createDailyPractice = useCallback(async () => {
    try {
      setDailyPracticeStatus('generating');
      
      // 创建每日练习
      const session = await practiceApi.createDailyPractice();
      
      setDailyPracticeSession(session);
      setDailyPracticeStatus('ready');
      
      // 更新统计数据
      const totalQuestions = session.question_count ?? session.total_questions ?? 0;
      const answerCount = session.answer_count ?? session.completed_questions ?? 0;
      const correctCount = session.correct_count ?? session.right_questions ?? 0;
      
      setDailyQuestions(totalQuestions);
      setCompletedQuestions(answerCount);
      
      // 计算今日进度百分比
      const progress = totalQuestions > 0 
        ? Math.round((answerCount / totalQuestions) * 100) 
        : 0;
      setTodayProgress(progress);
      
      toast.success('每日练习生成成功！');
    } catch (error) {
      console.error('Failed to create daily practice:', error);
      setDailyPracticeStatus('not_generated');
      handleError(error);
      toast.error('生成每日练习失败，请稍后重试');
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
    dailyPracticeStatus,
    dailyPracticeSession,
    todayProgress,
    dailyQuestions,
    completedQuestions,
    createDailyPractice,
    closeTextbookModal,
  };
}

