import { useEffect, useState, useMemo } from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';

import { StudentApi } from '@/services/student';

type DailyPracticeResponse = {
  session: DailyPracticeSession | null;
  task_id: number | null;
  status: string;
  progress: number;
  error_message?: string;
} | null;

const PRACTICE_HISTORY_PATH = (id: string) => `/student/${id}/practice-history`;

export function useDailyPractice(id?: string, refreshStats?: () => void) {
  const [todayPractice, setTodayPractice] = useState<DailyPracticeResponse>(null);
  const [generatingPractice, setGeneratingPractice] = useState(false);

  const {
    data: todayPracticeData,
    loading: loadingTodayPractice,
    refresh: refreshTodayPractice,
    run: runGenerateDailyPractice,
  } = useRequest(() => StudentApi.generateDailyPractice(id!), {
    ready: !!id,
    manual: false, // 自动执行
    onSuccess: (data) => {
      setTodayPractice(data);
      if (data.session && data.session.status === 'completed') {
        refreshStats?.();
      }
    },
    onError: (error) => {
      console.error('生成今日练习失败:', error);
      // 即使失败也设置状态，避免显示空状态
      setTodayPractice({
        session: null,
        task_id: null,
        status: 'failed',
        progress: 0,
        error_message: error?.message || '生成失败',
      });
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
      // 直接调用 API，然后刷新数据
      const data = await StudentApi.generateDailyPractice(id);
      setTodayPractice(data);
      // 如果成功生成，显示成功消息
      if (data?.session) {
        message.success('今日练习已生成');
        if (data.session.status === 'completed') {
          refreshStats?.();
        }
      }
      // 刷新 useRequest 的数据
      refreshTodayPractice();
    } catch (error) {
      message.error('生成失败');
    } finally {
      setGeneratingPractice(false);
    }
  };

  // 注意：根据重构后的后端逻辑，生成是同步的，总是立即返回 session
  // 所以不再需要轮询任务进度
  // 保留此逻辑仅用于兼容性，实际上不会触发（因为状态不会是 pending 或 running）
  useEffect(() => {
    if (!id || !todayPractice?.status) {
      return;
    }

    const isGenerating = ['pending', 'running'].includes(todayPractice.status);
    const isFailed = todayPractice.status === 'failed';
    if (!isGenerating && !isFailed) {
      return;
    }
    
    // 如果已经失败，停止轮询
    if (isFailed) {
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
    refreshTodayPractice,
  };
}

