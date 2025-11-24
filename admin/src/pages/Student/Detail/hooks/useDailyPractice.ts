import { useMemo } from 'react';
import React from 'react';
import { useRequest } from 'ahooks';
import { Modal, Spin } from 'antd';

import { StudentApi } from '@/services/student';
import type { PracticeSession } from '@/services/practice';

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

  const handleGenerateDailyPractice = async () => {
    if (!id) return;

    // 显示全局 loading 弹窗
    const hide = Modal.info({
      centered: true,
      title: '正在生成每日练习',
      content: React.createElement(
        'div',
        { style: { textAlign: 'center', padding: '20px 0' } },
        React.createElement(Spin, { size: 'large' }),
        React.createElement(
          'div',
          { style: { color: '#666', marginTop: 16 } },
          '每日练习生成中，请稍候...',
        ),
      ),
      okButtonProps: { style: { display: 'none' } },
      closable: false,
      maskClosable: false,
      width: 400,
    });

    try {
      await generateDailyPractice();
      hide.destroy();
      Modal.success({
        centered: true,
        title: '生成成功',
        content: '每日练习已生成完成！',
        onOk: () => {
          refreshTodayPractice();
        },
      });
    } catch (error: any) {
      hide.destroy();
      Modal.error({
        centered: true,
        title: '生成失败',
        content: error?.message || '每日练习生成失败，请稍后重试',
      });
    }
  };

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

