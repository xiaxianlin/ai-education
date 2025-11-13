import { useState } from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';

import { StudentApi } from '@/services/student';

export function useLearningData(id?: string) {
  const [activeTab, setActiveTab] = useState('stats');

  const {
    data: stats,
    loading: loadingStats,
    refresh: refreshStats,
  } = useRequest(() => StudentApi.getStats(id!), {
    ready: !!id && activeTab === 'stats',
  });

  const {
    data: records,
    loading: loadingRecords,
    run: refreshRecords,
  } = useRequest((params?: any) => StudentApi.getRecords(id!, params), {
    ready: !!id && activeTab === 'records',
  });

  const {
    data: wrongQuestions,
    loading: loadingWrongQuestions,
    run: refreshWrongQuestions,
  } = useRequest((params?: any) => StudentApi.getWrongQuestions(id!, params), {
    ready: !!id && activeTab === 'wrong',
  });

  const { runAsync: handleSaveProfile, loading: savingProfile } = useRequest(
    async (values: any) => {
      await StudentApi.saveProfile(id!, values);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('配置保存成功');
        refreshRecords();
      },
      onError: () => {
        message.error('保存失败');
      },
    },
  );

  const {
    runAsync: handleMarkAsMastered,
    loading: marking,
  } = useRequest(async (questionId: number) => StudentApi.markQuestionAsMastered(id!, questionId), {
    manual: true,
    onSuccess: () => {
      message.success('已标记为已掌握');
      refreshWrongQuestions();
    },
    onError: () => {
      message.error('操作失败');
    },
  });

  const {
    runAsync: handleUnmarkAsMastered,
    loading: unmarking,
  } = useRequest(
    async (questionId: number) => StudentApi.unmarkQuestionAsMastered(id!, questionId),
    {
      manual: true,
      onSuccess: () => {
        message.success('已标记为未掌握');
        refreshWrongQuestions();
      },
      onError: () => {
        message.error('操作失败');
      },
    },
  );

  return {
    activeTab,
    setActiveTab,
    stats,
    loadingStats,
    refreshStats,
    records,
    loadingRecords,
    refreshRecords,
    wrongQuestions,
    loadingWrongQuestions,
    handleMarkAsMastered,
    handleUnmarkAsMastered,
    marking,
    unmarking,
    handleSaveProfile,
    savingProfile,
  };
}

