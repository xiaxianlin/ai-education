/**
 * 练习结果页面逻辑 Hook
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { practiceService } from '@/services/practice';
import { profileApi } from '@/services/profile';

export function usePracticeResult() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<PracticeSessionDetail | null>(null);
  const [unitName, setUnitName] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadResult();
    }
  }, [sessionId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionIdNum = parseInt(sessionId!);
      const data = await practiceService.getSessionDetail(sessionIdNum);
      setSessionData(data);

      // 如果是单元练习，获取单元名称
      if (data.session.session_type === 'unit_practice' && data.session.target_id) {
        try {
          const units = await profileApi.getUnits();
          const unit = units.find(u => u.id === data.session.target_id);
          if (unit) {
            setUnitName(unit.name);
          }
        } catch (err) {
          console.error('Failed to load unit name:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load practice result:', err);
      setError(err instanceof Error ? err.message : '加载练习结果失败');
    } finally {
      setLoading(false);
    }
  };

  const report = sessionData?.report || null;

  return {
    loading,
    sessionData,
    unitName,
    report,
    error,
  };
}

