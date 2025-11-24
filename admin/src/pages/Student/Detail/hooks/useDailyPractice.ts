import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { StudentApi } from '@/services/student';
import type { PracticeSession } from '@/services/practice';
import { useGenerateWithConfirm } from '@/hooks/useGenerateWithConfirm';

const PRACTICE_HISTORY_PATH = (id: string) => `/practice?student_id=${id}`;

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
  const { runAsync: generateDailyPractice } = useRequest(
    async () => {
      if (!id) return;
      const data = await StudentApi.createDailyPractice(id);
      refreshTodayPractice();
      if (data.status === 2) {
        refreshStats?.();
      }
      return data;
    },
    {
      manual: true,
    },
  );

  const handleGenerateDailyPractice = useGenerateWithConfirm(
    async () => {
      if (!id) return;
      return await generateDailyPractice();
    },
    {
      confirmTitle: '确认生成每日练习',
      confirmContent: '确定要为该学生生成今日的每日练习吗？生成过程可能需要一些时间，请耐心等待。',
      loadingTitle: '正在生成每日练习',
      loadingContent: '每日练习生成中，请稍候...',
      successTitle: '生成成功',
      successContent: '每日练习已生成完成！',
      errorTitle: '生成失败',
      onSuccess: () => {
        refreshTodayPractice();
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
    handleGenerateDailyPractice,
    practiceHistoryLink,
    refreshTodayPractice,
  };
}

