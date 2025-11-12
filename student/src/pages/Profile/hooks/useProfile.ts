/**
 * 个人信息页面逻辑 Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { profileApi, StudentProfile, StudentStats } from '@/services/profile';
import { toast } from 'sonner';
import { useApiError } from '@/lib/hooks/useApiError';

export function useProfile() {
  const { handleError } = useApiError();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getStats(),
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    profile,
    stats,
    loading,
  };
}

