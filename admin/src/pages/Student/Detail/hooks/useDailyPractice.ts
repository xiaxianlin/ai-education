import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';

import { StudentApi } from '@/services/student';
import type { PracticeSession } from '@/services/practice';

const PRACTICE_HISTORY_PATH = (id: string) => `/student/${id}/practice-history`;

export function useDailyPractice(id?: string, refreshStats?: () => void) {
  // 获取今日练习会话（如果存在）
  const {
    data: todaySession,
    loading: loadingTodayPractice,
    refresh: refreshTodayPractice,
  } = useRequest(() => StudentApi.getDailyPractice(id!), {
    ready: !!id,
    onSuccess: (data) => {
      if (data && data.status === 2) {
        // 已完成，刷新统计数据
        refreshStats?.();
      }
    },
    onError: () => {
      // 如果获取失败，可能是当天没有练习，不显示错误
    },
  });

  // 生成今日练习
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
      onError: (error: any) => {
        message.error(error?.message || '生成失败');
      },
    },
  );

  const practiceHistoryLink = useMemo(
    () => (id ? PRACTICE_HISTORY_PATH(id) : '#'),
    [id],
  );

  return {
    todaySession, // 今日练习会话（null 表示未生成）
    loadingTodayPractice,
    generatingPractice,
    handleGenerateDailyPractice,
    practiceHistoryLink,
    refreshTodayPractice,
  };
}

