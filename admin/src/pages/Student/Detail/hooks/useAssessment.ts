import { useRequest } from 'ahooks';

import { StudentApi } from '@/services/student';

export function useAssessment(id?: string) {
  const {
    data,
    loading,
    refresh,
  } = useRequest(() => StudentApi.getAssessments(id!, 30), {
    ready: !!id,
  });

  return {
    assessments: data?.data || [],
    loading,
    refresh,
  };
}

