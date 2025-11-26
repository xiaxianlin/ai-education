/**
 * 练习记录页面逻辑 Hook
 * 获取每日练习、单元练习和能力评测的历史记录
 * 根据后端接口 /api/student/practice/history/{type} 重构
 */
import { useState, useEffect, useCallback } from 'react';
import { practiceApi } from '@/services/practice';
import { profileApi } from '@/services/profile';
import { useApiError } from '@/hooks/useApiError';

export type TabType = 'daily' | 'unit' | 'assessment';

export function usePracticeHistory() {
  const { handleError } = useApiError();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [dailyHistory, setDailyHistory] = useState<PracticeHistory[]>([]);
  const [unitHistory, setUnitHistory] = useState<PracticeHistory[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<PracticeHistory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载单元列表（用于显示单元名称）
  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = useCallback(async () => {
    try {
      const checkResponse = await profileApi.check();
      if (checkResponse.textbook?.id) {
        const unitsData = await profileApi.getUnits(checkResponse.textbook.id);
        setUnits(unitsData || []);
      }
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [daily, unit, assessment] = await Promise.all([
        practiceApi.getHistory('daily_practice', 50),
        practiceApi.getHistory('unit_practice', 50),
        practiceApi.getHistory('assessment', 50),
      ]);
      setDailyHistory(Array.isArray(daily) ? daily : []);
      setUnitHistory(Array.isArray(unit) ? unit : []);
      setAssessmentHistory(Array.isArray(assessment) ? assessment : []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 根据 target_id 获取单元名称
  const getUnitName = useCallback((targetId?: number): string => {
    if (!targetId) return '未知单元';
    const unit = units.find(u => u.id === targetId);
    return unit?.name || '未知单元';
  }, [units]);

  // 计算得分
  const calculateScore = useCallback((item: PracticeHistory): number => {
    if (item.question_count === 0) return 0;
    return Math.round((item.correct_count / item.question_count) * 100);
  }, []);

  // 计算用时（秒）
  const calculateTimeSpent = useCallback((item: PracticeHistory): number => {
    if (!item.start_time) return 0;
    if (item.end_time) {
      return item.end_time - item.start_time;
    }
    // 如果未完成，返回当前时间 - 开始时间
    return Math.floor(Date.now() / 1000) - item.start_time;
  }, []);

  // 格式化日期
  const formatDate = useCallback((item: PracticeHistory) => {
    // 对于每日练习，target_id 是日期（如 20241123）
    if (item.session_type === 'daily_practice' && item.target_id) {
      const str = String(item.target_id);
    if (str.length === 8) {
      return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
      }
    }
    // 其他情况使用创建时间
    if (item.create_time) {
      const date = new Date(item.create_time * 1000);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    }
    return '未知日期';
  }, []);

  // 格式化时间（秒转分:秒）
  const formatTime = useCallback((seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`;
  }, []);

  // 获取状态文本
  const getStatusText = useCallback((status: number) => {
    switch (status) {
      case 0:
        return '未开始';
      case 1:
        return '进行中';
      case 2:
        return '已完成';
      default:
        return '未知';
    }
  }, []);

  // 判断是否已完成
  const isCompleted = useCallback((status: number) => {
    return status === 2;
  }, []);

  return {
    activeTab,
    setActiveTab,
    dailyHistory,
    unitHistory,
    assessmentHistory,
    units,
    loading,
    getUnitName,
    calculateScore,
    calculateTimeSpent,
    formatDate,
    formatTime,
    getStatusText,
    isCompleted,
  };
}

