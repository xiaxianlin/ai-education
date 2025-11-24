/**
 * 个人信息页面逻辑 Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '@/services/profile';
import type { CheckAuthResponse } from '@/lib/types/schema';
import { useApiError } from '@/lib/hooks/useApiError';

export function useProfile() {
  const { handleError } = useApiError();
  const [profile, setProfile] = useState<CheckAuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileApi.check();
      setProfile(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    profile,
    loading,
  };
}

