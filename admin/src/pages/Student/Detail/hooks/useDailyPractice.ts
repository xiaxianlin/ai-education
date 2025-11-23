import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';

import { StudentApi } from '@/services/student';
import type { PracticeSession } from '@/services/practice';

const PRACTICE_HISTORY_PATH = (id: string) => `/student/${id}/practice-history`;

// 将数字状态转换为字符串状态（用于兼容）
function getStatusString(status: number): 'pending' | 'in_progress' | 'completed' | 'failed' {
  switch (status) {
    case 0:
      return 'pending';
    case 1:
      return 'in_progress';
    case 2:
      return 'completed';
    default:
      return 'failed';
  }
}

// 将 PracticeSession 转换为 DailyPracticeSession（兼容旧代码）
function convertToDailyPracticeSession(session: PracticeSession | null): DailyPracticeSession | null {
  if (!session) return null;
  return {
    ...session,
    session_type: 'daily_practice',
    date: session.target_id || 0,
    score: 0,
    total_questions: session.question_count,
    correct_questions: session.correct_count,
    status: getStatusString(session.status),
  } as DailyPracticeSession;
}

export function useDailyPractice(id?: string, refreshStats?: () => void) {
  const {
    data: todayPracticeData,
    loading: loadingTodayPractice,
    refresh: refreshTodayPractice,
  } = useRequest(() => StudentApi.getDailyPractice(id!), {
    ready: !!id,
    onSuccess: (data) => {
      if (data && data.status === 2) {
        // 已完成
        refreshStats?.();
      }
    },
    onError: () => {
      // 如果获取失败，可能是当天没有练习，不显示错误
    },
  });

  const { runAsync: handleGenerateDailyPractice, loading: generatingPractice } = useRequest(
    async () => {
      if (!id) return;
      const data = await StudentApi.createDailyPractice(id);
      message.success('今日练习已生成');
      refreshTodayPractice();
      if (data.status === 2) {
        refreshStats?.();
      }
      return data;
    },
    {
      manual: true,
      onError: () => {
        message.error('生成失败');
      },
    },
  );

  const practiceHistoryLink = useMemo(
    () => (id ? PRACTICE_HISTORY_PATH(id) : '#'),
    [id],
  );

  // 转换为兼容格式
  const todayPractice = useMemo(() => {
    if (!todayPracticeData) {
      return {
        session: null,
        task_id: null,
        status: 'failed',
        progress: 0,
      };
    }
    const session = convertToDailyPracticeSession(todayPracticeData);
    return {
      session,
      task_id: null,
      status: session ? getStatusString(session.status) : 'failed',
      progress: session ? (session.status === 'completed' ? 100 : 0) : 0,
    };
  }, [todayPracticeData]);

  return {
    todayPractice,
    loadingTodayPractice,
    generatingPractice,
    handleGenerateDailyPractice,
    practiceHistoryLink,
    refreshTodayPractice,
  };
}

