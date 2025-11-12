/**
 * 练习统计页面逻辑 Hook
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { profileApi, StudyRecord, StudentStats } from '@/services/profile';
import { toast } from 'sonner';
import { useApiError } from '@/lib/hooks/useApiError';

export function usePracticeHistory() {
  const { handleError } = useApiError();
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsData, statsData] = await Promise.all([
        profileApi.getRecords(),
        profileApi.getStats(),
      ]);
      setRecords(recordsData);
      setStats(statsData);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} 分钟`;
  }, []);

  const groupRecordsByDate = useMemo(() => {
    const grouped: { [key: string]: StudyRecord[] } = {};
    records.forEach((record) => {
      const date = formatDate(record.study_date);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    return grouped;
  }, [records, formatDate]);

  const getTodayRecords = useMemo(() => {
    const today = new Date().toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
    return records.filter((r) => formatDate(r.study_date) === today);
  }, [records, formatDate]);

  return {
    records,
    stats,
    loading,
    groupRecordsByDate,
    getTodayRecords,
    formatDate,
    formatTime,
  };
}

