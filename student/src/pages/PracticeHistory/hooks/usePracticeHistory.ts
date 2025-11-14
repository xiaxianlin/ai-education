/**
 * 练习记录页面逻辑 Hook
 * 获取今日练习、单元练习和能力评测的历史记录
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  practiceApi, 
  DailyPracticeHistoryItem, 
  PracticeHistoryItem, 
  AssessmentHistoryItem 
} from '@/services/practice';
import { useApiError } from '@/lib/hooks/useApiError';

export type TabType = 'daily' | 'unit' | 'assessment';

export function usePracticeHistory() {
  const { handleError } = useApiError();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [dailyHistory, setDailyHistory] = useState<DailyPracticeHistoryItem[]>([]);
  const [unitHistory, setUnitHistory] = useState<PracticeHistoryItem[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [daily, unit, assessment] = await Promise.all([
        practiceApi.getDailyPracticeHistory(50),
        practiceApi.getPracticeHistory(50),
        practiceApi.getAssessmentHistory(50),
      ]);
      setDailyHistory(daily);
      setUnitHistory(unit);
      setAssessmentHistory(assessment);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const formatDate = useCallback((dateNum: number) => {
    const str = String(dateNum);
    if (str.length === 8) {
      // 格式：20250114
      return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
    }
    // Unix timestamp
    const date = new Date(dateNum * 1000);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    activeTab,
    setActiveTab,
    dailyHistory,
    unitHistory,
    assessmentHistory,
    loading,
    formatDate,
    formatTime,
  };
}

