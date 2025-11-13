import { useEffect, useState, useMemo } from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';

import { StudentApi } from '@/services/student';

type DailyPracticeResponse = {
  session: DailyPracticeSession | null;
  task_id: number | null;
  status: string;
  progress: number;
} | null;

const PRACTICE_HISTORY_PATH = (id: string) => `/student/${id}/practice-history`;

export function useDailyPractice(id?: string, refreshStats?: () => void) {
  const [todayPractice, setTodayPractice] = useState<DailyPracticeResponse>(null);
  const [generatingPractice, setGeneratingPractice] = useState(false);

  const {
    data: todayPracticeData,
    loading: loadingTodayPractice,
    refresh: refreshTodayPractice,
  } = useRequest(() => StudentApi.generateDailyPractice(id!), {
    ready: !!id,
    onSuccess: (data) => {
      setTodayPractice(data);
      if (data.session && data.session.status === 'completed') {
        refreshStats?.();
      }
    },
  });

  useEffect(() => {
    if (!todayPracticeData) return;
    setTodayPractice(todayPracticeData);
  }, [todayPracticeData]);

  const handleGenerateDailyPractice = async () => {
    if (!id) return;
    try {
      setGeneratingPractice(true);
      const data = await StudentApi.generateDailyPractice(id);
      setTodayPractice(data);
      if (data.session) {
        message.success('今日练习已生成');
        if (data.session.status === 'completed') {
          refreshStats?.();
        }
      } else {
        message.success('今日练习生成任务已创建');
      }
      refreshTodayPractice();
    } catch (error) {
      message.error('生成失败');
    } finally {
      setGeneratingPractice(false);
    }
  };

  // 轮询任务进度
  useEffect(() => {
    if (!id || !todayPractice?.status) {
      return;
    }

    const isGenerating = ['pending', 'running'].includes(todayPractice.status);
    if (!isGenerating) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const data = await StudentApi.generateDailyPractice(id);
        setTodayPractice(data);
        if (data.session || !['pending', 'running'].includes(data.status)) {
          clearInterval(pollInterval);
          if (data.session) {
            message.success('今日练习生成完成！');
            refreshStats?.();
          } else if (data.status === 'failed') {
            message.error('今日练习生成失败，请重试');
          }
        }
      } catch (error) {
        console.error('查询任务进度失败:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [id, todayPractice?.status, refreshStats]);

  const practiceHistoryLink = useMemo(
    () => (id ? PRACTICE_HISTORY_PATH(id) : '#'),
    [id],
  );

  return {
    todayPractice,
    loadingTodayPractice,
    generatingPractice,
    handleGenerateDailyPractice,
    practiceHistoryLink,
  };
}

