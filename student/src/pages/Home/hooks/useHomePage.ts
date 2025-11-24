/**
 * 首页逻辑 Hook
 * 负责首页的业务逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '@/services/profile';
import { practiceApi } from '@/services/practice';
import { useApiError } from '@/lib/hooks/useApiError';
import type { PracticeSession } from '@/lib/types/schema';
import type { DailyPracticeStatus } from '../components/DailyPracticeCard';
import type { AssessmentStatus } from '../components/AssessmentCard';
import type { UnitPracticeStatus } from '../components/UnitPracticeCard';
import { toast } from 'sonner';

export function useHomePage() {
  const { handleError } = useApiError();

  const [showTextbookModal, setShowTextbookModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dailyPracticeStatus, setDailyPracticeStatus] = useState<DailyPracticeStatus>('not_generated');
  const [dailyPracticeSession, setDailyPracticeSession] = useState<PracticeSession | null>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>('not_created');
  const [assessmentSession, setAssessmentSession] = useState<PracticeSession | null>(null);
  const [unitPracticeStatus, setUnitPracticeStatus] = useState<UnitPracticeStatus>('no_session');
  const [unitPracticeSession, setUnitPracticeSession] = useState<PracticeSession | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [dailyQuestions, setDailyQuestions] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(0);

  useEffect(() => {
    checkTextbookSetup();
    loadDailyPractice();
    loadAssessment();
    loadUnitPractice();
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

  const loadAssessment = useCallback(async () => {
    try {
      const session = await practiceApi.getAssessment();
      
      if (session) {
        setAssessmentSession(session);
        setAssessmentStatus('ready');
      } else {
        setAssessmentStatus('not_created');
        setAssessmentSession(null);
      }
    } catch (error) {
      // 静默处理错误，不影响页面显示
      console.error('Failed to load assessment:', error);
      setAssessmentStatus('not_created');
      setAssessmentSession(null);
    }
  }, []);

  const createAssessment = useCallback(async () => {
    try {
      const session = await practiceApi.createAssessment();
      setAssessmentSession(session);
      setAssessmentStatus('ready');
      toast.success('能力评测已创建，开始答题！');
      
      // 返回 session，由组件处理导航
      return session;
    } catch (error) {
      console.error('Failed to create assessment:', error);
      handleError(error);
      toast.error('创建能力评测失败，请稍后重试');
      throw error;
    }
  }, [handleError]);

  const loadUnitPractice = useCallback(async () => {
    try {
      // 调用新的接口获取进行中的单元练习
      const session = await profileApi.getInProgressUnitPractice();
      
      if (session) {
        setUnitPracticeSession(session);
        setUnitPracticeStatus('in_progress');
      } else {
        setUnitPracticeStatus('no_session');
        setUnitPracticeSession(null);
      }
    } catch (error) {
      // 静默处理错误，不影响页面显示
      console.error('Failed to load unit practice:', error);
      setUnitPracticeStatus('no_session');
      setUnitPracticeSession(null);
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
    dailyPracticeStatus,
    dailyPracticeSession,
    assessmentStatus,
    assessmentSession,
    unitPracticeStatus,
    unitPracticeSession,
    todayProgress,
    dailyQuestions,
    completedQuestions,
    createDailyPractice,
    createAssessment,
    closeTextbookModal,
  };
}

