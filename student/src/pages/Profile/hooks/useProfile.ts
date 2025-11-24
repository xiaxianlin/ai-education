/**
 * 个人信息页面逻辑 Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { profileApi, StudentProfile } from '@/services/profile';
import { toast } from 'sonner';
import { useApiError } from '@/lib/hooks/useApiError';

export function useProfile() {
  const { handleError } = useApiError();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await profileApi.getProfile();
      setProfile(profileData);
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

